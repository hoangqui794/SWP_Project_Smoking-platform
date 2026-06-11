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
                return BadRequest(new { Message = "L?ch không t?n t?i ho?c không th? duy?t." });

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
                string subject = "L?ch tu v?n dã du?c duy?t";
                string body = $"Xin chào {user.FullName},\n\n"
                            + "Cu?c h?n tu v?n cai thu?c c?a b?n dã du?c chuyên gia ch?p thu?n.\n";

                if (!string.IsNullOrWhiteSpace(booking.MeetingLink))
                {
                    body += $"Link cu?c h?p: {booking.MeetingLink}\n";
                }

                body += "\nHãy d?m b?o có m?t dúng gi? d? bu?i tu v?n hi?u qu?.\n"
                      + "Trân tr?ng,\nH? th?ng h? tr? cai thu?c - QuitSmart";

                await _mailService.SendEmailAsync(user.Email, subject, body);

                // ? Thông báo dúng n?i dung
                await _unitOfWork.Notifications.CreateNotificationAsync(new Notification
                {
                    UserID = booking.UserID,
                    Message = "Cu?c h?n tu v?n c?a b?n dã du?c duy?t.",
                    NotificationType = "Consultation",
                    SentAt = DateTime.UtcNow,
                    NotificationName = "L?ch dã du?c duy?t",
                    CreatedBy = "Coach",
                    NotificationFor = "Member",
                    Condition = "Approved"
                });

                await _unitOfWork.CompleteAsync();
            }

            return Ok(new { Message = "Duy?t l?ch thành công." });
        }



        [HttpPut("reject/{bookingId}")]
        public async Task<IActionResult> RejectBooking(int bookingId)
        {
            var booking = await _unitOfWork.ConsultationBookings.GetByIdAsync(bookingId);
            if (booking == null || booking.Status != "Pending")
                return BadRequest(new { Message = "Không th? t? ch?i." });

            booking.Status = "Rejected";
            _unitOfWork.ConsultationBookings.Update(booking);
            await _unitOfWork.CompleteAsync();

            // G?i mail
            var user = await _unitOfWork.Users.GetByIdAsync(booking.UserID);
            if (user != null && !string.IsNullOrWhiteSpace(user.Email))
            {
                string subject = "L?ch tu v?n b? t? ch?i";
                string body = $"Xin chào {user.FullName},\n\nL?ch tu v?n b?n d?t dã b? t? ch?i b?i hu?n luy?n viên.\n"
                            + "Vui lòng d?t l?i l?ch khác.\n\nTrân tr?ng,\nH? th?ng QuitSmart";

                await _mailService.SendEmailAsync(user.Email, subject, body);
            }

            // G?i thông báo lên h? th?ng
            await _unitOfWork.Notifications.CreateNotificationAsync(new Notification
            {
                UserID = booking.UserID,
                Message = "L?ch tu v?n c?a b?n dã b? t? ch?i. Vui lòng d?t l?i l?ch m?i.",
                NotificationType = "Consultation",
                SentAt = DateTime.UtcNow,
                NotificationName = "L?ch b? t? ch?i",
                CreatedBy = "Coach",
                NotificationFor = "Member",
                Condition = "Rejected"
            });

            await _unitOfWork.CompleteAsync();
            return Ok(new { Message = "Ðã t? ch?i l?ch." });
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
                string subject = "C?p nh?t thông tin cu?c h?n";
                string body = $"Xin chào {user.FullName},\n\n"
                            + "Thông tin cu?c h?n tu v?n c?a b?n dã du?c chuyên gia c?p nh?t.\n";

                if (!string.IsNullOrWhiteSpace(booking.MeetingLink))
                {
                    body += $"Link h?p m?i: {booking.MeetingLink}\n";
                }

                body += "\nVui lòng ki?m tra và tham gia dúng gi?.\n"
                      + "Trân tr?ng,\nH? th?ng h? tr? cai thu?c - QuitSmart";

                await _mailService.SendEmailAsync(user.Email, subject, body);
            }  // G?i thông báo lên h? th?ng
            await _unitOfWork.Notifications.CreateNotificationAsync(new Notification
            {
                UserID = booking.UserID,
                Message = "Thông tin cu?c h?n tu v?n c?a b?n dã du?c c?p nh?t.",
                NotificationType = "Consultation",
                SentAt = DateTime.UtcNow,
                NotificationName = "C?p nh?t cu?c h?n",
                CreatedBy = "Coach",
                NotificationFor = "Member",
                Condition = "Updated"
            });
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Ðã c?p nh?t thông tin cu?c h?n." });
        }


        [HttpPut("complete/{bookingId}")]
        public async Task<IActionResult> CompleteConsultation(int bookingId)
        {
            var booking = await _unitOfWork.ConsultationBookings.GetByIdAsync(bookingId);
            if (booking == null || booking.Status != "Approved")
                return BadRequest(new { Message = "Ch? có th? hoàn thành l?ch dã du?c duy?t." });

            booking.Status = "Completed";
            _unitOfWork.ConsultationBookings.Update(booking);
            await _unitOfWork.Notifications.CreateNotificationAsync(new Notification
            {
                UserID = booking.UserID,
                Message = "Cu?c h?n tu v?n c?a b?n dã du?c dánh d?u hoàn thành.",
                NotificationType = "Consultation",
                SentAt = DateTime.UtcNow,
                NotificationName = "Hoàn thành tu v?n",
                CreatedBy = "Coach",
                NotificationFor = "Member",
                Condition = "Completed"
            });
            await _unitOfWork.CompleteAsync();

            return Ok(new { Message = "Ðã dánh d?u hoàn thành." });
        }
    }
}
