namespace Smoking.API.Models.Admin
{
    public class QuestionWithAnswersDto
    {
        public int QuestionID { get; set; }
        public string QuestionText { get; set; }
        public string QuestionType { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public List<AnswerOptionDto> AnswerOptions { get; set; } = new();
    }
}
