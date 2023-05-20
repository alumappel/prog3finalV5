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
        public async Task<ActionResult<List<PracticeDTO>>> GetAllPracticesById(int userId)
        {
            //שורה שבודקת אם הסשן חי
            int? sessionId = HttpContext.Session.GetInt32("userId");
            //לבדוק אם זה לא null ואז אפשר להמשיך לשלבים הבאים
            if (sessionId != null)
            {
                //יצירת פרמטרים לשאילתה
                object param = new
                {
                    id = userId
                };
                //שליפת אימונים
                string practicequery = "SELECT * from practices WHERE userId=@id";
                var practicesRecords = await _db.GetRecordsAsync<PracticeDTO>(practicequery, param);
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
                            p.movmentData = m;
                        }
                    }
                    foreach (audioDataDTO a in audioRecords)
                    {
                        if (a.practiceId == p.Id)
                        {
                            p.audioData = a;
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

        ////עדכון שם אימון
        //[HttpPost("UpdatePracticeName")]
        //public async Task<IActionResult> UpdatePracticeName(PracticeDTO PracticeToUpdate)
        //{
        //    if (PracticeToUpdate.Id > 0)
        //    {
        //        string query = "UPDATE practices SET practice_name = @practice_name WHERE id =@Id";

        //        bool isQuestionUpdated = await _db.SaveDataAsync(query, PracticeToUpdate);

        //        if (isQuestionUpdated == true)
        //        {
        //            return Ok();
        //        }
        //        else
        //        {
        //            return BadRequest("Question Update Failed");
        //        }
        //    }
        //    else
        //    {
        //        return BadRequest("ID not sent");
        //    }
        //}

        ////מחיקת אימון
        //[HttpDelete("PracticeIdToDelete")]
        //public async Task<IActionResult> PracticeIdToDelete(int idToDelete)
        //{
        //    //יצירת פרמטרים לשאילתה
        //    object param = new
        //    {
        //        id = idToDelete
        //    };
        //    //יצירת השאילתה
        //    string query = "DELETE FROM practices WHERE ID=@id";
        //    //קריאה לקובץ DbRepository ושליחת השאילתה והפרמטרים
        //    bool isDeleted = await _db.SaveDataAsync(query, param);
        //    //במידה ומוחזר true, נחזיר תשובה חיובית ללקוח
        //    if (isDeleted == true)
        //    {
        //        return Ok();
        //    }
        //    //במידה ומוחזר false, נחזיר שגיאה
        //    else
        //    {
        //        return BadRequest("Delete failed");
        //    }
        //}


        ////שמירת אימון חדש
        //[HttpPost("InsertPractice")]
        ////הפונקציה מקבלת כפרמטר את השאלה
        //public async Task<IActionResult> InsertPractice(PracticeDTO practice)
        //{
        //    //כתיבת שאילתת ההוספה עם כל שדות השאלה פרט למזהה שמתווסף אוטומטית
        //    string query = "INSERT INTO practices (practice_name, date, overall_length) VALUES (@practice_name, @date, @overall_length);";
        //    //קריאה לקובץ DbRepository, שליחת השאילתה והשאלה והחזרת המזהה של השאלה החדשה שנוצרה
        //    int newpracticeId = await _db.InsertReturnId(query, practice);
        //    //במידה והמזהה גדול מ-0, כלומר, ההוספה הצליחה
        //    if (newpracticeId > 0)
        //    {

        //        //בדיקה שנעשתה מדידה
        //        //עדכון ID בכל אחת מהתת טבלאות 
        //        //שמירה בטבלה המתאימה
        //        //בדיקת שגיאה
        //        if (practice.locationInFrame.measurement_time > 0)
        //        {
        //            practice.locationInFrame.practices_Id = newpracticeId;
        //            string Lquery = "INSERT INTO location_in_frame (measurement_time,good_performance_time_percent,out_of_frame_performance_time_percent,too_close_performance_time_percent,too_far_performance_time_percent,practices_Id) VALUES (@measurement_time,@good_performance_time_percent,@out_of_frame_performance_time_percent,@too_close_performance_time_percent,@too_far_performance_time_percent,@practices_Id)";
        //            bool isSaved = await _db.SaveDataAsync(Lquery, practice.locationInFrame);
        //            if (isSaved != true)
        //            {
        //                return BadRequest("save location failed");
        //            }
        //        }
        //        if (practice.pitch.measurement_time > 0)
        //        {
        //            practice.pitch.practices_Id = newpracticeId;
        //            string piquery = "INSERT INTO pitch (measurement_time,good_performance_time_percent,practices_Id) VALUES (@measurement_time,@good_performance_time_percent,@practices_Id)";
        //            bool isSaved = await _db.SaveDataAsync(piquery, practice.pitch);
        //            if (isSaved != true)
        //            {
        //                return BadRequest("save pitch failed");
        //            }
        //        }
        //        if (practice.volume.measurement_time > 0)
        //        {
        //            practice.volume.practices_Id = newpracticeId;
        //            string vquery = "INSERT INTO volume (measurement_time,volume_avg,good_performance_time_percent,too_loud_performance_time_percent,too_quiet_performance_time_percent,practices_Id) VALUES (@measurement_time,@volume_avg,@good_performance_time_percent,@too_loud_performance_time_percent,@too_quiet_performance_time_percent,@practices_Id)";
        //            bool isSaved = await _db.SaveDataAsync(vquery, practice.volume);
        //            if (isSaved != true)
        //            {
        //                return BadRequest("save volume failed");
        //            }
        //        }
        //        return Ok("The practice: " + practice.practice_name + " was added successfully");



        //    }
        //    return BadRequest("The question was not saved");
        //}




















    }
}
