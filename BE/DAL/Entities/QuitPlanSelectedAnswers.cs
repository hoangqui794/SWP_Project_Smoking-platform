using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Smoking.DAL.Entities
{
    [Table("QuitPlanSelectedAnswers")]
    public class QuitPlanSelectedAnswers
    {
        [Key] 
        public int SelectedAnswerID { get; set; }

        public int QuitPlanID { get; set; }
        public int AnswerOptionID { get; set; }
        public string? CustomAnswerText { get; set; }

        [ForeignKey("AnswerOptionID")]
        public AnswerOption AnswerOption { get; set; } = null!;

        [ForeignKey("QuitPlanID")]
        public QuitPlan QuitPlan { get; set; } = null!;
    }
}
