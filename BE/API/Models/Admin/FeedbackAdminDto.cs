namespace Smoking.API.Models.Admin
{
    public class FeedbackAdminDto
    {
        public int FeedbackID { get; set; }
        public string FeedbackContent { get; set; }
        public int Rating { get; set; }
        public DateTime FeedbackDate { get; set; }

        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string UserRole { get; set; }
    }
}
