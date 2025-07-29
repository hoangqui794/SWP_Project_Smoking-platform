namespace Smoking.API.Models.Admin
{
    public class QuitChallengeTemplateCreateDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string? NotesSuggestion { get; set; }
        public int Stage { get; set; }
        public string StageTitle { get; set; }
    }

}
