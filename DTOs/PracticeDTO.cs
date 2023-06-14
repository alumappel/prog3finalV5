using System.Security.Permissions;

namespace prog3finalV4.DTOs
{
    public class PracticeDTO
    {

        public int Id { get; set; }
        public string? practice_name { get; set; }
        public DateTime date { get; set; }
        public int overall_length { get; set; }        
        public List<movmentDataDTO> movmentData { get; set; }
        public List<audioDataDTO> audioData { get; set; }

        public int userId { get; set; }

        public PracticeDTO()
        {
            movmentData = new List<movmentDataDTO>();
            audioData = new List<audioDataDTO>();
        }

    }
}
