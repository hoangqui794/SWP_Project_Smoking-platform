using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.DAL.Entities
{
    [Table("BlogReaction")]
    public class BlogReaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BlogId { get; set; }

        [Required]
        public int UserId { get; set; }

        public bool? IsLike { get; set; }

        public DateTime ReactedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("BlogId")]
        public Blog Blog { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}