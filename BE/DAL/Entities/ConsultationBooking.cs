using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Smoking.DAL.Entities
{
    [Table("ConsultationBooking")]
    public class ConsultationBooking
    {
        [Key]
        public int BookingID { get; set; }

        [Required]
        public int UserID { get; set; }
        public User User { get; set; }

        [Required]
        public int CoachID { get; set; }
        public User Coach { get; set; }

        [Required]
        public DateTime BookingDate { get; set; }

        [Required]
        public int Duration { get; set; }

        [Required]
        [RegularExpression("Pending|Confirmed|Cancelled|Completed")]
        public string Status { get; set; }

        public string? MeetingLink { get; set; }  // Nullable string
        public string? Notes { get; set; }  // Nullable string
        public string? CoachNotes { get; set; }  // Nullable string

        [MaxLength(50)]
        public string? PreferredLanguage { get; set; }  // Nullable string

        public bool ReminderSent { get; set; } = false;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}