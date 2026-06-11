using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.API.Models.Coach;
using Smoking.BLL.Interfaces;
using Smoking.BLL.Services;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Security.Claims;

namespace Smoking.API.Controllers.Coach
{
    [ApiController]
    [Route("api/coach/consultation")]
    [Authorize(Roles = "3")]
    public class CoachConsultationController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMailService _mailService;

        public CoachConsultationController(IUnitOfWork unitOfWork, IMailService mailService)
        {
            _unitOfWork = unitOfWork;
            _mailService = mailService;
        }

        [HttpGet("my-appointments")]
        public async Task<IActionResult> GetAppointments()
        {
            var coachId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var bookings = await _unitOfWork.ConsultationBookings.GetByCoachIdAsync(coachId);

            return Ok(bookings.Select(b => new
            {
                b.BookingID,
                UserName = b.User?.FullName ?? "Unknown",
                b.BookingDate,
                b.Status,
                b.Notes,
                b.MeetingLink,
                b.PreferredLanguage
            }));
        }

        [HttpPut("approve/{bookingId}")]
        public async Task<IActionResult> ApproveBooking(int bookingId, [FromBody] CoachUpdateRequest request)
        {
            var booking = await _unitOfWork.ConsultationBookings.GetByIdAsync(bookingId);
            if (booking == null || booking.Status != "Pending")
                return BadRequest(new { Message = "Lịch không tồn tại hoặc không thể duyệt." });

            booking.Status = "Approved";
            if (!string.IsNullOrWhiteSpace(request.MeetingLink))
            {
                booking.MeetingLink = request.MeetingLink;
            }

            _unitOfWork.ConsultationBookings.Update(booking);
            await _unitOfWork.CompleteAsync();

            var user = await _unitOfWork.Users.GetByIdAsync(booking.UserID);
            if (user != null && !string.IsNullOrWhiteSpace(user.Email))
            {
                string subject = "Lịch tư vấn đã được duyệt";
                string body = $"Xin chào {user.FullName},\n\n"
                            + "Cuộc hẹn tư vấn cai thuốc của bạn đã được chuyên gia chấp thuận.\n";

                if (!string.IsNullOrWhiteSpace(booking.MeetingLink))
                {
                    body += $"Link cuộc họp: {booking.MeetingLink}\n";
                }

                body += "\nHãy đảm bảo có mặt đúng giờ để buổi tư vấn hiệu quả.\n"
                      + "Trân trọng,\nHệ thống hỗ trợ cai thuốc - QuitSmart";

                await _mailService.SendEmailAsync(user.Email, subject, body);

                // ✅ Thông báo đúng nội dung
                await _unitOfWork.Notifications.CreateNotificationAsync(new Notification
                {
                    UserID = booking.UserID,
                    Message = "Cuộc hẹn tư vấn của bạn đã được duyệt.",
                    NotificationType = "Consultation",
                    SentAt = DateTime.UtcNow,
                    NotificationName = "Lịch đã được duyệt",
                    CreatedBy = "Coach",
                    NotificationFor = "Member",
                    Condition = "Approved"
                });

                await _unitOfWork.CompleteAsync();
            }

            return Ok(new { Message = "Duyệt lịch thành công." });
        }



        [HttpPut("reject/{bookingId}")]
        public async Task<IActionResult> RejectBooking(int bookingId)
        {
            var booking = await _unitOfWork.ConsultationBookings.GetByIdAsync(bookingId);
            if (booking == null || booking.Status != "Pending")
                return BadRequest(new { Message = "Không thể từ chối." });

            booking.Status = "Rejected";
            _unitOfWork.ConsultationBookings.Update(booking);
            await _unitOfWork.CompleteAsync();

            // Gửi mail
            var user = await _unitOfWork.Users.GetByIdAsync(booking.UserID);
            if (user != null && !string.IsNullOrWhiteSpace(user.Email))
            {
                string subject = "Lịch tư vấn bị từ chối";
                string body = $"Xin chào {user.FullName},\n\nLịch tư vấn bạn đặt đã bị từ chối bởi huấn luyện viên.\n"
                            + "Vui lòng đặt lại lịch khác.\n\nTrân trọng,\nHệ thống QuitSmart";

                await _mailService.SendEmailAsync(user.Email, subject, body);
            }

            // Gửi thông báo lên hệ thống
            await _unitOfWork.Notifications.CreateNotificationAsync(new Notification
            {
                UserID = booking.UserID,
                Message = "Lịch tư vấn của bạn đã bị từ chối. Vui lòng đặt lại lịch mới.",
                NotificationType = "Consultation",
                SentAt = DateTime.UtcNow,
                NotificationName = "Lịch bị từ chối",
                CreatedBy = "Coach",
                NotificationFor = "Member",
                Condition = "Rejected"
            });

            await _unitOfWork.CompleteAsync();
            return Ok(new { Message = "Đã từ chối lịch." });
        }


        [HttpPut("update/{bookingId}")]
        public async Task<IActionResult> UpdateConsultation(int bookingId, [FromBody] CoachUpdateRequest request)
        {
            var booking = await _unitOfWork.ConsultationBookings.GetByIdAsync(bookingId);
            if (booking == null)
                return NotFound();

            booking.MeetingLink = request.MeetingLink;
            booking.CoachNotes = request.CoachNotes;
            booking.PreferredLanguage = request.PreferredLanguage;

            _unitOfWork.ConsultationBookings.Update(booking);
            await _unitOfWork.CompleteAsync();

            var user = await _unitOfWork.Users.GetByIdAsync(booking.UserID);
            if (user != null && !string.IsNullOrWhiteSpace(user.Email))
            {
                string subject = "Cập nhật thông tin cuộc hẹn";
                string body = $"Xin chào {user.FullName},\n\n"
                            + "Thông tin cuộc hẹn tư vấn của bạn đã được chuyên gia cập nhật.\n";

                if (!string.IsNullOrWhiteSpace(booking.MeetingLink))
                {
                    body += $"Link họp mới: {booking.MeetingLink}\n";
                }

                body += "\nVui lòng kiểm tra và tham gia đúng giờ.\n"
                      + "Trân trọng,\nHệ thống hỗ trợ cai thuốc - QuitSmart";

                await _mailService.SendEmailAsync(user.Email, subject, body);
            }  // Gửi thông báo lên hệ thống
            await _unitOfWork.Notifications.CreateNotificationAsync(new Notification
            {
                UserID = booking.UserID,
                Message = "Thông tin cuộc hẹn tư vấn của bạn đã được cập nhật.",
                NotificationType = "Consultation",
                SentAt = DateTime.UtcNow,
                NotificationName = "Cập nhật cuộc hẹn",
                CreatedBy = "Coach",
                NotificationFor = "Member",
                Condition = "Updated"
            });
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Đã cập nhật thông tin cuộc hẹn." });
        }


        [HttpPut("complete/{bookingId}")]
        public async Task<IActionResult> CompleteConsultation(int bookingId)
        {
            var booking = await _unitOfWork.ConsultationBookings.GetByIdAsync(bookingId);
            if (booking == null || booking.Status != "Approved")
                return BadRequest(new { Message = "Chỉ có thể hoàn thành lịch đã được duyệt." });

            booking.Status = "Completed";
            _unitOfWork.ConsultationBookings.Update(booking);
            await _unitOfWork.Notifications.CreateNotificationAsync(new Notification
            {
                UserID = booking.UserID,
                Message = "Cuộc hẹn tư vấn của bạn đã được đánh dấu hoàn thành.",
                NotificationType = "Consultation",
                SentAt = DateTime.UtcNow,
                NotificationName = "Hoàn thành tư vấn",
                CreatedBy = "Coach",
                NotificationFor = "Member",
                Condition = "Completed"
            });
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Đã đánh dấu hoàn thành." });
        }
    }
}
