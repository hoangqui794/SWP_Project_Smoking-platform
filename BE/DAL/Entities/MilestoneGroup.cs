using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.DAL.Entities
{
    [Table("MilestoneGroup")]
    public class MilestoneGroup
    {
        public int MilestoneGroupID { get; set; }
        public string GroupName { get; set; }

        public ICollection<Milestone> Milestones { get; set; }
    }

}
