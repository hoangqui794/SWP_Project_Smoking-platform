using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.API.Models.User;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Smoking.API.Controllers.Member
{
    [Route("api/UserFeedback")]
    [ApiController]
    [Authorize(Roles = "2")] // Chỉ người dùng (role = 2) mới được phép
    public class UserFeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public UserFeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("Token không hợp lệ hoặc thiếu user ID");
            }
            return userId;
        }

        // 🟢 Tạo feedback
        [HttpPost("create")]
        public async Task<IActionResult> CreateFeedback([FromBody] FeedbackCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FeedbackContent))
                return BadRequest("Nội dung không được để trống");

            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest("Rating phải từ 1 đến 5");

            var userId = GetCurrentUserId();

            var feedback = new Feedback
            {
                UserID = userId,
                FeedbackContent = dto.FeedbackContent,
                Rating = dto.Rating,
                FeedbackDate = DateTime.Now
            };

            var created = await _feedbackService.CreateAsync(feedback);
            return Ok(created);
        }




        // 🔵 Lấy feedback của chính mình
        [HttpGet("my-feedback")]
        public async Task<IActionResult> GetMyFeedback()
        {
            var userId = GetCurrentUserId();
            var feedbacks = await _feedbackService.GetByUserIdAsync(userId);
            return Ok(feedbacks);
        }

        // 🟠 Sửa feedback
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> EditFeedback(int id, [FromBody] FeedbackCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FeedbackContent))
                return BadRequest("Nội dung không được để trống");

            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest("Rating phải từ 1 đến 5");

            var userId = GetCurrentUserId();
            var existing = await _feedbackService.GetByIdAsync(id);

            if (existing == null)
                return NotFound("Feedback không tồn tại");
            if (existing.UserID != userId)
                return Forbid("Không thể sửa feedback của người khác");

            existing.FeedbackContent = dto.FeedbackContent;
            existing.Rating = dto.Rating;

            var updated = await _feedbackService.UpdateAsync(existing);
            return updated ? Ok(existing) : BadRequest("Cập nhật thất bại");
        }


        // 🔴 Xoá feedback
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            var userId = GetCurrentUserId();
            var existing = await _feedbackService.GetByIdAsync(id);

            if (existing == null) return NotFound("Feedback không tồn tại");
            if (existing.UserID != userId) return Forbid("Không thể xoá feedback của người khác");

            var deleted = await _feedbackService.DeleteAsync(id);
            return deleted ? Ok("Xoá thành công") : BadRequest("Xoá thất bại");
        }
    }
}
