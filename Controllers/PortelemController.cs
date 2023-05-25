using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;
using TriangleDbRepository;
//using static System.Net.WebRequestMethods;

namespace TriangleProject.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PortelemController : ControllerBase
    {
        private readonly DbRepository _db;
        private readonly IConfiguration _config;
        private readonly HttpClient _http;

        public PortelemController(DbRepository db, IConfiguration config)
        {
            _db = db;
            _config = config;
            _http = new HttpClient();
        }

        [HttpGet]
        public async Task<IActionResult> GetPortelem()
        {
            var configData = _config.GetSection("PortelemData");
            DataForSystem data = new DataForSystem()
            {
                SystemId = configData.GetValue("SystemId", 0),
                Url = configData.GetValue("Url", string.Empty)
            };

            if (data.SystemId == 0 || string.IsNullOrEmpty(data.Url))
            {
                return BadRequest("no data found");
            }

            //using (HttpClient client = new HttpClient()) {
            var PortelemResponse = await _http.GetAsync(data.Url + "api/Services/status/" + data.SystemId);

            if (!PortelemResponse.IsSuccessStatusCode)
            {
                return BadRequest("no service found in portelem");
            }

            string systemStatus = PortelemResponse.Content.ReadAsStringAsync().Result;

            if (systemStatus != "QA" && systemStatus != "Complete") //complete or QA - need cookie check
            {
                UserFromPortelem devUser = new UserFromPortelem();
                devUser.PortelemId = -1;
                int devUserId = await loginFunc(devUser);
                if (devUserId == 0)
                    return BadRequest("insert fail");
                return Ok(devUserId);
            }

            var token = Request.Cookies["token"];
            if (token == null)
                return BadRequest($"{data.Url}login/{data.SystemId}");

            IEnumerable<Claim> claims = ParseClaimsFromJwt(token);
            long exp = (long)Convert.ToDouble(claims.SingleOrDefault(c => c.Type == "exp").Value);
            long now = new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds();
            //if token is not expired
            if (exp <= now)
            {
                return BadRequest($"{data.Url}login/{data.SystemId}");
                //token is expired - redirect to portelem login
            }

            int portelemId = Convert.ToInt32(claims.SingleOrDefault(c => c.Type == "nameid").Value);

            //sent Http request to the portelem -> check if the user is logged in to portelem
            HttpResponseMessage checkPortelem;
            using (var requestMessage = new HttpRequestMessage(HttpMethod.Get, data.Url + "api/services/students/" + data.SystemId + "/" + portelemId))
            {
                requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                checkPortelem = await _http.SendAsync(requestMessage);
            }

            if (!checkPortelem.IsSuccessStatusCode)
            {
                return BadRequest($"{data.Url}login/{data.SystemId}");
                //Unauthorize/no user - redirect to portelem login
            }

            UserFromPortelem studentUser = checkPortelem.Content.ReadFromJsonAsync<UserFromPortelem>().Result;
            int userId = await loginFunc(studentUser);
            if (userId == 0)
                return BadRequest("insert fail");
            return Ok(userId);
            //}
        }
        private async Task<int> loginFunc(UserFromPortelem user)
        {
            object getParam = new
            {
                portelemId = user.PortelemId
            };
            //Change base on your tables
            //להתאים לטבלה שלנו
            string getQuery = "SELECT Id FROM user WHERE PortelemId = @portelemId";
            var getRecords = await _db.GetRecordsAsync<int>(getQuery, getParam);
            int userId = getRecords.FirstOrDefault();
            if (userId == 0)
            {
                //להתאים לטבלה שלנו
                string insertQuery = "INSERT INTO User (FirstName, LastName, PortelemId) VALUES (@FirstName, @LastName, @PortelemId)";
                userId = await _db.InsertReturnId(insertQuery, user);
                if (userId == 0)
                    return 0;
            }

            HttpContext.Session.SetInt32("userId", userId);
            return userId;
        }

        private IEnumerable<Claim> ParseClaimsFromJwt(string jwt)
        {
            var claims = new List<Claim>();
            var payload = jwt.Split('.')[1];

            var jsonBytes = ParseBase64WithoutPadding(payload);

            var keyValuePairs = JsonSerializer.Deserialize<Dictionary<string, object>>(jsonBytes);

            ExtractRolesFromJWT(claims, keyValuePairs);

            claims.AddRange(keyValuePairs.Select(kvp => new Claim(kvp.Key, kvp.Value.ToString())));

            return claims;
        }

        private void ExtractRolesFromJWT(List<Claim> claims, Dictionary<string, object> keyValuePairs)
        {
            keyValuePairs.TryGetValue(ClaimTypes.Role, out object roles);
            if (roles != null)
            {
                var parsedRoles = roles.ToString().Trim().TrimStart('[').TrimEnd(']').Split(',');
                if (parsedRoles.Length > 1)
                {
                    foreach (var parsedRole in parsedRoles)
                    {
                        claims.Add(new Claim(ClaimTypes.Role, parsedRole.Trim('"')));
                    }
                }
                else
                {
                    claims.Add(new Claim(ClaimTypes.Role, parsedRoles[0]));
                }
                keyValuePairs.Remove(ClaimTypes.Role);
            }
        }

        private byte[] ParseBase64WithoutPadding(string base64)
        {
            switch (base64.Length % 4)
            {
                case 2: base64 += "=="; break;
                case 3: base64 += "="; break;
            }
            return Convert.FromBase64String(base64);
        }
    }

    public class DataForSystem
    {
        public int SystemId { get; set; }
        public string Url { get; set; }
    }

    public class UserFromPortelem
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int PortelemId { get; set; }
    }
}
