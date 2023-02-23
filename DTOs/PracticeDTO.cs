namespace prog3finalV4.DTOs
{
    public class PracticeDTO
    {

        public int Id { get; set; }
        public string practice_name { get; set; }
        public DateTime date { get; set; }
        public double overall_length { get; set; }
        public LocationInFrameDTO locationInFrame { get; set; }
        public PitchDTO pitch { get; set; }
        public VolumeDTO volume { get; set; }

    }
}
