using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Smoking.API.Models.User
{
    public class ConsultationRequest
    {
        [DefaultValue(1)]
        public int CoachId { get; set; }


        public string ConsultationDate { get; set; }

        [DefaultValue("08:00:00")]
        public string ConsultationTime { get; set; }

        [DefaultValue(30)]
        public int Duration { get; set; }
        public string Notes { get; set; }
    }
}
