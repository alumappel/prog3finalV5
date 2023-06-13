using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Mysqlx.Crud;
using prog3finalV4.DTOs;
using TriangleDbRepository;



namespace prog3finalV4.Controllers
{
    [Route("api/Practices")]
    [ApiController]
    public class PracticesController : ControllerBase
    {
        private readonly DbRepository _db;

        public PracticesController(DbRepository db)
        {
            _db = db;
        }


        //שליפת כל התכנים לפי תרגולים
        [HttpGet("GetAllPracticesById")]
        [AllowAnonymous]
        public async Task<ActionResult<List<PracticeDTO>>> GetAllPracticesById()
        {
            //שורה שבודקת אם הסשן חי
            int? findFromSession = HttpContext.Session.GetInt32("userId");
            Console.WriteLine("findall: " + findFromSession.ToString());

            int? sessionId = HttpContext.Session.GetInt32("userId");
            //לבדוק אם זה לא null ואז אפשר להמשיך לשלבים הבאים
            if (sessionId != null)
            {
                //שליפת אימונים
                string practicequery = "SELECT * from practices WHERE userId=@sessionId";
                var practicesRecords = await _db.GetRecordsAsync<PracticeDTO>(practicequery, new { sessionId });
                if (practicesRecords != null)
                {
                    //שליפת תנועה
                    string movmentquery = "SELECT * from movment_data";
                    var moveRecords = await _db.GetRecordsAsync<movmentDataDTO>(movmentquery, new object { });
                    if (moveRecords != null)
                    {
                        //קישור בין כל תת טבלה לטבלת האימונים
                        foreach (PracticeDTO p in practicesRecords)
                        {
                            foreach (movmentDataDTO m in moveRecords)
                            {
                                if (m.practiceId == p.Id)
                                {
                                    p.movmentData.Add(m);
                                }
                            }
                        }

                    }

                    //שליפת אודיו'
                    string audioquery = "SELECT * FROM audio_data;";
                    var audioRecords = await _db.GetRecordsAsync<audioDataDTO>(audioquery, new object { });
                    if (audioRecords != null)
                    {

                        //קישור בין כל תת טבלה לטבלת האימונים
                        foreach (PracticeDTO p in practicesRecords)
                        {
                            foreach (audioDataDTO a in audioRecords)
                            {
                                if (a.practiceId == p.Id)
                                {
                                    p.audioData.Add(a);
                                }
                            }
                        }
                    }

                    //המרה לרשימה והחזרה
                    List<PracticeDTO> preacticesList = practicesRecords.ToList();
                    return Ok(preacticesList);
                }
                return BadRequest("no practices");
            }
            else
            {
                return BadRequest("no open session");
            }
        }

        //שליפה של שם משתמש
        [HttpGet("GetUserName")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserName()
        {
            int? findFromSession = HttpContext.Session.GetInt32("userId");
            Console.WriteLine("findname: " + findFromSession.ToString());

            //שורה שבודקת אם הסשן חי
            int? sessionId = HttpContext.Session.GetInt32("userId");
            //לבדוק אם זה לא null ואז אפשר להמשיך לשלבים הבאים
            if (sessionId != null)
            {
                //שליפת המשתמש
                string userquery = "SELECT * FROM user where Id=@sessionId";
                var usersRecords = await _db.GetRecordsAsync<UserDTO>(userquery, new { sessionId });
                if (usersRecords != null)
                {
                    foreach (UserDTO u in usersRecords)
                    {
                        string userName = u.FirstName;
                        return Ok(userName);
                    }
                    return BadRequest("no user fond");

                }
                else
                {
                    return BadRequest("no user fond");
                }
;
            }
            else
            {
                return BadRequest("no open session");
            }
        }

        ////עדכון שם אימון
        //[HttpPost("UpdatePracticeName")]
        //public async Task<IActionResult> UpdatePracticeName(PracticeDTO PracticeToUpdate)
        //{
        //    //שורה שבודקת אם הסשן חי
        //    int? sessionId = HttpContext.Session.GetInt32("userId");
        //    //לבדוק אם זה לא null ואז אפשר להמשיך לשלבים הבאים
        //    if (sessionId != null)
        //    {

        //        if (PracticeToUpdate.Id > 0)
        //        {
        //            string query = "UPDATE practices SET practice_name = @practice_name WHERE id =@Id";

        //            bool isQuestionUpdated = await _db.SaveDataAsync(query, PracticeToUpdate);

        //            if (isQuestionUpdated == true)
        //            {
        //                return Ok();
        //            }
        //            else
        //            {
        //                return BadRequest("Question Update Failed");
        //            }
        //        }
        //        else
        //        {
        //            return BadRequest("ID not sent");
        //        }
        //    }
        //    else
        //    {
        //        return BadRequest("no open session");
        //    }
        //}

        //מחיקת אימון
        [HttpDelete("PracticeIdToDelete")]
        public async Task<IActionResult> PracticeIdToDelete(int idToDelete)
        {

            //שורה שבודקת אם הסשן חי
            int? sessionId = HttpContext.Session.GetInt32("userId");
            //לבדוק אם זה לא null ואז אפשר להמשיך לשלבים הבאים
            if (sessionId != null)
            {
                //יצירת פרמטרים לשאילתה
                object param = new
                {
                    id = idToDelete
                };
                //יצירת השאילתה
                string query = "DELETE FROM practices WHERE ID=@id";
                //קריאה לקובץ DbRepository ושליחת השאילתה והפרמטרים
                bool isDeleted = await _db.SaveDataAsync(query, param);
                //במידה ומוחזר true, נחזיר תשובה חיובית ללקוח
                if (isDeleted == true)
                {
                    return Ok();
                }
                //במידה ומוחזר false, נחזיר שגיאה
                else
                {
                    return BadRequest("Delete failed");
                }
            }
            else
            {
                return BadRequest("no open session");
            }
        }





        //שמירת אימון חדש
        [HttpPost("InsertPractice")]
        //הפונקציה מקבלת כפרמטר את השאלה
        public async Task<IActionResult> InsertPractice(PracticeDTO practice)
        {
            //שורה שבודקת אם הסשן חי
            int? sessionId = HttpContext.Session.GetInt32("userId");
            //לבדוק אם זה לא null ואז אפשר להמשיך לשלבים הבאים
            if (sessionId != null)
            {
                practice.userId = (int)sessionId;
                //כתיבת שאילתת ההוספה עם כל שדות השאלה פרט למזהה שמתווסף אוטומטית
                string query = "INSERT INTO practices (practice_name, date, overall_length,userId) VALUES (@practice_name, @date, @overall_length,@userId)";
                //קריאה לקובץ DbRepository, שליחת השאילתה והשאלה והחזרת המזהה של השאלה החדשה שנוצרה
                int newpracticeId = await _db.InsertReturnId(query, practice);
                //במידה והמזהה גדול מ-0, כלומר, ההוספה הצליחה
                if (newpracticeId > 0)
                {

                    //בדיקה שנעשתה מדידה
                    //עדכון ID בכל אחת מהתת טבלאות 
                    //שמירה בטבלה המתאימה
                    //בדיקת שגיאה
                    if (practice.movmentData.Count > 0)
                    {
                        foreach (movmentDataDTO m in practice.movmentData)
                        {
                            m.practiceId = newpracticeId;

                            string Mquery = "INSERT INTO movment_data (frameStateOK,eyesStateOK,rightHandState,leftHandState,practiceId) VALUES (@frameStateOK,@eyesStateOK,@rightHandState,@leftHandState,@practiceId)";
                            bool isSaved = await _db.SaveDataAsync(Mquery, m);
                            if (isSaved != true)
                            {
                                return BadRequest("save movment failed");
                            }
                        }
                    }
                    if (practice.audioData.Count > 0)
                    {
                        foreach (audioDataDTO a in practice.audioData)
                        {
                            a.practiceId = newpracticeId;

                            string Aquery = "INSERT INTO audio_data (averageVolumeForMeter,pichMax,pichMin,practiceId) VALUES (@averageVolumeForMeter,@pichMax,@pichMin,@practiceId)";
                            bool isSaved = await _db.SaveDataAsync(Aquery, a);
                            if (isSaved != true)
                            {
                                return BadRequest("save audio failed");
                            }
                        }

                    }

                    return Ok(newpracticeId);



                }
                return BadRequest("The question was not saved");
            }
            else
            {
                return BadRequest("no open session");
            }
        }


        //שליפת כל התכנים של תרגול
        [HttpGet("GetByPracticId")]
        [AllowAnonymous]
        public async Task<ActionResult<PracticeDTO>> GetByPracticId(int practicId)
        {
            //שורה שבודקת אם הסשן חי
            //int? findFromSession = HttpContext.Session.GetInt32("userId");
            //Console.WriteLine("findall: " + findFromSession.ToString());
            if (practicId != null && practicId > 0)
            {


                int? sessionId = HttpContext.Session.GetInt32("userId");
                //לבדוק אם זה לא null ואז אפשר להמשיך לשלבים הבאים
                if (sessionId != null)
                {
                    //יצירת פרמטרים לשאילתה
                    object param = new
                    {
                        id = practicId
                    };
                    //שליפת אימונים
                    string practicequery = "select * from practices where Id=@id";
                    var practicesRecords = await _db.GetRecordsAsync<PracticeDTO>(practicequery, param);

                    if (practicesRecords != null)
                    {
                        var practiceRecord = practicesRecords.FirstOrDefault();

                        //שליפת תנועה
                        string movmentquery = "SELECT * from movment_data where practiceId=@id";
                        var moveRecords = await _db.GetRecordsAsync<movmentDataDTO>(movmentquery, param);
                        if (moveRecords != null)
                        {
                            //קישור בין כל תת טבלה לטבלת האימונים
                            foreach (movmentDataDTO m in moveRecords)
                            {
                                if (m.practiceId == practiceRecord.Id)
                                {
                                    practiceRecord.movmentData.Add(m);
                                }
                            }
                        }

                        //שליפת אודיו'
                        string audioquery = "SELECT * FROM audio_data where practiceId=@id";
                        var audioRecords = await _db.GetRecordsAsync<audioDataDTO>(audioquery, param);
                        if (audioRecords != null)
                        {

                            //קישור בין כל תת טבלה לטבלת האימונים

                            foreach (audioDataDTO a in audioRecords)
                            {
                                if (a.practiceId == practiceRecord.Id)
                                {
                                    practiceRecord.audioData.Add(a);
                                }
                            }

                        }

                        //החזרה               
                        return Ok(practiceRecord);
                    }
                    return BadRequest("no practice");
                }
                else
                {
                    return BadRequest("no open session");
                }
            }
            else
            {
                return BadRequest("no id sent");
            }
        }














    }
}
