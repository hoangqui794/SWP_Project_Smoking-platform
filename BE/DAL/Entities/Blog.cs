using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Smoking.DAL.Entities
{
    [Table("Blog")]
    public class Blog
    {
        [Key]
        public int BlogId { get; set; }

        [Required]
        public string Title { get; set; }

        public string? Content { get; set; }

        // Trạng thái bài viết: Pending, Approved, Rejected
        public string Status { get; set; } = "Pending";

        // Khóa ngoại - ID người dùng (tác giả)
        public int AuthorId { get; set; }

        [ForeignKey("AuthorId")]
        public User User { get; set; }

        public string? CategoryName { get; set; }
        public string? BlogType { get; set; }
        public string? ImageUrl { get; set; }


        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? LastModifiedDate { get; set; }

        // Thống kê
        public int Likes { get; set; } = 0;
        public int Dislikes { get; set; } = 0;
        public int ReportCount { get; set; } = 0;
        public ICollection<BlogReaction> BlogReactions { get; set; } = new List<BlogReaction>();
    }
}