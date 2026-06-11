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


        // ?? 1. L?y danh sách t?t c? các coach dang ho?t d?ng
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

            // ?? 2. Ch?n coach (ch? khi user có gói Premium còn hi?u l?c)
            [HttpPost("choose/{coachId}")]
            public async Task<IActionResult> ChooseCoach(int coachId)
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

                // ?? Ki?m tra membership Premium còn hi?u l?c
                var activeMembership = await _unitOfWork.UserMemberships.GetLatestValidMembershipByUserIdAsync(userId);
                if (activeMembership == null)
                    return BadRequest(new { Message = "B?n chua dang ký gói Premium ho?c gói dã h?t h?n." });

                var package = await _unitOfWork.MembershipPackages.GetByIdAsync(activeMembership.PackageID);
                if (package == null || !package.PackageType.Equals("Premium", System.StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { Message = "Ch? ngu?i dùng có gói Premium m?i du?c ch?n hu?n luy?n viên." });

                // ?? Gán CoachId cho user
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null) return NotFound();

                user.CoachId = coachId;
                _unitOfWork.Users.Update(user);
                await _unitOfWork.CompleteAsync();

                return Ok(new { Message = "Ðã ch?n hu?n luy?n viên thành công." });
            }

            // ?? 3. Xem thông tin coach dã ch?n
            [HttpGet("my-coach")]
            public async Task<IActionResult> GetMyCoach()
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var user = await _unitOfWork.Users.GetByIdWithCoachAsync(userId);

                if (user == null || user.CoachId == null)
                    return NotFound(new { Message = "B?n chua ch?n hu?n luy?n viên." });

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
            // ?? 4. L?y thông tin chi ti?t c?a coach theo ID
            [HttpGet("{coachId}")]
            [AllowAnonymous] // ho?c [Authorize] n?u ch? cho ngu?i dùng dã dang nh?p xem
            public async Task<IActionResult> GetCoachById(int coachId)
            {
                var coach = await _unitOfWork.Users.GetByIdAsync(coachId);

                if (coach == null || coach.RoleID != 3 || coach.Status != "Active")
                    return NotFound(new { Message = "Không tìm th?y hu?n luy?n viên phù h?p." });

                return Ok(new
                {
                    Message = "Thông tin hu?n luy?n viên",
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
        // ?? 5. Yêu c?u d?i hu?n luy?n viên (s? ch? admin duy?t)
        [HttpPost("request-change")]
        public async Task<IActionResult> RequestChangeCoach([FromBody] ChangeCoachRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return NotFound();

            if (string.IsNullOrWhiteSpace(request.Reason))
                return BadRequest(new { Message = "Vui lòng nh?p lý do d?i hu?n luy?n viên." });

            // ? Ki?m tra premium còn hi?u l?c
            var activeMembership = await _unitOfWork.UserMemberships.GetLatestValidMembershipByUserIdAsync(userId);
            if (activeMembership == null)
                return BadRequest(new { Message = "B?n không còn hi?u l?c d? d?i hu?n luy?n viên." });

            var package = await _unitOfWork.MembershipPackages.GetByIdAsync(activeMembership.PackageID);
            if (package == null || !package.PackageType.Equals("Premium", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { Message = "Ch? ngu?i dùng gói Premium m?i du?c d?i hu?n luy?n viên." });

            if (user.PendingCoachId != null)
                return BadRequest(new { Message = "B?n dã g?i yêu c?u d?i coach, vui lòng ch? admin duy?t." });

            // ? L?y thông tin coach m?i
            var newCoach = await _unitOfWork.Users.GetByIdAsync(request.NewCoachId);
            if (newCoach == null || newCoach.RoleID != 3)
                return NotFound(new { Message = "Hu?n luy?n viên m?i không h?p l?." });

            // ? Luu yêu c?u d?i coach
            user.PendingCoachId = request.NewCoachId;
            user.CoachChangeReason = request.Reason; 

            _unitOfWork.Users.Update(user);

            // ? G?i thông báo h? th?ng (cho admin)
            var admins = await _unitOfWork.Users.GetUsersByRoleAsync(1); // role 1 = Admin
            foreach (var admin in admins)
            {
                var notification = new Notification
                {
                    NotificationName = "Yêu c?u d?i coach",
                    Message = $"Ngu?i dùng {user.FullName} yêu c?u d?i sang coach m?i: {newCoach.FullName}.",
                    Condition = "Unread",
                    CreatedBy = user.FullName,
                    NotificationType = "CoachChangeRequest",
                    NotificationFor = "Admin",
                    UserID = admin.UserID,
                    SentAt = DateTime.UtcNow
                };

                await _unitOfWork.Notifications.AddAsync(notification);
            }

            // ? G?i email cho admin
            await _mailService.SendEmailAsync("admin@example.com", "Yêu c?u d?i hu?n luy?n viên",
      $"Ngu?i dùng {user.FullName} ({user.Email}) yêu c?u d?i sang coach: {newCoach.FullName}\n\nLý do: {request.Reason}");


            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Ðã g?i yêu c?u d?i hu?n luy?n viên, vui lòng ch? xét duy?t." });
        }
        // h?y coach
        [HttpPost("request-cancel-coach")]
        public async Task<IActionResult> RequestCancelCoach([FromBody] CancelCoachRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return NotFound();

            if (string.IsNullOrWhiteSpace(request.Reason))
                return BadRequest(new { Message = "Vui lòng nh?p lý do h?y hu?n luy?n viên." });

            if (user.CoachId == null)
                return BadRequest(new { Message = "B?n chua có hu?n luy?n viên d? h?y." });

            if (user.PendingCoachId != null)
                return BadRequest(new { Message = "B?n dang có yêu c?u d?i coach dang ch? x? lý." });

            // ? Ghi thông tin yêu c?u h?y coach vào CoachChangeReason và dánh d?u PendingCoachId = -1
            user.CoachChangeReason = request.Reason;
            user.PendingCoachId = -1; // -1 s? du?c hi?u là “Yêu c?u h?y coach”

            _unitOfWork.Users.Update(user);

            var currentCoach = await _unitOfWork.Users.GetByIdAsync(user.CoachId.Value);
            var admins = await _unitOfWork.Users.GetUsersByRoleAsync(1);

            // ? G?i thông báo h? th?ng
            foreach (var admin in admins)
            {
                var noti = new Notification
                {
                    NotificationName = "Yêu c?u h?y hu?n luy?n viên",
                    Message = $"Ngu?i dùng {user.FullName} yêu c?u h?y coach hi?n t?i: {currentCoach.FullName}.",
                    Condition = "Unread",
                    CreatedBy = user.FullName,
                    NotificationType = "CoachCancelRequest",
                    NotificationFor = "Admin",
                    UserID = admin.UserID,
                    SentAt = DateTime.UtcNow
                };

                await _unitOfWork.Notifications.AddAsync(noti);
            }

            // ? G?i email cho Admin
            string htmlBody = $@"
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; background-color: #fefefe;'>
        <h2 style='color: #c0392b;'>?? Yêu c?u h?y hu?n luy?n viên</h2>
        <p><strong>Ngu?i dùng:</strong> {user.FullName} (<a href='mailto:{user.Email}'>{user.Email}</a>)</p>
        <p><strong>Hu?n luy?n viên hi?n t?i:</strong> {currentCoach.FullName}</p>
        <p><strong>Lý do h?y:</strong> <em>{request.Reason}</em></p>
        <hr style='margin: 20px 0;'/>
        <p style='color: #888;'>Email này du?c t?o t? d?ng t? h? th?ng cai thu?c Smoking Platform.</p>
    </div>";

            await _mailService.SendHtmlEmailAsync("admin@example.com", "?? Yêu c?u h?y hu?n luy?n viên", htmlBody);
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Ðã g?i yêu c?u h?y hu?n luy?n viên, vui lòng ch? admin xét duy?t." });
        }


    }
}
