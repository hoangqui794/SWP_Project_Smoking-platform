using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Smoking.DAL.Entities
{
    [Table("UserMilestoneProgress")]
    public class UserMilestoneProgress
    {
        public int UserMilestoneID { get; set; }  // Đây là khóa chính

        public int UserID { get; set; }
        public int MilestoneID { get; set; }

        // Sửa DateTime thành DateTime? (nullable DateTime)
        public DateTime? AchievedDate { get; set; }  // Cho phép null nếu người dùng chưa đạt mốc nào

        // Navigation Properties
        public virtual User User { get; set; }
        public virtual Milestone Milestone { get; set; }
    }
}
