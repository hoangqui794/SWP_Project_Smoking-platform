using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.API.Models.Admin;
using Smoking.DAL.Interfaces.Repositories;

[ApiController]
[Route("api/admin/consultation")]
[Authorize(Roles = "1")] 
public class AdminConsultationController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public AdminConsultationController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet("all-appointments")]
    public async Task<IActionResult> GetAllAppointments()
    {
        var consultations = await _unitOfWork.ConsultationBookings.GetAllAsync();
        var result = consultations.Select(c => new
        {
            c.BookingID,
            UserName = c.User?.FullName ?? "Unknown",  // Lấy tên User
            CoachName = c.Coach?.FullName ?? "Unknown",  // Lấy tên Coach
            c.BookingDate,
            c.Status,
            c.MeetingLink,
            c.Notes
        });

        return Ok(result);
    }

    // 🔹 Duyệt lịch tư vấn
    [HttpPut("approve/{bookingId}")]
    public async Task<IActionResult> ApproveBooking(int bookingId)
    {
        var booking = await _unitOfWork.ConsultationBookings.GetByIdAsync(bookingId);
        if (booking == null || booking.Status != "Pending")
            return BadRequest(new { Message = "Lịch không tồn tại hoặc không thể duyệt." });

        booking.Status = "Approved";
        _unitOfWork.ConsultationBookings.Update(booking);
        await _unitOfWork.CompleteAsync();

        return Ok(new { Message = "Duyệt lịch thành công." });
    }

    // 🔹 Từ chối lịch tư vấn
    [HttpPut("reject/{bookingId}")]
    public async Task<IActionResult> RejectBooking(int bookingId)
    {
        var booking = await _unitOfWork.ConsultationBookings.GetByIdAsync(bookingId);
        if (booking == null || booking.Status != "Pending")
            return BadRequest(new { Message = "Không thể từ chối." });

        booking.Status = "Rejected";
        _unitOfWork.ConsultationBookings.Update(booking);
        await _unitOfWork.CompleteAsync();

        return Ok(new { Message = "Đã từ chối lịch." });
    }

    // 🔹 Hủy lịch tư vấn
    [HttpDelete("cancel/{bookingId}")]
    public async Task<IActionResult> CancelBooking(int bookingId)
    {
        var booking = await _unitOfWork.ConsultationBookings.GetByIdAsync(bookingId);
        if (booking == null)
            return NotFound(new { Message = "Lịch tư vấn không tồn tại." });

        booking.Status = "Cancelled";
        _unitOfWork.ConsultationBookings.Update(booking);
        await _unitOfWork.CompleteAsync();

        return Ok(new { Message = "Lịch tư vấn đã bị hủy." });
    }

    // 🔹 Cập nhật thông tin cuộc hẹn
    [HttpPut("update/{bookingId}")]
    public async Task<IActionResult> UpdateConsultation(int bookingId, [FromBody] ConsultationUpdate request)
    {
        var booking = await _unitOfWork.ConsultationBookings.GetByIdAsync(bookingId);
        if (booking == null)
            return NotFound();

        booking.MeetingLink = request.MeetingLink;
        booking.Notes = request.Notes;
        _unitOfWork.ConsultationBookings.Update(booking);
        await _unitOfWork.CompleteAsync();

        return Ok(new { Message = "Cập nhật thông tin cuộc hẹn thành công." });
    }
}
