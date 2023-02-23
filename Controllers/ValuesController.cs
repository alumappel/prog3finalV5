using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using prog3finalV4.DTOs;
using TriangleDbRepository;

namespace prog3finalV4.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionsController : ControllerBase
    {
        private readonly DbRepository _db;

        public QuestionsController(DbRepository db)
        {
            _db = db;
        }


        [HttpGet]
        public async Task<IActionResult> GetPractices()
        {
            ////יצירת אובייקט חדש בשם param
            //object param = new
            //{
            //    //הוספת תכונה לאובייקט
            //    subject = "חשבון"
            //};

            //העברת הערך של התכונה בתוך השאילתה
            string query = "SELECT * from practices";

            //פנייה לשיטה בקובץ העזר שיצרנו והחזרת רשימת השאלות
            var records = await _db.GetRecordsAsync<PracticeDTO>(query, new object { });

            //יצירת רשימה בהתאם ל-DTO שיצרנו
            List<PracticeDTO> preacticesList = records.ToList();
            return Ok(preacticesList);
        }









    }



}
