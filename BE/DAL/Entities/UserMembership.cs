using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Smoking.DAL.Entities
{
    [Table("UserMembership")]
    public class UserMembership
    {
        [Key]
        public int UserMembershipID { get; set; }

        [Required]
        public int UserID { get; set; }

        [ForeignKey("UserID")]
        public User User { get; set; } = null!;

        [Required]
        public int PackageID { get; set; }

        [ForeignKey("PackageID")]
        public MembershipPackage Package { get; set; } = null!;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required, MaxLength(50)]
        public string PaymentStatus { get; set; } = "Pending";

        // Navigation to payments
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
