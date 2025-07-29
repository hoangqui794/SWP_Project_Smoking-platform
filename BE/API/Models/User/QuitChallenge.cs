namespace Smoking.API.Models.User
{
    public class CompleteChallengeRequest
    {
        public int ChallengeId { get; set; }
        public string? Notes { get; set; }
    }

    public class UncompleteChallengeRequest
    {
        public int ChallengeId { get; set; }
    }

    public class CompleteChallengeForm
    {
        public int ChallengeId { get; set; }
        public string? Notes { get; set; }
        public IFormFile? Image { get; set; }
    }

}
