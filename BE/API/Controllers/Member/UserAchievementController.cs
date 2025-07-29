using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.BLL.Interfaces;
using System.Threading.Tasks;

namespace Smoking.API.Controllers
{
    [Route("api/user-achievement")]
    [ApiController]
    [Authorize(Roles = "2")]
    public class UserAchievementController : ControllerBase
    {
        private readonly IUserAchievementService _userAchievementService;
        private readonly IMailService _mailService;

        public UserAchievementController(IUserAchievementService userAchievementService, IMailService mailService)
        {
            _userAchievementService = userAchievementService;
            _mailService = mailService;
        }

        [HttpGet("my-achievements/{userId}")]
        public async Task<IActionResult> GetUserAchievements(int userId)
        {
            var achievements = await _userAchievementService.GetAchievementsByUserIdAsync(userId);
            return Ok(achievements);
        }

        [HttpPost("grant")]
        [Authorize(Roles = "1,2")] // ví dụ: admin và coach mới được cấp
        public async Task<IActionResult> GrantAchievement(int userId, int achievementId)
        {
            var result = await _userAchievementService.GrantAchievementAsync(userId, achievementId);
            if (result)
            {
                // Gửi email thông báo
                var user = await _userAchievementService.GetUserByIdAsync(userId); // Get user details
                var achievement = await _userAchievementService.GetAchievementByIdAsync(achievementId); // Get achievement details

                var emailBody = $"Chúc mừng bạn đã đạt được thành tựu: {achievement.AchievementName}";
                var subject = "Thông báo thành tựu";

                await _mailService.SendEmailAsync(user.Email, subject, emailBody); // Gửi email

                return Ok(new { Message = "Đã cấp thành tựu thành công và gửi email thông báo" });
            }
            else
            {
                return BadRequest(new { Message = "Cấp thất bại: đã có thành tựu trước đó." });
            }
        }

        [HttpGet("all-status/{userId}")]
        public async Task<IActionResult> GetAllAchievementsWithStatus(int userId)
        {
            var achievements = await _userAchievementService.GetAchievementsWithStatusAsync(userId);
            return Ok(achievements);
        }

    }
}
