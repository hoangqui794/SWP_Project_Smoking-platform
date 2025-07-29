using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.DAL.Entities
{
    [Table("PackageMilestone")]
    public class PackageMilestone
    {
        public int PackageMilestoneID { get; set; }

        public int PackageID { get; set; }
        public int MilestoneID { get; set; }

        public string DetailDescription { get; set; }

        // Navigation
        public MembershipPackage Package { get; set; }
        public Milestone Milestone { get; set; }
    }

}