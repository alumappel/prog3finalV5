namespace prog3finalV4.DTOs
{
    public class audioDataDTO
    {
        public int Id { get; set; }
        public float? averageVolumeForMeter { get; set; }
        public float? pichMax { get; set; }
        public float? pichMin { get; set; }

        public int practiceId { get; set; }
    }
}
