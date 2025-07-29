using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Smoking.DAL.Entities
{
    [Table("Achievement")]
    public class Achievement
    {

        [Key]
        public int AchievementID { get; set; }

        [Required, MaxLength(255)]
        public string AchievementName { get; set; }

        public string? Description { get; set; }
        public string? Criteria { get; set; }
        public string? BadgeImage { get; set; }
        public string? PackageType { get; set; }

        public int? SmokeFreeDaysRequired { get; set; }
        public decimal? MoneySavedRequired { get; set; }
        public int? CigarettesDroppedRequired { get; set; }
        public int? CheckinDaysRequired { get; set; }

        public ICollection<UserAchievement> UserAchievements { get; set; }
    }
}
