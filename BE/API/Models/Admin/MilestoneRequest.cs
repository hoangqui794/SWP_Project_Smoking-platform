namespace Smoking.API.Models.Admin
{
    public class MilestoneRequest
    {
        public int MilestoneGroupID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int MilestoneTime { get; set; }
        public string TimeUnit { get; set; }
        public int Percent { get; set; }
    }
}
