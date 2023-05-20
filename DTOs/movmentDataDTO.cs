namespace prog3finalV4.DTOs
{
    public class movmentDataDTO
    {
        public int Id { get; set; }
        public bool frameStateOK { get; set; }
        public bool eyesStateOK { get; set; }
        public string? rightHandState { get; set; }
        public string? leftHandState { get; set; }
        public int practiceId { get; set; }
    }
}
