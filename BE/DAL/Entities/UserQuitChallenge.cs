using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Smoking.DAL.Entities
{
    [Table("UserQuitChallenge")]
    public class UserQuitChallenge
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int QuitPlanId { get; set; }

        public DateTime ChallengeDate { get; set; }

        public int TemplateId { get; set; }

        public bool IsCompleted { get; set; } = false;

        public string? Notes { get; set; }

        public DateTime ScheduledDate { get; set; } 

        public User User { get; set; } = null!;

        public QuitPlan QuitPlan { get; set; } = null!;
        public byte[]? ImageData { get; set; }
        public string? ImageContentType { get; set; }

        public QuitChallengeTemplate Template { get; set; } = null!;
    }
}
