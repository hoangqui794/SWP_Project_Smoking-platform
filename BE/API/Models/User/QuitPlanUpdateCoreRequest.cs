namespace Smoking.API.Models.User
{
    public class QuitPlanUpdateCoreRequest
    {
        public int? CigarettesPerDayAtStart { get; set; }
        public decimal? PricePerPackAtStart { get; set; }
        public int? CigarettesPerPack { get; set; }
        public int? TargetDurationInMonths { get; set; }
    }

    public class QuitPlanResponse
    {
        public int QuitPlanId { get; set; }
        public int CigarettesPerDayAtStart { get; set; }
        public decimal PricePerPackAtStart { get; set; }
        public int CigarettesPerPack { get; set; }
        public string Status { get; set; }
        public string StartDate { get; set; }
        public string? EndDate { get; set; }
    }


}
