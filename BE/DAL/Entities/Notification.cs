using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Smoking.DAL.Entities
{
    [Table("Notification")]
    public class Notification
    {
        [Key]
        public int NotificationID { get; set; }

        [Required]
        public int UserID { get; set; }
        public User User { get; set; } // M?i quan h? v?i User

        [Required]
        public string Message { get; set; }  // Mô t? thông báo

        public DateTime NotificationDate { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }


        [Required, MaxLength(50)]
        public string NotificationType { get; set; }  // Lo?i thông báo (ví d?: thông báo h? th?ng, nh?c nh?)

        public DateTime SentAt { get; set; } = DateTime.UtcNow; // Ngày g?i

        // Các tru?ng b? sung
        public string NotificationName { get; set; }  // Tên thông báo
        public string Condition { get; set; }        // Ði?u ki?n (có th? là tr?ng thái, ví d? "Ch? x? lý", "Ðã g?i")
        public string NotificationFor { get; set; }   // Thông báo cho (ví d?: toàn b? ngu?i dùng, theo vai trò, theo email)
        public string CreatedBy { get; set; }         // L?p b?i (thu?ng là tên admin ho?c h? th?ng)
    }
}
