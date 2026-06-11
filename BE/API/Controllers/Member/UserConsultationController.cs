using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.API.Models.User;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Smoking.API.Controllers.Member
{
    [ApiController]
    [Route("api/user/consultation")]
    [Authorize(Roles = "2")]
    public class UserConsultationController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMailService _mailService;

        public UserConsultationController(IUnitOfWork unitOfWork, IMailService mailService)
        {
            _unitOfWork = unitOfWork;
            _mailService = mailService;
        }

        [HttpPost("book")]
        public async Task<IActionResult> BookConsultation([FromBody] ConsultationRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Người dùng không hợp lệ." });
            }

            var consultationDate = string.IsNullOrWhiteSpace(request.ConsultationDate)
                ? DateTime.Today.AddDays(1).ToString("yyyy-MM-dd")
                : request.ConsultationDate;

            var consultationTime = string.IsNullOrWhiteSpace(request.ConsultationTime)
                ? "08:00:00"
                : request.ConsultationTime;

            string combinedDateTime = $"{consultationDate}T{consultationTime}";

            if (!DateTime.TryParseExact(
                    combinedDateTime,
                    new[] { "yyyy-MM-ddTHH:mm", "yyyy-MM-ddTHH:mm:ss" },
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.None,
                    out var consultationDateTime))
            {
                return BadRequest(new
                {
                    Message = "Thời gian tư vấn không hợp lệ. Định dạng yêu cầu: ngày 'yyyy-MM-dd', giờ 'HH:mm' hoặc 'HH:mm:ss'.",
                    Received = combinedDateTime
                });
            }

            // ✅ Ngăn đặt lịch quá sớm (phải từ ngày mai trở đi)
            if (consultationDateTime.Date <= DateTime.Today)
            {
                return BadRequest(new { Message = "Bạn chỉ có thể đặt lịch từ ngày mai trở đi." });
            }

            // ✅ Giới hạn thời gian đặt lịch trong khoảng 08:00 đến 22:00
            var startTime = new TimeSpan(8, 0, 0);
            var endTime = new TimeSpan(22, 0, 0);
            var selectedTime = consultationDateTime.TimeOfDay;

            if (selectedTime < startTime || selectedTime > endTime)
            {
                return BadRequest(new { Message = "Thời gian đặt lịch chỉ trong khoảng 08:00 đến 10:00." });
            }

            // Kiểm tra Coach hợp lệ
            var coach = await _unitOfWork.Users.GetByIdAsync(request.CoachId);
            if (coach == null || coach.RoleID != 3)
            {
                return BadRequest(new { Message = "Coach không tồn tại hoặc không hợp lệ." });
            }

            // Kiểm tra trùng lịch
            var existingBooking = await _unitOfWork.ConsultationBookings.GetAllAsync();
            var conflictingBooking = existingBooking.FirstOrDefault(booking =>
                booking.CoachID == request.CoachId &&
                booking.BookingDate == consultationDateTime &&
                booking.Status != "Cancelled");

            if (conflictingBooking != null)
            {
                return BadRequest(new { Message = "Thời gian này đã có lịch tư vấn. Vui lòng chọn thời gian khác." });
            }

            // Tạo mới lịch
            var consultation = new ConsultationBooking
            {
                UserID = userId,
                CoachID = request.CoachId,
                BookingDate = consultationDateTime,
                //Duration = request.Duration,
                Status = "Pending",
                CreatedDate = DateTime.UtcNow,
                Notes = request.Notes
            };

            await _unitOfWork.ConsultationBookings.AddAsync(consultation);
            await _unitOfWork.CompleteAsync();

            // Gửi email cho người dùng
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            string formattedDateForUser = consultationDateTime.ToString("HH:mm dd-MM-yyyy");
            var emailBodyForUser = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; background-color: #fefefe;'>
                    <h2 style='color: #2c3e50;'>📅 Đặt lịch tư vấn thành công</h2>
                    <p><strong>Coach:</strong> {coach.FullName}</p>
                    <p><strong>Thời gian tư vấn:</strong> {formattedDateForUser}</p>
                    <p style='color: #888;'>Cảm ơn bạn đã sử dụng dịch vụ tư vấn của chúng tôi!</p>
                    <hr style='margin: 20px 0;'/>                  
                </div>";
            await _mailService.SendHtmlEmailAsync(user.Email, "Đặt lịch tư vấn thành công", emailBodyForUser);

            // Gửi email cho coach
            var emailBodyForCoach = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; background-color: #fefefe;'>
                    <h2 style='color: #c0392b;'>📅 Lịch tư vấn mới</h2>
                    <p><strong>Người dùng:</strong> {user.FullName}</p>
                    <p><strong>Thời gian tư vấn:</strong> {formattedDateForUser}</p>
                    <p style='color: #888;'>Vui lòng xác nhận lịch tư vấn với người dùng trên hệ thống.</p>
                    <hr style='margin: 20px 0;'/>                
                </div>";
            await _mailService.SendHtmlEmailAsync(coach.Email, "Lịch tư vấn mới", emailBodyForCoach);

            return Ok(new { Message = "Đặt lịch tư vấn thành công. Chờ Coach duyệt." });
        }

        // 2️⃣ Xem lịch tư vấn của người dùng
        [HttpGet("my-bookings")]
        public async Task<IActionResult> GetMyConsultations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Người dùng không hợp lệ." });
            }

            var consultations = await _unitOfWork.ConsultationBookings.GetByUserIdAsync(userId);

            return Ok(consultations.Select(c => new
            {
                c.BookingID,
                CoachName = c.Coach?.FullName ?? "Unknown",
                c.BookingDate,
                c.Duration,
                c.Status,
                c.MeetingLink,
                c.Notes
            }));
        }

        // 3️⃣ Hủy lịch tư vấn (Nếu lịch chưa được xác nhận)
        [HttpDelete("cancel/{bookingId}")]
        public async Task<IActionResult> CancelConsultation(int bookingId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { Message = "Người dùng không hợp lệ." });

            var consultation = await _unitOfWork.ConsultationBookings.GetByIdAsync(bookingId);
            if (consultation == null)
                return NotFound(new { Message = "Lịch tư vấn không tồn tại." });

            if (consultation.UserID != userId)
                return BadRequest(new { Message = "Bạn không thể hủy lịch của người khác." });

            if (consultation.Status != "Pending")
                return BadRequest(new { Message = "Không thể hủy lịch đã được duyệt hoặc đã hoàn thành." });

            var bookingIdCopy = consultation.BookingID;
            consultation.Status = "Cancelled";
            _unitOfWork.ConsultationBookings.Update(consultation);

            await _unitOfWork.CompleteAsync();

            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "noreply@example.com";
            var message = $"Lịch tư vấn #{bookingIdCopy} của bạn đã bị huỷ.";

            await _mailService.SendEmailAsync(userEmail, "Huỷ lịch tư vấn", message);

            return Ok(new { Message = "Huỷ lịch thành công." });
        }
    }
}
