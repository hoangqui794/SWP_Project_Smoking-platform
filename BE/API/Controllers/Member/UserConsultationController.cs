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
                return Unauthorized(new { Message = "Ngu?i dùng không h?p l?." });
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
                    Message = "Th?i gian tu v?n không h?p l?. Ð?nh d?ng yêu c?u: ngày 'yyyy-MM-dd', gi? 'HH:mm' ho?c 'HH:mm:ss'.",
                    Received = combinedDateTime
                });
            }

            // ? Ngan d?t l?ch quá s?m (ph?i t? ngày mai tr? di)
            if (consultationDateTime.Date <= DateTime.Today)
            {
                return BadRequest(new { Message = "B?n ch? có th? d?t l?ch t? ngày mai tr? di." });
            }

            // ? Gi?i h?n th?i gian d?t l?ch trong kho?ng 08:00 d?n 22:00
            var startTime = new TimeSpan(8, 0, 0);
            var endTime = new TimeSpan(22, 0, 0);
            var selectedTime = consultationDateTime.TimeOfDay;

            if (selectedTime < startTime || selectedTime > endTime)
            {
                return BadRequest(new { Message = "Th?i gian d?t l?ch ch? trong kho?ng 08:00 d?n 10:00." });
            }

            // Ki?m tra Coach h?p l?
            var coach = await _unitOfWork.Users.GetByIdAsync(request.CoachId);
            if (coach == null || coach.RoleID != 3)
            {
                return BadRequest(new { Message = "Coach không t?n t?i ho?c không h?p l?." });
            }

            // Ki?m tra trùng l?ch
            var existingBooking = await _unitOfWork.ConsultationBookings.GetAllAsync();
            var conflictingBooking = existingBooking.FirstOrDefault(booking =>
                booking.CoachID == request.CoachId &&
                booking.BookingDate == consultationDateTime &&
                booking.Status != "Cancelled");

            if (conflictingBooking != null)
            {
                return BadRequest(new { Message = "Th?i gian này dã có l?ch tu v?n. Vui lòng ch?n th?i gian khác." });
            }

            // T?o m?i l?ch
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

            // G?i email cho ngu?i dùng
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            string formattedDateForUser = consultationDateTime.ToString("HH:mm dd-MM-yyyy");
            var emailBodyForUser = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; background-color: #fefefe;'>
                    <h2 style='color: #2c3e50;'>?? Ð?t l?ch tu v?n thành công</h2>
                    <p><strong>Coach:</strong> {coach.FullName}</p>
                    <p><strong>Th?i gian tu v?n:</strong> {formattedDateForUser}</p>
                    <p style='color: #888;'>C?m on b?n dã s? d?ng d?ch v? tu v?n c?a chúng tôi!</p>
                    <hr style='margin: 20px 0;'/>                  
                </div>";
            await _mailService.SendHtmlEmailAsync(user.Email, "Ð?t l?ch tu v?n thành công", emailBodyForUser);

            // G?i email cho coach
            var emailBodyForCoach = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; background-color: #fefefe;'>
                    <h2 style='color: #c0392b;'>?? L?ch tu v?n m?i</h2>
                    <p><strong>Ngu?i dùng:</strong> {user.FullName}</p>
                    <p><strong>Th?i gian tu v?n:</strong> {formattedDateForUser}</p>
                    <p style='color: #888;'>Vui lòng xác nh?n l?ch tu v?n v?i ngu?i dùng trên h? th?ng.</p>
                    <hr style='margin: 20px 0;'/>                
                </div>";
            await _mailService.SendHtmlEmailAsync(coach.Email, "L?ch tu v?n m?i", emailBodyForCoach);

            return Ok(new { Message = "Ð?t l?ch tu v?n thành công. Ch? Coach duy?t." });
        }

        // 2?? Xem l?ch tu v?n c?a ngu?i dùng
        [HttpGet("my-bookings")]
        public async Task<IActionResult> GetMyConsultations()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { Message = "Ngu?i dùng không h?p l?." });
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

        // 3?? H?y l?ch tu v?n (N?u l?ch chua du?c xác nh?n)
        [HttpDelete("cancel/{bookingId}")]
        public async Task<IActionResult> CancelConsultation(int bookingId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { Message = "Ngu?i dùng không h?p l?." });

            var consultation = await _unitOfWork.ConsultationBookings.GetByIdAsync(bookingId);
            if (consultation == null)
                return NotFound(new { Message = "L?ch tu v?n không t?n t?i." });

            if (consultation.UserID != userId)
                return BadRequest(new { Message = "B?n không th? h?y l?ch c?a ngu?i khác." });

            if (consultation.Status != "Pending")
                return BadRequest(new { Message = "Không th? h?y l?ch dã du?c duy?t ho?c dã hoàn thành." });

            var bookingIdCopy = consultation.BookingID;
            consultation.Status = "Cancelled";
            _unitOfWork.ConsultationBookings.Update(consultation);

            await _unitOfWork.CompleteAsync();

            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "noreply@example.com";
            var message = $"L?ch tu v?n #{bookingIdCopy} c?a b?n dã b? hu?.";

            await _mailService.SendEmailAsync(userEmail, "Hu? l?ch tu v?n", message);

            return Ok(new { Message = "Hu? l?ch thành công." });
        }
    }
}
