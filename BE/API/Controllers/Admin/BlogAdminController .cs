using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using System.Linq;
using System.Threading.Tasks;
using Smoking.API.Models.Admin;

namespace Smoking.API.Controllers.Admin
{
    [Route("api/BlogAdmin")]
    [ApiController]
    [Authorize(Roles = "1")]
    public class BlogAdminController : ControllerBase
    {
        private readonly IBlogService _blogService;

        public BlogAdminController(IBlogService blogService)
        {
            _blogService = blogService;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetAllBlogs()
        {
            var blogs = await _blogService.GetAllWithUserAndRoleAsync();
            return Ok(blogs.Select(b => new BlogViewModel
            {
                BlogId = b.BlogId,
                Title = b.Title,
                Content = b.Content,
                CategoryName = b.CategoryName,
                BlogType = b.BlogType,
                Status = b.Status,
                Likes = b.Likes,
                Dislikes = b.Dislikes,
                ReportCount = b.ReportCount,
                AuthorName = b.User?.FullName,
                RoleName = b.User?.Role?.RoleName,
                CreatedDate = b.CreatedDate,
                LastModifiedDate = b.LastModifiedDate,
                ImageUrl = b.ImageUrl
            }));
        }

        // Lấy danh sách blog chờ duyệt
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingBlogs()
        {
            var blogs = await _blogService.GetAllByStatusWithUserAndRoleAsync("Pending");
            return Ok(blogs.Select(b => new BlogViewModel
            {
                BlogId = b.BlogId,
                Title = b.Title,
                AuthorName = b.User?.FullName,
                RoleName = b.User?.Role?.RoleName,
                Status = b.Status,
                CreatedDate = b.CreatedDate,
                ImageUrl = b.ImageUrl
            }));
        }

        // Lấy danh sách blog bị báo cáo
        [HttpGet("reported")]
        public async Task<IActionResult> GetReportedBlogs()
        {
            var blogs = await _blogService.GetAllReportedWithUserAndRoleAsync();
            return Ok(blogs.Select(b => new BlogViewModel
            {
                BlogId = b.BlogId,
                Title = b.Title,
                ReportCount = b.ReportCount,
                AuthorName = b.User?.FullName,
                RoleName = b.User?.Role?.RoleName,
                CreatedDate = b.CreatedDate,
                ImageUrl = b.ImageUrl
            }));
        }

        // Lấy danh sách blog đã duyệt (Approved)
        [HttpGet("approved")]
        public async Task<IActionResult> GetApprovedBlogs()
        {
            var blogs = await _blogService.GetAllByStatusWithUserAndRoleAsync("Approved");
            return Ok(blogs.Select(b => new BlogViewModel
            {
                BlogId = b.BlogId,
                Title = b.Title,
                AuthorName = b.User?.FullName,
                RoleName = b.User?.Role?.RoleName,
                Status = b.Status,
                CreatedDate = b.CreatedDate,
                ImageUrl = b.ImageUrl
            }));
        }

        // Duyệt blog (approve)
        [HttpPut("approve/{id}")]
        public async Task<IActionResult> ApproveBlog(int id)
        {
            var success = await _blogService.ApproveBlogAsync(id);
            if (!success) return NotFound();
            return Ok(new { Message = "Blog đã được duyệt." });
        }

        // Từ chối blog (reject)
        [HttpPut("reject/{id}")]
        public async Task<IActionResult> RejectBlog(int id)
        {
            var success = await _blogService.RejectBlogAsync(id);
            if (!success) return NotFound();
            return Ok(new { Message = "Blog đã bị từ chối." });
        }

        // Đánh dấu bài báo cáo đã xử lý
        [HttpPut("reviewed/{id}")]
        public async Task<IActionResult> MarkBlogAsReviewed(int id)
        {
            var success = await _blogService.MarkBlogAsReviewedAsync(id);
            if (!success) return NotFound();
            return Ok(new { Message = "Đã đánh dấu bài viết đã xử lý báo cáo." });
        }

        // Xóa blog
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteBlog(int id)
        {
            var success = await _blogService.DeleteAsync(id);
            if (!success) return NotFound();
            return Ok(new { Message = "Đã xóa blog." });
        }

        // Admin tạo blog mới
        [HttpPost("create")]
        public async Task<IActionResult> CreateBlog([FromBody] BlogCreateModel model)
        {
            var blog = new Blog
            {
                Title = model.Title,
                Content = model.Content,
                AuthorId = model.AuthorId,
                CategoryName = model.CategoryName,
                BlogType = model.BlogType,
                Status = "Approved",
                CreatedDate = System.DateTime.Now,
                Likes = 0,
                Dislikes = 0,
                ReportCount = 0,
                ImageUrl = model.ImageUrl
            };
            var created = await _blogService.CreateByAdminAsync(blog);
            return Ok(created);
        }

        // Thống kê blog
        [HttpGet("stats")]
        public async Task<IActionResult> GetBlogStatistics()
        {
            var total = await _blogService.CountAllAsync();
            var pending = await _blogService.CountByStatusAsync("Pending");
            var reported = await _blogService.CountReportedAsync();

            return Ok(new
            {
                TotalBlogs = total,
                PendingBlogs = pending,
                ReportedBlogs = reported
            });
        }
    }
}
