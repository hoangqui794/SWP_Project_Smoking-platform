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
        public User User { get; set; } // Mối quan hệ với User

        [Required]
        public string Message { get; set; }  // Mô tả thông báo

        public DateTime NotificationDate { get; set; } = DateTime.Now;
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }


        [Required, MaxLength(50)]
        public string NotificationType { get; set; }  // Loại thông báo (ví dụ: thông báo hệ thống, nhắc nhở)

        public DateTime SentAt { get; set; } = DateTime.Now; // Ngày gửi

        // Các trường bổ sung
        public string NotificationName { get; set; }  // Tên thông báo
        public string Condition { get; set; }        // Điều kiện (có thể là trạng thái, ví dụ "Chờ xử lý", "Đã gửi")
        public string NotificationFor { get; set; }   // Thông báo cho (ví dụ: toàn bộ người dùng, theo vai trò, theo email)
        public string CreatedBy { get; set; }         // Lập bởi (thường là tên admin hoặc hệ thống)
    }
}
