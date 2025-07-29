namespace Smoking.API.Models.Admin
{
    public class BlogViewModel
    {
        public int BlogId { get; set; }
        public string Title { get; set; }
        public string? Content { get; set; }
        public string? CategoryName { get; set; }
        public string? BlogType { get; set; }
        public string Status { get; set; }
        public int Likes { get; set; }
        public int Dislikes { get; set; }
        public int ReportCount { get; set; }
        public string AuthorName { get; set; }
        public string RoleName { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? LastModifiedDate { get; set; }
        public string? ImageUrl { get; set; }
        public string? AvatarUrl { get; set; } 
    }

    // ✅ Model dành cho Admin tạo blog
    public class BlogCreateModel
    {
        public string Title { get; set; }
        public string? Content { get; set; }
        public int AuthorId { get; set; } // ✅ Admin cung cấp
        public string? CategoryName { get; set; }
        public string? BlogType { get; set; }
        public string? ImageUrl { get; set; }
    }

    // ✅ Model dành cho Member tạo blog (không có AuthorId)
    public class BlogCreateByUserModel
    {
        public string Title { get; set; }
        public string? Content { get; set; }
        public string? CategoryName { get; set; }
        public string? BlogType { get; set; }
        public string? ImageUrl { get; set; }
    }
}
