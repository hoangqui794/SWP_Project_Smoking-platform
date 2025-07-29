namespace Smoking.API.Models.Admin
{
    public class AdminUserMembershipDto
    {
        public int UserMembershipID { get; set; }
        public int UserID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PackageName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
    }

    public class AdminUpdateMembershipDto
    {
        public int UserId { get; set; }
        public int PackageId { get; set; }
    }

    public class AdminPackageWithCountDto
    {
        public int PackageId { get; set; }
        public string PackageName { get; set; } = string.Empty;
        public int Duration { get; set; }
        public decimal Price { get; set; }
        public int PurchasedCount { get; set; }
    }
}
