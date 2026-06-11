using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.BLL.Interfaces;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Smoking.API.Controllers.Member
{
    [ApiController]
    [Route("api/user/notifications")]
    [Authorize(Roles = "2")] // Ch? dành cho Member
    public class UserNotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public UserNotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // ? Ð?i route d? tránh trùng
        [HttpGet("my")]
        public async Task<IActionResult> GetMyNotifications()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var notifications = await _notificationService.GetByUserIdAsync(userId);
            return Ok(notifications.Select(n => new
            {
                n.NotificationID,
                n.Message,
                n.NotificationDate,
                n.NotificationType,
                SentAt = n.SentAt.ToString("dd/MM/yyyy HH:mm"),
                n.NotificationName, 
                n.IsRead,
                n.ReadAt,
            }));
        }

        // [DELETE] Xóa thông báo c?a chính mình
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMyNotification(int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var list = await _notificationService.GetByUserIdAsync(userId);
            var toDelete = list.FirstOrDefault(x => x.NotificationID == id);
            if (toDelete == null)
                return NotFound(new { Message = "Không tìm th?y thông báo." });

            var success = await _notificationService.DeleteAsync(id);
            return success
                ? Ok(new { Message = "Ðã xóa thông báo." })
                : BadRequest(new { Message = "L?i khi xóa." });
        }
        // [POST] Ðánh d?u thông báo là dã d?c
        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var notifications = await _notificationService.GetByUserIdAsync(userId);
            var notification = notifications.FirstOrDefault(n => n.NotificationID == id);

            if (notification == null)
                return NotFound(new { Message = "Không tìm th?y thông báo." });

            if (!notification.IsRead)
            {
                notification.IsRead = true; // Ðánh d?u là dã d?c
                notification.ReadAt = DateTime.UtcNow; // Ghi l?i th?i gian dã d?c
                await _notificationService.UpdateAsync(notification); // Call service to update
            }

            return Ok(new { Message = "Ðã dánh d?u là dã d?c." });
        }



    }
}
