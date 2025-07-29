namespace Smoking.API.Models.Admin
{
    public class CreateUserRequest
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string PhoneNumber { get; set; }
        public int RoleID { get; set; } // Cho phép Admin chọn RoleID (1 = Admin, 2 = User, v.v.)
    }
}
