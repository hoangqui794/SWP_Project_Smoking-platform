namespace Smoking.API.Models.User
{
    public class UpdateProfileRequest
    {
        public string Email { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string ProfilePicture { get; set; }
        public string Description { get; set; }
        public string Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }

    public class DeleteUserRequest
    {
        public string Email { get; set; }
    }
}
