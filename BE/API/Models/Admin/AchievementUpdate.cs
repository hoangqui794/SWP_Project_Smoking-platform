namespace Smoking.API.Models.Admin
{
    public class AchievementUpdate
    {
        public string AchievementName { get; set; }
        public string? Description { get; set; }
        public string? Criteria { get; set; }
        public string? BadgeImage { get; set; }
        public string? PackageType { get; set; }
        public int? SmokeFreeDaysRequired { get; set; }
        public decimal? MoneySavedRequired { get; set; }
        public int? CigarettesDroppedRequired { get; set; }
        public int? CheckinDaysRequired { get; set; }

    }

}
