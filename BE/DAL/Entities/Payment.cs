using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Smoking.DAL.Entities
{
    [Table("Payment")]
    public class Payment
    {
        [Key]
        public int PaymentID { get; set; }

        // Foreign Key: User
        [Required]
        public int UserID { get; set; }

        [ForeignKey("UserID")]
        public virtual User User { get; set; } = null!;

        // Foreign Key: MembershipPackage
        [Required]
        public int PackageID { get; set; }

        [ForeignKey("PackageID")]
        public virtual MembershipPackage Package { get; set; } = null!;

        // Foreign Key: UserMembership (nullable vì ch? có khi thanh toán thành công)
        public int? UserMembershipID { get; set; }

        [ForeignKey("UserMembershipID")]
        public virtual UserMembership? UserMembership { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        [Required, MaxLength(50)]
        public string PaymentMethod { get; set; } = null!;

        [Required, MaxLength(50)]
        public string Status { get; set; } = null!;

        [MaxLength(255)]
        public string TransactionReference { get; set; } = null!;
    }
}
