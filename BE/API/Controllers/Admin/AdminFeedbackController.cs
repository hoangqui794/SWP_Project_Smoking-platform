using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.API.Models.Admin;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.API.Controllers.Admin
{
    [Route("api/AdminFeedback")]
    [ApiController]
    [Authorize(Roles = "1")] // Chỉ Admin mới truy cập
    public class AdminFeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;
        private readonly IUserService _userService;

        public AdminFeedbackController(IFeedbackService feedbackService, IUserService userService)
        {
            _feedbackService = feedbackService;
            _userService = userService;
        }

        // ✅ Lấy tất cả feedbacks (có thông tin người gửi)
        [HttpGet("all")]
        public async Task<IActionResult> GetAllFeedbacks()
        {
            var feedbacks = await _feedbackService.GetAllWithUserAsync();
            var result = feedbacks.Select(f => new FeedbackAdminDto
            {
                FeedbackID = f.FeedbackID,
                FeedbackContent = f.FeedbackContent,
                Rating = f.Rating,
                FeedbackDate = f.FeedbackDate,
                UserName = f.User?.FullName ?? "Unknown",
                UserEmail = f.User?.Email ?? "Unknown",
                UserRole = f.User?.Role?.RoleName ?? "Unknown"
            });

            return Ok(result);
        }


        // ✅ Xem chi tiết 1 feedback
        [HttpGet("{id}")]
        public async Task<IActionResult> GetFeedbackDetail(int id)
        {
            var feedback = await _feedbackService.GetByIdWithUserAsync(id);
            if (feedback == null) return NotFound("Feedback không tồn tại");

            return Ok(new
            {
                feedback.FeedbackID,
                feedback.FeedbackContent,
                feedback.Rating,
                feedback.FeedbackDate,
                UserName = feedback.User?.FullName ?? "Unknown",
                UserEmail = feedback.User?.Email ?? "Unknown",
                UserRole = feedback.User?.Role?.RoleName ?? "Unknown"
            });
        }



        // ❌ (Tuỳ chọn) Admin có thể xoá feedback
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            var feedback = await _feedbackService.GetByIdAsync(id);
            if (feedback == null) return NotFound("Feedback không tồn tại");

            var deleted = await _feedbackService.DeleteAsync(id);
            return deleted ? Ok("Đã xoá feedback") : BadRequest("Xoá thất bại");
        }

        // 🟡 (Tuỳ chọn) Thống kê: trung bình rating, tổng số feedback
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var feedbacks = await _feedbackService.GetAllAsync();
            if (!feedbacks.Any()) return Ok(new { Count = 0, AverageRating = 0 });

            var count = feedbacks.Count();
            var avgRating = feedbacks.Average(f => f.Rating);

            return Ok(new
            {
                TotalFeedbacks = count,
                AverageRating = avgRating
            });
        }
    }
}
