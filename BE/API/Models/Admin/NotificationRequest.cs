namespace Smoking.API.Models.Admin
{
    public class NotificationRequest
    {
        public string Target { get; set; }  // All, User, Role
        public int? UserId { get; set; }
        public int? RoleId { get; set; }
        public string Message { get; set; }
    }
}
