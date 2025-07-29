using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Smoking.DAL.Entities
{
    [Table("AnswerOptions")]
    public class AnswerOption
    {
        public int AnswerOptionID { get; set; }
        public int QuestionID { get; set; }
        public string AnswerText { get; set; } = null!;
        public int DisplayOrder { get; set; }

        [JsonIgnore]
        public Question Question { get; set; } = null!;
    }

}
