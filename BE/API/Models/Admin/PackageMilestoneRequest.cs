namespace Smoking.API.Models.Admin
{
    public class PackageMilestoneRequest
    {
        public int PackageID { get; set; }
        public int MilestoneID { get; set; }
        public string DetailDescription { get; set; }
    }

}
