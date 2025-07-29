using System.ComponentModel.DataAnnotations;

namespace Smoking.API.Models.User
{
    public class ChangeCoachRequest
    {
        public int NewCoachId { get; set; }

        [Required]
        public string Reason { get; set; } = null!;
    }

}
