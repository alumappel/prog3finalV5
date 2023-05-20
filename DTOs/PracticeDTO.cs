using System.Security.Permissions;

namespace prog3finalV4.DTOs
{
    public class PracticeDTO
    {

        public int Id { get; set; }
        public string? practice_name { get; set; }
        public DateTime date { get; set; }
        public double overall_length { get; set; }        
        public movmentDataDTO movmentData { get; set; }
        public audioDataDTO audioData { get; set; }

        public int userId { get; set; }

    }
}
