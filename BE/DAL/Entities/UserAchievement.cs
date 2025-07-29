using Smoking.DAL.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("UserAchievement")]
public class UserAchievement
{
    [Key]
    public int UserAchievementID { get; set; }

    [Required]
    public int UserID { get; set; }

    [Required]
    public int AchievementID { get; set; }

    public DateTime AwardedDate { get; set; } = DateTime.Now;

    // Mối quan hệ (navigation properties)
    [ForeignKey("UserID")]
    public User User { get; set; }

    [ForeignKey("AchievementID")]
    public Achievement Achievement { get; set; }
}
