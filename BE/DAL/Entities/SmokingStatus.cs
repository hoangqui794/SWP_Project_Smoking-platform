using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Smoking.DAL.Entities
{
    public class SmokingStatus
    {
        [Key]
        public int SmokingStatusID { get; set; }

        [Required]
        public int UserID { get; set; }
        public User User { get; set; }

        public int CigarettesPerDay { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal MonthlyCost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PricePerPack { get; set; }

        public DateTime LastUpdated { get; set; } = DateTime.Now;
    }
}
