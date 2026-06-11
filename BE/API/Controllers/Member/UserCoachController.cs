    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Smoking.API.Models.User;
using Smoking.BLL.Interfaces;
using Smoking.BLL.Services;
    using Smoking.DAL.Entities;
    using Smoking.DAL.Interfaces.Repositories;
    using System.Linq;
    using System.Security.Claims;
    using System.Threading.Tasks;


namespace Smoking.API.Controllers.Member
    {
        [ApiController]
        [Route("api/user/coach")]
        [Authorize(Roles = "2")] 
        public class UserCoachController : ControllerBase
        {
            private readonly IUnitOfWork _unitOfWork;
        private readonly IMailService _mailService;

        public UserCoachController(IUnitOfWork unitOfWork, IMailService mailService)
        {
            _unitOfWork = unitOfWork;
            _mailService = mailService; 
        }


        // 🔹 1. Lấy danh sách tất cả các coach đang hoạt động
        [HttpGet("list")]
        [Authorize(Roles = "2")]
        public async Task<IActionResult> GetAllCoaches()
            {
                var coaches = await _unitOfWork.Users.GetUsersByRoleAsync(roleId: 3); 

                return Ok(coaches.Select(c => new
                {
                    CoachId = c.UserID,
                    FullName = c.FullName,
                    Email = c.Email,
                    Phone = c.PhoneNumber,
                    Description = c.Description,
                    Gender = c.Gender,
                    DateOfBirth = c.DateOfBirth,
                    ProfilePicture = c.ProfilePicture
                }));
            }

            // 🔹 2. Chọn coach (chỉ khi user có gói Premium còn hiệu lực)
            [HttpPost("choose/{coachId}")]
            public async Task<IActionResult> ChooseCoach(int coachId)
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                // 🟡 Kiểm tra membership Premium còn hiệu lực
                var activeMembership = await _unitOfWork.UserMemberships.GetLatestValidMembershipByUserIdAsync(userId);
                if (activeMembership == null)
                    return BadRequest(new { Message = "Bạn chưa đăng ký gói Premium hoặc gói đã hết hạn." });

                var package = await _unitOfWork.MembershipPackages.GetByIdAsync(activeMembership.PackageID);
                if (package == null || !package.PackageType.Equals("Premium", System.StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { Message = "Chỉ người dùng có gói Premium mới được chọn huấn luyện viên." });

                // 🟢 Gán CoachId cho user
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null) return NotFound();

                user.CoachId = coachId;
                _unitOfWork.Users.Update(user);
                await _unitOfWork.CompleteAsync();

                return Ok(new { Message = "Đã chọn huấn luyện viên thành công." });
            }

            // 🔹 3. Xem thông tin coach đã chọn
            [HttpGet("my-coach")]
            public async Task<IActionResult> GetMyCoach()
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var user = await _unitOfWork.Users.GetByIdWithCoachAsync(userId);

                if (user == null || user.CoachId == null)
                    return NotFound(new { Message = "Bạn chưa chọn huấn luyện viên." });

                var coach = user.Coach;
                return Ok(new
                {
                    CoachId = coach.UserID,
                    FullName = coach.FullName,
                    Email = coach.Email,
                    Phone = coach.PhoneNumber,
                    Description = coach.Description,
                    Gender = coach.Gender,
                    ProfilePicture = coach.ProfilePicture
                });
            }
            // 🔹 4. Lấy thông tin chi tiết của coach theo ID
            [HttpGet("{coachId}")]
            [AllowAnonymous] // hoặc [Authorize] nếu chỉ cho người dùng đã đăng nhập xem
            public async Task<IActionResult> GetCoachById(int coachId)
            {
                var coach = await _unitOfWork.Users.GetByIdAsync(coachId);

                if (coach == null || coach.RoleID != 3 || coach.Status != "Active")
                    return NotFound(new { Message = "Không tìm thấy huấn luyện viên phù hợp." });

                return Ok(new
                {
                    Message = "Thông tin huấn luyện viên",
                    Coach = new
                    {
                        coach.UserID,
                        coach.FullName,
                        coach.Email,
                        coach.PhoneNumber,
                        coach.Gender,
                        DateOfBirth = coach.DateOfBirth?.ToString("yyyy-MM-dd"),
                        coach.ProfilePicture,
                        coach.Status,
                        coach.Description
                    }
                });
            }
        // 🔸 5. Yêu cầu đổi huấn luyện viên (sẽ chờ admin duyệt)
        [HttpPost("request-change")]
        public async Task<IActionResult> RequestChangeCoach([FromBody] ChangeCoachRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return NotFound();

            if (string.IsNullOrWhiteSpace(request.Reason))
                return BadRequest(new { Message = "Vui lòng nhập lý do đổi huấn luyện viên." });

            // ✅ Kiểm tra premium còn hiệu lực
            var activeMembership = await _unitOfWork.UserMemberships.GetLatestValidMembershipByUserIdAsync(userId);
            if (activeMembership == null)
                return BadRequest(new { Message = "Bạn không còn hiệu lực để đổi huấn luyện viên." });

            var package = await _unitOfWork.MembershipPackages.GetByIdAsync(activeMembership.PackageID);
            if (package == null || !package.PackageType.Equals("Premium", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { Message = "Chỉ người dùng gói Premium mới được đổi huấn luyện viên." });

            if (user.PendingCoachId != null)
                return BadRequest(new { Message = "Bạn đã gửi yêu cầu đổi coach, vui lòng chờ admin duyệt." });

            // ✅ Lấy thông tin coach mới
            var newCoach = await _unitOfWork.Users.GetByIdAsync(request.NewCoachId);
            if (newCoach == null || newCoach.RoleID != 3)
                return NotFound(new { Message = "Huấn luyện viên mới không hợp lệ." });

            // ✅ Lưu yêu cầu đổi coach
            user.PendingCoachId = request.NewCoachId;
            user.CoachChangeReason = request.Reason; 

            _unitOfWork.Users.Update(user);

            // ✅ Gửi thông báo hệ thống (cho admin)
            var admins = await _unitOfWork.Users.GetUsersByRoleAsync(1); // role 1 = Admin
            foreach (var admin in admins)
            {
                var notification = new Notification
                {
                    NotificationName = "Yêu cầu đổi coach",
                    Message = $"Người dùng {user.FullName} yêu cầu đổi sang coach mới: {newCoach.FullName}.",
                    Condition = "Unread",
                    CreatedBy = user.FullName,
                    NotificationType = "CoachChangeRequest",
                    NotificationFor = "Admin",
                    UserID = admin.UserID,
                    SentAt = DateTime.UtcNow
                };

                await _unitOfWork.Notifications.AddAsync(notification);
            }

            // ✅ Gửi email cho admin
            await _mailService.SendEmailAsync("admin@example.com", "Yêu cầu đổi huấn luyện viên",
      $"Người dùng {user.FullName} ({user.Email}) yêu cầu đổi sang coach: {newCoach.FullName}\n\nLý do: {request.Reason}");


            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Đã gửi yêu cầu đổi huấn luyện viên, vui lòng chờ xét duyệt." });
        }
        // hủy coach
        [HttpPost("request-cancel-coach")]
        public async Task<IActionResult> RequestCancelCoach([FromBody] CancelCoachRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return NotFound();

            if (string.IsNullOrWhiteSpace(request.Reason))
                return BadRequest(new { Message = "Vui lòng nhập lý do hủy huấn luyện viên." });

            if (user.CoachId == null)
                return BadRequest(new { Message = "Bạn chưa có huấn luyện viên để hủy." });

            if (user.PendingCoachId != null)
                return BadRequest(new { Message = "Bạn đang có yêu cầu đổi coach đang chờ xử lý." });

            // ✅ Ghi thông tin yêu cầu hủy coach vào CoachChangeReason và đánh dấu PendingCoachId = -1
            user.CoachChangeReason = request.Reason;
            user.PendingCoachId = -1; // -1 sẽ được hiểu là “Yêu cầu hủy coach”

            _unitOfWork.Users.Update(user);

            var currentCoach = await _unitOfWork.Users.GetByIdAsync(user.CoachId.Value);
            var admins = await _unitOfWork.Users.GetUsersByRoleAsync(1);

            // ✅ Gửi thông báo hệ thống
            foreach (var admin in admins)
            {
                var noti = new Notification
                {
                    NotificationName = "Yêu cầu hủy huấn luyện viên",
                    Message = $"Người dùng {user.FullName} yêu cầu hủy coach hiện tại: {currentCoach.FullName}.",
                    Condition = "Unread",
                    CreatedBy = user.FullName,
                    NotificationType = "CoachCancelRequest",
                    NotificationFor = "Admin",
                    UserID = admin.UserID,
                    SentAt = DateTime.UtcNow
                };

                await _unitOfWork.Notifications.AddAsync(noti);
            }

            // ✅ Gửi email cho Admin
            string htmlBody = $@"
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; background-color: #fefefe;'>
        <h2 style='color: #c0392b;'>🛑 Yêu cầu hủy huấn luyện viên</h2>
        <p><strong>Người dùng:</strong> {user.FullName} (<a href='mailto:{user.Email}'>{user.Email}</a>)</p>
        <p><strong>Huấn luyện viên hiện tại:</strong> {currentCoach.FullName}</p>
        <p><strong>Lý do hủy:</strong> <em>{request.Reason}</em></p>
        <hr style='margin: 20px 0;'/>
        <p style='color: #888;'>Email này được tạo tự động từ hệ thống cai thuốc Smoking Platform.</p>
    </div>";

            await _mailService.SendHtmlEmailAsync("admin@example.com", "🛑 Yêu cầu hủy huấn luyện viên", htmlBody);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Đã gửi yêu cầu hủy huấn luyện viên, vui lòng chờ admin xét duyệt." });
        }


    }
}
