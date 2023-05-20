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
        public async Task<ActionResult<List<PracticeDTO>>> GetAllPracticesById()
        {
            //שורה שבודקת אם הסשן חי
            int? sessionId = HttpContext.Session.GetInt32("userId");
            //לבדוק אם זה לא null ואז אפשר להמשיך לשלבים הבאים
            if (sessionId != null)
            {
                //שליפת אימונים
                string practicequery = "SELECT * from practices WHERE userId=@sessionId";
                var practicesRecords = await _db.GetRecordsAsync<PracticeDTO>(practicequery, new { sessionId });
                //שליפת תנועה
                string movmentquery = "SELECT * from movment_data";
                var moveRecords = await _db.GetRecordsAsync<movmentDataDTO>(movmentquery, new object { });
                //שליפת אודיו'
                string audioquery = "SELECT * FROM audio_data;";
                var audioRecords = await _db.GetRecordsAsync<audioDataDTO>(audioquery, new object { });


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
                    foreach (audioDataDTO a in audioRecords)
                    {
                        if (a.practiceId == p.Id)
                        {
                            p.audioData.Add(a);
                        }
                    }
                }

                //המרה לרשימה והחזרה
                List<PracticeDTO> preacticesList = practicesRecords.ToList();
                return Ok(preacticesList);
            }
            else
            {
                return BadRequest("no open session");
            }
        }

        //עדכון שם אימון
        [HttpPost("UpdatePracticeName")]
        public async Task<IActionResult> UpdatePracticeName(PracticeDTO PracticeToUpdate)
        {
            //שורה שבודקת אם הסשן חי
            int? sessionId = HttpContext.Session.GetInt32("userId");
            //לבדוק אם זה לא null ואז אפשר להמשיך לשלבים הבאים
            if (sessionId != null)
            {

                if (PracticeToUpdate.Id > 0)
                {
                    string query = "UPDATE practices SET practice_name = @practice_name WHERE id =@Id";

                    bool isQuestionUpdated = await _db.SaveDataAsync(query, PracticeToUpdate);

                    if (isQuestionUpdated == true)
                    {
                        return Ok();
                    }
                    else
                    {
                        return BadRequest("Question Update Failed");
                    }
                }
                else
                {
                    return BadRequest("ID not sent");
                }
            }
            else
            {
                return BadRequest("no open session");
            }
        }

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


        //////שמירת אימון חדש
        ////[HttpPost("InsertPractice")]
        //////הפונקציה מקבלת כפרמטר את השאלה
        ////public async Task<IActionResult> InsertPractice(PracticeDTO practice)
        ////{
        ////    //שורה שבודקת אם הסשן חי
        ////    int? sessionId = HttpContext.Session.GetInt32("userId");
        ////    //לבדוק אם זה לא null ואז אפשר להמשיך לשלבים הבאים
        ////    if (sessionId != null)
        ////    {
        ////        //כתיבת שאילתת ההוספה עם כל שדות השאלה פרט למזהה שמתווסף אוטומטית
        ////        string query = "INSERT INTO practices (practice_name, date, overall_length) VALUES (@practice_name, @date, @overall_length);";
        ////        //קריאה לקובץ DbRepository, שליחת השאילתה והשאלה והחזרת המזהה של השאלה החדשה שנוצרה
        ////        int newpracticeId = await _db.InsertReturnId(query, practice);
        ////        //במידה והמזהה גדול מ-0, כלומר, ההוספה הצליחה
        ////        if (newpracticeId > 0)
        ////        {

        ////            //בדיקה שנעשתה מדידה
        ////            //עדכון ID בכל אחת מהתת טבלאות 
        ////            //שמירה בטבלה המתאימה
        ////            //בדיקת שגיאה
        ////            if (practice.movmentData.Count > 0)
        ////            {
        ////                foreach (movmentDataDTO m in practice.movmentData)
        ////                {
        ////                    m.practiceId = newpracticeId;
        ////                }
        ////                string Lquery = "INSERT INTO location_in_frame (frameStateOK,eyesStateOK,rightHandState,leftHandState,practiceId) VALUES (@frameStateOK,@eyesStateOK,@rightHandState,@leftHandState,@practiceId)";
        ////                bool isSaved = await _db.SaveDataAsync(Lquery, practice.movmentData);
        ////                if (isSaved != true)
        ////                {
        ////                    return BadRequest("save location failed");
        ////                }
        ////            }
        ////            if (practice.pitch.measurement_time > 0)
        ////            {
        ////                practice.pitch.practices_Id = newpracticeId;
        ////                string piquery = "INSERT INTO pitch (measurement_time,good_performance_time_percent,practices_Id) VALUES (@measurement_time,@good_performance_time_percent,@practices_Id)";
        ////                bool isSaved = await _db.SaveDataAsync(piquery, practice.pitch);
        ////                if (isSaved != true)
        ////                {
        ////                    return BadRequest("save pitch failed");
        ////                }
        ////            }
        ////            if (practice.volume.measurement_time > 0)
        ////            {
        ////                practice.volume.practices_Id = newpracticeId;
        ////                string vquery = "INSERT INTO volume (measurement_time,volume_avg,good_performance_time_percent,too_loud_performance_time_percent,too_quiet_performance_time_percent,practices_Id) VALUES (@measurement_time,@volume_avg,@good_performance_time_percent,@too_loud_performance_time_percent,@too_quiet_performance_time_percent,@practices_Id)";
        ////                bool isSaved = await _db.SaveDataAsync(vquery, practice.volume);
        ////                if (isSaved != true)
        ////                {
        ////                    return BadRequest("save volume failed");
        ////                }
        ////            }
        ////            return Ok("The practice: " + practice.practice_name + " was added successfully");



        ////        }
        ////        return BadRequest("The question was not saved");
        ////    }
        ////    else
        ////    {
        ////        return BadRequest("no open session");
        ////    }
        ////}

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
                string query = "INSERT INTO practices (practice_name, date, overall_length,userId) VALUES (@practice_name, @date, @overall_length,@userId);";
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
                        // Prepare the bulk insert query
                        string Mquery = "INSERT INTO movment_data (frameStateOK,eyesStateOK,rightHandState,leftHandState,practiceId) VALUES ";

                        // Prepare the parameter values list
                        List<object> parameterValues = new List<object>();

                        // Generate the parameter placeholders and collect the parameter values
                        string parameterPlaceholders = string.Join(",", Enumerable.Range(0, practice.movmentData.Count)
                            .Select(index =>
                            {
                                movmentDataDTO m = practice.movmentData[index];
                                m.practiceId = newpracticeId;
                                parameterValues.AddRange(new object[]
                                {
                m.frameStateOK,
            m.eyesStateOK,
            m.rightHandState,
            m.leftHandState,
            m.practiceId
                                });
                                return $"(@frameStateOK{index}, @eyesStateOK{index}, @rightHandState{index}, @leftHandState{index}, @practiceId{index})";
                            }));

                        // Combine the query and parameter placeholders
                        Mquery += parameterPlaceholders;

                        // Perform the bulk insert
                        bool isSaved = await _db.SaveDataAsync(Mquery, parameterValues.ToArray());
                        if (!isSaved)
                        {
                            return BadRequest("Save location failed");
                        }
                    }
                    if (practice.audioData.Count > 0)
                    {
                        // Prepare the bulk insert query
                        string Aquery = "INSERT INTO audio_data (averageVolumeForMeter,pichMax,pichMin,practiceId) VALUES ";

                        // Prepare the parameter values list
                        List<object> AparameterValues = new List<object>();

                        // Generate the parameter placeholders and collect the parameter values
                        string AparameterPlaceholders = string.Join(",", Enumerable.Range(0, practice.audioData.Count)
                            .Select(index =>
                            {
                                audioDataDTO a = practice.audioData[index];
                                a.practiceId = newpracticeId;
                                AparameterValues.AddRange(new object[]
                                {
                a.averageVolumeForMeter,
            a.pichMax,
            a.pichMin,
            a.practiceId
                                });
                                return $"(@averageVolumeForMeter{index}, @pichMax{index}, @pichMin{index}, @practiceId{index})";
                            }));

                        // Combine the query and parameter placeholders
                        Aquery += AparameterPlaceholders;

                        // Perform the bulk insert
                        bool isSaved = await _db.SaveDataAsync(Aquery, AparameterValues.ToArray());
                        if (!isSaved)
                        {
                            return BadRequest("Save location failed");
                        }
                    }
                    
                    return Ok("The practice: " + practice.practice_name + " was added successfully");



                }
                return BadRequest("The question was not saved");
            }
            else
            {
                return BadRequest("no open session");
            }
        }



















    }
}
