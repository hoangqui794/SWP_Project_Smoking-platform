namespace Smoking.API.Models.User
{
    public class QuitPlanSelectedAnswerViewDto
    {
        public int SelectedAnswerID { get; set; }
        public int AnswerOptionID { get; set; }
        public string? AnswerText { get; set; }
        public int QuestionID { get; set; }
        public string? QuestionText { get; set; }
        public string? CustomAnswerText { get; set; }
    }

}
