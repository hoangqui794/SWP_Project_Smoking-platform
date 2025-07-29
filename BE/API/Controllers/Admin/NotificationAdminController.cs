using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.API.Models.Admin;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.API.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "1")] 
    public class NotificationAdminController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly IMailService _mailService;
        private readonly IUserService _userService;

        public NotificationAdminController(INotificationService notificationService, IMailService mailService, IUserService userService)
        {
            _notificationService = notificationService;
            _mailService = mailService;
            _userService = userService;
        }

        // Lấy tất cả thông báo
        [HttpGet("list")]
        public async Task<IActionResult> GetAllNotifications()
        {
            var notifications = await _notificationService.GetAllAsync();
            return Ok(notifications.Select(n => new
            {
                n.NotificationID,
                n.UserID,
                n.Message,
                n.NotificationDate,
                n.NotificationType,
                SenAt = n.SentAt.ToString("dd/MM/yyyy HH:mm"),
                NotificationName = n.NotificationName ?? "No Name",     
                Condition = n.Condition ?? "No Condition",               
                NotificationFor = n.NotificationFor ?? "No Recipient",    
                CreatedBy = n.CreatedBy ?? "Unknown"                      
            }));
        }


        // Lấy thông báo của người dùng theo UserID
        [HttpGet("getNotificationUserID")]
        public async Task<IActionResult> GetUserNotifications(int userId)
        {
            var notifications = await _notificationService.GetByUserIdAsync(userId);
            return Ok(notifications.Select(n => new
            {
                n.NotificationID,
                n.Message,
                n.NotificationDate,
                n.NotificationType,
                n.SentAt,
                AuthorName = n.User?.FullName,
                RoleName = n.User?.Role?.RoleName
            }));
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendNotification([FromBody] SendNotificationRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest(new { Message = "Vui lòng nhập nội dung thông báo." });

            var users = new List<User>();

            if (request.ToAllUsers)
            {
                users = (await _userService.GetAllAsync()).ToList();
            }
            else if (!string.IsNullOrEmpty(request.ToRole))
            {
                users = (await _userService.GetUsersByRoleAsync(request.ToRole)).ToList();
            }
            else if (request.Emails != null && request.Emails.Any())
            {
                foreach (var email in request.Emails)
                {
                    var user = await _userService.GetByEmailAsync(email);
                    if (user != null)
                        users.Add(user);
                }
            }
            else
            {
                return BadRequest(new { Message = "Không có đối tượng nhận thông báo." });
            }

            var sentResults = new List<object>();
            foreach (var user in users.DistinctBy(u => u.UserID))
            {
                var notification = new Notification
                {
                    UserID = user.UserID,
                    Message = request.Message,
                    NotificationType = request.NotificationType,
                    SentAt = DateTime.UtcNow,
                    NotificationName = request.NotificationName ?? "Thông báo hệ thống",
                    Condition = request.Condition ?? "Chờ xử lý",
                    NotificationFor = request.NotificationFor ?? "All Users",
                    CreatedBy = request.CreatedBy ?? "Admin"
                };

                await _notificationService.CreateAsync(notification);

                bool emailSent = false;
                if (request.SendEmail && !string.IsNullOrEmpty(user.Email))
                {
                    try
                    {
                        await _mailService.SendEmailAsync(user.Email, notification.NotificationName, notification.Message);
                        emailSent = true;
                    }
                    catch { emailSent = false; }
                }

                sentResults.Add(new
                {
                    user.UserID,
                    user.Email,
                    notification.NotificationID,
                    notification.SentAt,
                    EmailSent = emailSent
                });
            }

            return Ok(new { Message = "Đã gửi thông báo.", Results = sentResults });
        }



        // Xóa thông báo
        [HttpDelete("deleteNotification")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var success = await _notificationService.DeleteAsync(id);
            if (!success) return NotFound();
            return Ok(new { Message = "Đã xóa thông báo." });
        }
    }
}
