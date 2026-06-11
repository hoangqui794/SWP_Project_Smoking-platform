using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Smoking.DAL.Entities
{
    [Table("QuitProgress")]
    public class QuitProgress
    {
        [Key]
        public int ProgressID { get; set; }

        [Required]
        public int QuitPlanID { get; set; }  // Khóa ngo?i liên k?t v?i QuitPlan
        public QuitPlan QuitPlan { get; set; }

        public DateTime ProgressDate { get; set; }

        // ? S? di?u ngu?i dùng khai báo ban d?u m?i ngày
        public int CigarettesPerDayBaseline { get; set; }

        // ? Ti?n ti?t ki?m hôm dó
        public decimal MoneySaved { get; set; }

        public string Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastSmokeDate { get; set; }

        // ? S? thu?c dã hút trong ngày
        public int? CigarettesSmokedToday { get; set; }

        // ? S? thu?c dã b? hôm dó = baseline - dã hút
        public int? CigarettesDropped { get; set; }
        public int? TotalCigarettesDropped { get; set; }
        public decimal? TotalMoneySaved { get; set; }


    }
}
