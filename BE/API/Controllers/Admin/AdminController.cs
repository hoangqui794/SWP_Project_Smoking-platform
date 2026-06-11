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
    [Authorize(Roles = "1")] // Chỉ Admin (RoleID=1) được vào
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



        // 1️ Lấy danh sách User
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

        // 2️ Xem chi tiết 1 User
        [HttpGet("User")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { Message = "User không tồn tại." });

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

        // 3️ Cập nhật thông tin User (VD: thay đổi Status)
        [HttpPut("UpdateStatus")]
        public async Task<IActionResult> UpdateUserStatus(int id, [FromBody] string newStatus)
        {
            var allowedStatuses = new[] { "Active", "InActive"};

            if (string.IsNullOrWhiteSpace(newStatus) || !allowedStatuses.Contains(newStatus, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    Message = "Trạng thái không hợp lệ. Chỉ được phép: Active, InActive"
                });
            }

            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(currentUserIdClaim, out int currentUserId))
            {
                if (id == currentUserId)
                {
                    return BadRequest(new { Message = "Bạn không thể tự thay đổi trạng thái của chính mình." });
                }
            }

            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { Message = "User không tồn tại." });

            user.Status = newStatus;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Cập nhật trạng thái User thành công." });
        }



        [HttpDelete("DeleteUser")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { Message = "User không tồn tại." });
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(currentUserIdClaim, out int currentUserId))
            {
                if (id == currentUserId)
                {
                    return BadRequest(new { Message = "Bạn không thể tự thay đổi trạng thái của chính mình." });
                }
            }
            user.Status = "InActive";

            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Người dùng đã được vô hiệu hóa (InActive)." });
        }



        // 7️ (Optional) Cập nhật Role cho User
        [HttpPut("UpdateRole")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] int newRoleId)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { Message = "User không tồn tại." });
            // Lấy UserID của người đang đăng nhập từ JWT
            var currentUserIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(currentUserIdClaim, out int currentUserId))
            {
                if (id == currentUserId)
                {
                    return BadRequest(new { Message = "Bạn không thể tự thay đổi trạng thái của chính mình." });
                }
            }
            user.RoleID = newRoleId;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Cập nhật Role cho User thành công." });
        }

        //8. Thêm mới User
        [HttpPost("AddUser")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            var existing = await _unitOfWork.Users.GetByEmailAsync(request.Email);
            if (existing != null)
                return BadRequest(new { Message = "Email đã tồn tại." });

            // Băm mật khẩu trước khi lưu
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                Password = hashedPassword, // đã mã hoá
                PhoneNumber = request.PhoneNumber,
                Status = "Active",
                RoleID = request.RoleID
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Tạo User thành công." });
        }

        //[HttpPut("approve-coach-change/{userId}")]
        //[Authorize(Roles = "1")] // Admin
        //public async Task<IActionResult> ApproveCoachChange(int userId)
        //{
        //    var user = await _unitOfWork.Users.GetByIdAsync(userId);
        //    if (user == null || user.PendingCoachId == null)
        //        return NotFound(new { Message = "Không có yêu cầu đổi coach nào đang chờ duyệt." });

        //    // Lấy thông tin coach mới
        //    var newCoach = await _unitOfWork.Users.GetByIdAsync(user.PendingCoachId.Value);
        //    if (newCoach == null)
        //        return NotFound(new { Message = "Huấn luyện viên mới không tồn tại." });

        //    // Cập nhật coach mới cho user
        //    user.CoachId = user.PendingCoachId;
        //    user.PendingCoachId = null;
        //    user.CoachChangeReason = null; // ✔️ Xoá lý do sau khi duyệt

        //    _unitOfWork.Users.Update(user);

        //    // Thông báo
        //    var notification = new Notification
        //    {
        //        NotificationName = "Đã duyệt đổi huấn luyện viên",
        //        Message = $"Yêu cầu đổi coach của bạn sang {newCoach.FullName} đã được chấp nhận.",
        //        CreatedBy = "Admin",
        //        NotificationType = "CoachChangeApproved",
        //        NotificationFor = "Member",
        //        Condition = "Unread",
        //        UserID = user.UserID,
        //        SentAt = DateTime.UtcNow
        //    };
        //    await _unitOfWork.Notifications.AddAsync(notification);

        //    // Gửi email
        //    await _mailService.SendEmailAsync(user.Email, "Yêu cầu đổi coach đã được duyệt",
        //        $"Chào {user.FullName},\n\nYêu cầu đổi sang huấn luyện viên {newCoach.FullName} của bạn đã được duyệt.");

        //    await _unitOfWork.CompleteAsync();

        //    return Ok(new { Message = "Đã duyệt đổi huấn luyện viên cho người dùng." });
        //}

        [HttpPut("approve-coach-change/{userId}")]
        public async Task<IActionResult> ApproveCoachChange(int userId)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null || user.PendingCoachId == null)
                return NotFound(new { Message = "Không có yêu cầu đổi/hủy coach nào đang chờ duyệt." });

            var isCancelRequest = user.PendingCoachId == -1;
            string htmlBody;
            string subject;

            if (isCancelRequest)
            {
                var oldCoach = await _unitOfWork.Users.GetByIdAsync(user.CoachId.Value);

                // ✅ Hủy coach
                user.CoachId = null;
                user.PendingCoachId = null;
                user.CoachChangeReason = null;

                subject = "Đã duyệt yêu cầu hủy huấn luyện viên";
                htmlBody = $@"
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #fffaf5;'>
            <h2 style='color: #c0392b;'>Yêu cầu hủy huấn luyện viên đã được duyệt</h2>
            <p>Xin chào <strong>{user.FullName}</strong>,</p>
            <p>Chúng tôi xác nhận rằng yêu cầu hủy huấn luyện viên <strong>{oldCoach?.FullName}</strong> đã được <strong>duyệt</strong>.</p>
            <p>Hệ thống hiện không còn huấn luyện viên đồng hành cùng bạn. Bạn có thể chọn huấn luyện viên mới bất kỳ lúc nào.</p>
            <hr />
            <p style='color: #888; font-size: 13px;'>Smoking App © 2025 — Hệ thống hỗ trợ cai thuốc</p>
        </div>";
            }
            else
            {
                // ✅ Duyệt đổi sang coach mới
                var newCoach = await _unitOfWork.Users.GetByIdAsync(user.PendingCoachId.Value);
                if (newCoach == null || newCoach.RoleID != 3)
                    return BadRequest(new { Message = "Huấn luyện viên mới không hợp lệ." });

                user.CoachId = newCoach.UserID;
                user.PendingCoachId = null;
                user.CoachChangeReason = null;

                subject = "Đã duyệt yêu cầu đổi huấn luyện viên";
                htmlBody = $@"
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f5fcff;'>
            <h2 style='color: #2980b9;'>Yêu cầu đổi huấn luyện viên đã được duyệt</h2>
            <p>Xin chào <strong>{user.FullName}</strong>,</p>
            <p>Chúng tôi xác nhận rằng bạn đã được đổi sang huấn luyện viên <strong>{newCoach.FullName}</strong>.</p>
            <p>Chúc bạn đạt được kết quả tốt trong hành trình cai thuốc.</p>
            <hr />
            <p style='color: #888; font-size: 13px;'>Smoking App © 2025 — Hệ thống hỗ trợ cai thuốc</p>
        </div>";
            }

            _unitOfWork.Users.Update(user);

            // ✅ Tạo thông báo
            var notification = new Notification
            {
                NotificationName = isCancelRequest ? "Đã duyệt hủy huấn luyện viên" : "Đã duyệt đổi huấn luyện viên",
                Message = isCancelRequest
                    ? "Yêu cầu hủy huấn luyện viên của bạn đã được chấp nhận."
                    : $"Yêu cầu đổi huấn luyện viên sang {user.CoachId} đã được chấp nhận.",
                CreatedBy = "Admin",
                NotificationType = isCancelRequest ? "CoachCancelApproved" : "CoachChangeApproved",
                NotificationFor = "Member",
                Condition = "Unread",
                UserID = user.UserID,
                SentAt = DateTime.UtcNow
            };
            await _unitOfWork.Notifications.AddAsync(notification);

            // ✅ Gửi email
            await _mailService.SendHtmlEmailAsync(user.Email, subject, htmlBody);

            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Duyệt yêu cầu huấn luyện viên thành công." });
        }

        // Hủy yêu cầu chờ duyệt đổi huấn luyện viên
        [HttpDelete("cancel-coach-change/{userId}")]
        public async Task<IActionResult> CancelCoachChange(int userId)
        {
            // Tìm người dùng dựa trên userId
            var user = await _unitOfWork.Users.GetByIdAsync(userId);

            // Nếu người dùng không tồn tại hoặc không có yêu cầu đổi huấn luyện viên nào
            if (user == null || user.PendingCoachId == null)
                return NotFound(new { Message = "Không có yêu cầu đổi huấn luyện viên nào đang chờ duyệt." });

            // Xóa yêu cầu pending
            user.PendingCoachId = null;
            user.CoachChangeReason = null;

            // Cập nhật thông tin người dùng
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            // Tạo thông báo cho người dùng
            var notification = new Notification
            {
                NotificationName = "Đã hủy yêu cầu đổi huấn luyện viên",
                Message = "Yêu cầu đổi huấn luyện viên của bạn đã bị hủy.",
                CreatedBy = "Admin",
                NotificationType = "CoachChangeCanceled",
                NotificationFor = "Member",
                Condition = "Unread",
                UserID = user.UserID,
                SentAt = DateTime.UtcNow
            };
            await _unitOfWork.Notifications.AddAsync(notification);

            // Gửi email thông báo cho người dùng
            await _mailService.SendEmailAsync(user.Email, "Yêu cầu đổi huấn luyện viên đã bị hủy",
                $"Chào {user.FullName},\n\nYêu cầu đổi huấn luyện viên của bạn đã bị hủy. Bạn có thể gửi yêu cầu đổi huấn luyện viên mới nếu cần.");

            // Lưu các thay đổi vào cơ sở dữ liệu
            await _unitOfWork.CompleteAsync();

            // Trả về kết quả thành công
            return Ok(new { Message = "Đã hủy yêu cầu đổi huấn luyện viên thành công." });
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
