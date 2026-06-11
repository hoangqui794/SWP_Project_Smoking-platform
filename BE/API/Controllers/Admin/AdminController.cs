using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Linq;
using System.Threading.Tasks;
using Smoking.API.Models.Admin;
using Smoking.BLL.Services;
using Smoking.API.Models.Admin;
using System.Security.Claims;

namespace Smoking.API.Controllers.Admin
{
    [ApiController]
    [Route("api/Admin")]
    [Authorize(Roles = "1")] // Ch? Admin (RoleID=1) du?c vào
    public class AdminController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMailService _mailService;
        private readonly IUserService _userService;

        public AdminController(IUnitOfWork unitOfWork, IMailService mailService, IUserService userService)
        {
            _unitOfWork = unitOfWork;
            _mailService = mailService;
            _userService = userService;
        }



        // 1? L?y danh sách User
        [HttpGet("ListUsers")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _unitOfWork.Users.GetAllWithRolesAsync();
            return Ok(users.Select(u => new
            {
                u.UserID,
                u.FullName,
                u.Email,
                u.PhoneNumber,
                RegistrationDate = u.RegistrationDate.ToString("dd/MM/yyyy HH:mm"),
                u.Status,
                Role = u.Role?.RoleName ?? "Unknown"
            }));
        }

        // 2? Xem chi ti?t 1 User
        [HttpGet("User")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { Message = "User không t?n t?i." });

            return Ok(new
            {
                user.UserID,
                user.FullName,
                user.Email,
                user.PhoneNumber,
                user.Status,
                user.RoleID
            });
        }

        // 3? C?p nh?t thông tin User (VD: thay d?i Status)
        [HttpPut("UpdateStatus")]
        public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] string newStatus)
        {
            var allowedStatuses = new[] { "Active", "InActive"};

            if (string.IsNullOrWhiteSpace(newStatus) || !allowedStatuses.Contains(newStatus, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    Message = "Tr?ng thái không h?p l?. Ch? du?c phép: Active, InActive"
                });
            }

            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(currentUserIdClaim, out int currentUserId))
            {
                if (id == currentUserId)
                {
                    return BadRequest(new { Message = "B?n không th? t? thay d?i tr?ng thái c?a chính mình." });
                }
            }

            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { Message = "User không t?n t?i." });

            user.Status = newStatus;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "C?p nh?t tr?ng thái User thành công." });
        }



        [HttpDelete("DeleteUser")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { Message = "User không t?n t?i." });
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(currentUserIdClaim, out int currentUserId))
            {
                if (id == currentUserId)
                {
                    return BadRequest(new { Message = "B?n không th? t? thay d?i tr?ng thái c?a chính mình." });
                }
            }
            user.Status = "InActive";

            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Ngu?i dùng dã du?c vô hi?u hóa (InActive)." });
        }



        // 7? (Optional) C?p nh?t Role cho User
        [HttpPut("UpdateRole")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] int newRoleId)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { Message = "User không t?n t?i." });
            // L?y UserID c?a ngu?i dang dang nh?p t? JWT
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(currentUserIdClaim, out int currentUserId))
            {
                if (id == currentUserId)
                {
                    return BadRequest(new { Message = "B?n không th? t? thay d?i tr?ng thái c?a chính mình." });
                }
            }
            user.RoleID = newRoleId;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "C?p nh?t Role cho User thành công." });
        }

        //8. Thêm m?i User
        [HttpPost("AddUser")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            var existing = await _unitOfWork.Users.GetByEmailAsync(request.Email);
            if (existing != null)
                return BadRequest(new { Message = "Email dã t?n t?i." });

            // Bam m?t kh?u tru?c khi luu
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                Password = hashedPassword, // dã mã hoá
                PhoneNumber = request.PhoneNumber,
                Status = "Active",
                RoleID = request.RoleID
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "T?o User thành công." });
        }

        //[HttpPut("approve-coach-change/{userId}")]
        //[Authorize(Roles = "1")] // Admin
        //public async Task<IActionResult> ApproveCoachChange(int userId)
        //{
        //    var user = await _unitOfWork.Users.GetByIdAsync(userId);
        //    if (user == null || user.PendingCoachId == null)
        //        return NotFound(new { Message = "Không có yêu c?u d?i coach nào dang ch? duy?t." });

        //    // L?y thông tin coach m?i
        //    var newCoach = await _unitOfWork.Users.GetByIdAsync(user.PendingCoachId.Value);
        //    if (newCoach == null)
        //        return NotFound(new { Message = "Hu?n luy?n viên m?i không t?n t?i." });

        //    // C?p nh?t coach m?i cho user
        //    user.CoachId = user.PendingCoachId;
        //    user.PendingCoachId = null;
        //    user.CoachChangeReason = null; // ?? Xoá lý do sau khi duy?t

        //    _unitOfWork.Users.Update(user);

        //    // Thông báo
        //    var notification = new Notification
        //    {
        //        NotificationName = "Ðã duy?t d?i hu?n luy?n viên",
        //        Message = $"Yêu c?u d?i coach c?a b?n sang {newCoach.FullName} dã du?c ch?p nh?n.",
        //        CreatedBy = "Admin",
        //        NotificationType = "CoachChangeApproved",
        //        NotificationFor = "Member",
        //        Condition = "Unread",
        //        UserID = user.UserID,
        //        SentAt = DateTime.UtcNow
        //    };
        //    await _unitOfWork.Notifications.AddAsync(notification);

        //    // G?i email
        //    await _mailService.SendEmailAsync(user.Email, "Yêu c?u d?i coach dã du?c duy?t",
        //        $"Chào {user.FullName},\n\nYêu c?u d?i sang hu?n luy?n viên {newCoach.FullName} c?a b?n dã du?c duy?t.");

        //    await _unitOfWork.CompleteAsync();

        //    return Ok(new { Message = "Ðã duy?t d?i hu?n luy?n viên cho ngu?i dùng." });
        //}

        [HttpPut("approve-coach-change/{userId}")]
        public async Task<IActionResult> ApproveCoachChange(int userId)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null || user.PendingCoachId == null)
                return NotFound(new { Message = "Không có yêu c?u d?i/h?y coach nào dang ch? duy?t." });

            var isCancelRequest = user.PendingCoachId == -1;
            string htmlBody;
            string subject;

            if (isCancelRequest)
            {
                var oldCoach = await _unitOfWork.Users.GetByIdAsync(user.CoachId.Value);

                // ? H?y coach
                user.CoachId = null;
                user.PendingCoachId = null;
                user.CoachChangeReason = null;

                subject = "Ðã duy?t yêu c?u h?y hu?n luy?n viên";
                htmlBody = $@"
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #fffaf5;'>
            <h2 style='color: #c0392b;'>Yêu c?u h?y hu?n luy?n viên dã du?c duy?t</h2>
            <p>Xin chào <strong>{user.FullName}</strong>,</p>
            <p>Chúng tôi xác nh?n r?ng yêu c?u h?y hu?n luy?n viên <strong>{oldCoach?.FullName}</strong> dã du?c <strong>duy?t</strong>.</p>
            <p>H? th?ng hi?n không còn hu?n luy?n viên d?ng hành cùng b?n. B?n có th? ch?n hu?n luy?n viên m?i b?t k? lúc nào.</p>
            <hr />
            <p style='color: #888; font-size: 13px;'>Smoking App © 2025 — H? th?ng h? tr? cai thu?c</p>
        </div>";
            }
            else
            {
                // ? Duy?t d?i sang coach m?i
                var newCoach = await _unitOfWork.Users.GetByIdAsync(user.PendingCoachId.Value);
                if (newCoach == null || newCoach.RoleID != 3)
                    return BadRequest(new { Message = "Hu?n luy?n viên m?i không h?p l?." });

                user.CoachId = newCoach.UserID;
                user.PendingCoachId = null;
                user.CoachChangeReason = null;

                subject = "Ðã duy?t yêu c?u d?i hu?n luy?n viên";
                htmlBody = $@"
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f5fcff;'>
            <h2 style='color: #2980b9;'>Yêu c?u d?i hu?n luy?n viên dã du?c duy?t</h2>
            <p>Xin chào <strong>{user.FullName}</strong>,</p>
            <p>Chúng tôi xác nh?n r?ng b?n dã du?c d?i sang hu?n luy?n viên <strong>{newCoach.FullName}</strong>.</p>
            <p>Chúc b?n d?t du?c k?t qu? t?t trong hành trình cai thu?c.</p>
            <hr />
            <p style='color: #888; font-size: 13px;'>Smoking App © 2025 — H? th?ng h? tr? cai thu?c</p>
        </div>";
            }

            _unitOfWork.Users.Update(user);

            // ? T?o thông báo
            var notification = new Notification
            {
                NotificationName = isCancelRequest ? "Ðã duy?t h?y hu?n luy?n viên" : "Ðã duy?t d?i hu?n luy?n viên",
                Message = isCancelRequest
                    ? "Yêu c?u h?y hu?n luy?n viên c?a b?n dã du?c ch?p nh?n."
                    : $"Yêu c?u d?i hu?n luy?n viên sang {user.CoachId} dã du?c ch?p nh?n.",
                CreatedBy = "Admin",
                NotificationType = isCancelRequest ? "CoachCancelApproved" : "CoachChangeApproved",
                NotificationFor = "Member",
                Condition = "Unread",
                UserID = user.UserID,
                SentAt = DateTime.UtcNow
            };
            await _unitOfWork.Notifications.AddAsync(notification);

            // ? G?i email
            await _mailService.SendHtmlEmailAsync(user.Email, subject, htmlBody);

            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Duy?t yêu c?u hu?n luy?n viên thành công." });
        }

        // H?y yêu c?u ch? duy?t d?i hu?n luy?n viên
        [HttpDelete("cancel-coach-change/{userId}")]
        public async Task<IActionResult> CancelCoachChange(int userId)
        {
            // Tìm ngu?i dùng d?a trên userId
            var user = await _unitOfWork.Users.GetByIdAsync(userId);

            // N?u ngu?i dùng không t?n t?i ho?c không có yêu c?u d?i hu?n luy?n viên nào
            if (user == null || user.PendingCoachId == null)
                return NotFound(new { Message = "Không có yêu c?u d?i hu?n luy?n viên nào dang ch? duy?t." });

            // Xóa yêu c?u pending
            user.PendingCoachId = null;
            user.CoachChangeReason = null;

            // C?p nh?t thông tin ngu?i dùng
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            // T?o thông báo cho ngu?i dùng
            var notification = new Notification
            {
                NotificationName = "Ðã h?y yêu c?u d?i hu?n luy?n viên",
                Message = "Yêu c?u d?i hu?n luy?n viên c?a b?n dã b? h?y.",
                CreatedBy = "Admin",
                NotificationType = "CoachChangeCanceled",
                NotificationFor = "Member",
                Condition = "Unread",
                UserID = user.UserID,
                SentAt = DateTime.UtcNow
            };
            await _unitOfWork.Notifications.AddAsync(notification);

            // G?i email thông báo cho ngu?i dùng
            await _mailService.SendEmailAsync(user.Email, "Yêu c?u d?i hu?n luy?n viên dã b? h?y",
                $"Chào {user.FullName},\n\nYêu c?u d?i hu?n luy?n viên c?a b?n dã b? h?y. B?n có th? g?i yêu c?u d?i hu?n luy?n viên m?i n?u c?n.");

            // Luu các thay d?i vào co s? d? li?u
            await _unitOfWork.CompleteAsync();

            // Tr? v? k?t qu? thành công
            return Ok(new { Message = "Ðã h?y yêu c?u d?i hu?n luy?n viên thành công." });
        }



        [HttpGet("pending-coach-changes")]
        [Authorize(Roles = "1")]
        public async Task<IActionResult> GetPendingCoachChanges()
        {
            var users = await _unitOfWork.Users.GetAllAsync();
            var pending = users.Where(u => u.PendingCoachId != null).ToList();

            return Ok(pending.Select(u => new {
                u.UserID,
                u.FullName,
                CurrentCoachId = u.CoachId,
                RequestedCoachId = u.PendingCoachId,
                 Reason = u.CoachChangeReason
            }));
        }

        [HttpGet("user-counts")]
        public async Task<IActionResult> GetUserCounts()
        {
            int coachCount = await _userService.CountUsersByRoleAsync("Coach");
            int memberCount = await _userService.CountUsersByRoleAsync("Member");

            return Ok(new
            {
                CoachCount = coachCount,
                MemberCount = memberCount
            });
        }


    }
}
