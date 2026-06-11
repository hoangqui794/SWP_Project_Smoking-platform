using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Smoking.DAL.Entities
{
    [Table("QuitPlan")]
    public class QuitPlan
    {
        [Key]
        public int QuitPlanID { get; set; }

        [Required]
        public int UserID { get; set; }

        public virtual User User { get; set; }  // Nếu dùng lazy loading

        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public int CigarettesPerDayAtStart { get; set; }

        public decimal PricePerPackAtStart { get; set; }

        public int CigarettesPerPack { get; set; }

        public string PlanDetails { get; set; }

        public string Reason { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Active";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public virtual ICollection<QuitProgress> QuitProgresses { get; set; }

    }
}
