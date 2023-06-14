namespace prog3finalV4.DTOs
{
    public class testingPracticeDTO
    {

        public int Id { get; set; }
        public int? practice_name { get; set; }        
        public int overall_length { get; set; }
        public float video_height { get; set; }
        public float video_width { get; set; }



        public List<testingMovmentDTO> movmentData { get; set; }
        public List<testingAudioDTO> audioData { get; set; }



        public testingPracticeDTO()
        {
            movmentData = new List<testingMovmentDTO>();
            audioData = new List<testingAudioDTO>();
        }


    }
}
