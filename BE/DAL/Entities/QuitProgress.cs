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
        public int QuitPlanID { get; set; }  // Khóa ngoại liên kết với QuitPlan
        public QuitPlan QuitPlan { get; set; }

        public DateTime ProgressDate { get; set; }

        // ✅ Số điếu người dùng khai báo ban đầu mỗi ngày
        public int CigarettesPerDayBaseline { get; set; }

        // ✅ Tiền tiết kiệm hôm đó
        public decimal MoneySaved { get; set; }

        public string Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastSmokeDate { get; set; }

        // ✅ Số thuốc đã hút trong ngày
        public int? CigarettesSmokedToday { get; set; }

        // ✅ Số thuốc đã bỏ hôm đó = baseline - đã hút
        public int? CigarettesDropped { get; set; }
        public int? TotalCigarettesDropped { get; set; }
        public decimal? TotalMoneySaved { get; set; }


    }
}
