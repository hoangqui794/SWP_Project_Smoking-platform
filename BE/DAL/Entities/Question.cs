using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.DAL.Entities
{
    [Table("Questions")]
    public class Question
    {
        public int QuestionID { get; set; }
        public string QuestionText { get; set; } = null!;
        public string QuestionType { get; set; } = null!; 
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public ICollection<AnswerOption> AnswerOptions { get; set; } = new List<AnswerOption>();
    }

}
