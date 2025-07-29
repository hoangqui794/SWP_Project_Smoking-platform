using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.API.Models.Admin;
using Smoking.BLL.Interfaces;

namespace Smoking.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/payments")]
    [Authorize(Roles = "1")] // Role 1 = Admin
    public class AdminPaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public AdminPaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        // GET: api/admin/payments/all
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var payments = await _paymentService.GetPaymentsByFilterAsync(null, null, null, null);
            return Ok(ToDto(payments));
        }

        // GET: api/admin/payments/by-date?fromDate=2025-06-01&toDate=2025-07-01
        [HttpGet("by-date")]
        public async Task<IActionResult> GetByDate(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            var payments = await _paymentService.GetPaymentsByFilterAsync(fromDate, toDate, null, null);
            return Ok(ToDto(payments));
        }

        // GET: api/admin/payments/by-user/5
        [HttpGet("by-user/{userId}")]
        public async Task<IActionResult> GetByUser(int userId)
        {
            var payments = await _paymentService.GetPaymentsByFilterAsync(null, null, null, userId);
            return Ok(ToDto(payments));
        }

        // GET: api/admin/payments/by-status?status=Success
        [HttpGet("by-status")]
        public async Task<IActionResult> GetByStatus([FromQuery] string status)
        {
            var payments = await _paymentService.GetPaymentsByFilterAsync(null, null, status, null);
            return Ok(ToDto(payments));
        }

        // Helper to map to DTO
        private static IEnumerable<AdminPaymentDto> ToDto(IEnumerable<Smoking.DAL.Entities.Payment> payments)
        {
            return payments.Select(p => new AdminPaymentDto
            {
                PaymentId = p.PaymentID,
                UserName = p.User.FullName,
                Email = p.User.Email,
                PackageName = p.Package.PackageName,
                Amount = p.Amount,
                Method = p.PaymentMethod,
                Status = p.Status,
                CreatedAt = p.PaymentDate,
                EndDate = p.UserMembership?.EndDate
            });
        }
    }
}
