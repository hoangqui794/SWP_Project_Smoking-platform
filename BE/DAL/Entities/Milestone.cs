using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.DAL.Entities
{
    [Table("Milestone")]

    public class Milestone
    {
        public int MilestoneID { get; set; }
        public int MilestoneGroupID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int MilestoneTime { get; set; }
        public string TimeUnit { get; set; }
        public int Percent { get; set; }

        public MilestoneGroup MilestoneGroup { get; set; }

        public virtual ICollection<PackageMilestone> PackageMilestones { get; set; } = new List<PackageMilestone>();
        public virtual ICollection<UserMilestoneProgress> UserMilestoneProgresses { get; set; } = new List<UserMilestoneProgress>();

    }

}
