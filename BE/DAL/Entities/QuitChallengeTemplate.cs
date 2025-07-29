using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Smoking.DAL.Entities
{
    [Table("QuitChallengeTemplate")]
    public class QuitChallengeTemplate
    {
        public int Id { get; set; }

        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public string? NotesSuggestion { get; set; }

        public int Stage { get; set; }

        public string? StageTitle { get; set; }
        public ICollection<UserQuitChallenge> UserChallenges { get; set; } = new List<UserQuitChallenge>();
    }
}
