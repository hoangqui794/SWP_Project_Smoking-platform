using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Smoking.BLL.Models
{
    public class MilestoneDTO
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Time { get; set; }
        public int Percent { get; set; }
    }

    public class MilestoneGroupDTO
    {
        public string GroupName { get; set; }
        public List<MilestoneDTO> Milestones { get; set; }
    }
}
