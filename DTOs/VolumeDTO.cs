namespace prog3finalV4.DTOs
{
    public class VolumeDTO
    {
        public int Id { get; set; }
        public double measurement_time { get; set; }
        public double volume_avg { get; set; }
        public double good_performance_time_percent { get; set; }
        public double too_loud_performance_time_percent { get; set; }
        public double too_quiet_performance_time_percent { get; set; }
        public int practices_Id { get; set; }
    }
}
