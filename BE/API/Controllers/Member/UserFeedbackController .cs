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
    [Authorize(Roles = "2")] // Ch? ngu?i dùng (role = 2) m?i du?c phép
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
                throw new UnauthorizedAccessException("Token không h?p l? ho?c thi?u user ID");
            }
            return userId;
        }

        // ?? T?o feedback
        [HttpPost("create")]
        public async Task<IActionResult> CreateFeedback([FromBody] FeedbackCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FeedbackContent))
                return BadRequest("N?i dung không du?c d? tr?ng");

            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest("Rating ph?i t? 1 d?n 5");

            var userId = GetCurrentUserId();

            var feedback = new Feedback
            {
                UserID = userId,
                FeedbackContent = dto.FeedbackContent,
                Rating = dto.Rating,
                FeedbackDate = DateTime.UtcNow
            };

            var created = await _feedbackService.CreateAsync(feedback);
            return Ok(created);
        }




        // ?? L?y feedback c?a chính mình
        [HttpGet("my-feedback")]
        public async Task<IActionResult> GetMyFeedback()
        {
            var userId = GetCurrentUserId();
            var feedbacks = await _feedbackService.GetByUserIdAsync(userId);
            return Ok(feedbacks);
        }

        // ?? S?a feedback
        [HttpPut("edit/{id}")]
        public async Task<IActionResult> EditFeedback(int id, [FromBody] FeedbackCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FeedbackContent))
                return BadRequest("N?i dung không du?c d? tr?ng");

            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest("Rating ph?i t? 1 d?n 5");

            var userId = GetCurrentUserId();
            var existing = await _feedbackService.GetByIdAsync(id);

            if (existing == null)
                return NotFound("Feedback không t?n t?i");
            if (existing.UserID != userId)
                return Forbid("Không th? s?a feedback c?a ngu?i khác");

            existing.FeedbackContent = dto.FeedbackContent;
            existing.Rating = dto.Rating;

            var updated = await _feedbackService.UpdateAsync(existing);
            return updated ? Ok(existing) : BadRequest("C?p nh?t th?t b?i");
        }


        // ?? Xoá feedback
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            var userId = GetCurrentUserId();
            var existing = await _feedbackService.GetByIdAsync(id);

            if (existing == null) return NotFound("Feedback không t?n t?i");
            if (existing.UserID != userId) return Forbid("Không th? xoá feedback c?a ngu?i khác");

            var deleted = await _feedbackService.DeleteAsync(id);
            return deleted ? Ok("Xoá thành công") : BadRequest("Xoá th?t b?i");
        }
    }
}
