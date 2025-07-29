using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.API.Models.User;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Security.Claims;

namespace Smoking.API.Controllers.Member
{
    [ApiController]
    [Route("api/membership")]
    [Authorize(Roles = "2")]
    public class UserMembershipController : ControllerBase
    {
        private readonly IMembershipPackageService _packageService;
        private readonly IPaymentService _paymentService;
        private readonly IUserMembershipService _userMembershipService;
        private readonly IUnitOfWork _unitOfWork;

        public UserMembershipController(
            IMembershipPackageService packageService,
            IPaymentService paymentService,
            IUserMembershipService userMembershipService,
            IUnitOfWork unitOfWork)
        {
            _packageService = packageService;
            _paymentService = paymentService;
            _userMembershipService = userMembershipService;
            _unitOfWork = unitOfWork;
        }

        [HttpGet("packages")]
        public async Task<IActionResult> GetPackages()
        {
            var userId = GetUserId();
            var packages = await _packageService.GetAllAsync();
            if (userId == 0)
            {
                return Ok(new { packages });
            }

            var activeMembership = await _userMembershipService.GetActiveByUserIdAsync(userId);
            return Ok(new
            {
                packages,
                currentPackageId = activeMembership?.PackageID,
                currentPackageEnd = activeMembership?.EndDate
            });
        }

        [HttpPost("create-payment")]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentRequest dto)
        {
            var userId = dto.UserId ?? GetUserId();
            if (userId == 0)
                return BadRequest("Không xác định được người dùng.");

            try
            {
                var (payUrl, reference) = await _paymentService.CreatePaymentAsync(userId, dto.PackageId, dto.Method);
                return Ok(new { payUrl, reference });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("payment-callback")]
        public async Task<IActionResult> PaymentCallback([FromBody] PaymentCallbackDto dto)
        {
            await _paymentService.HandlePaymentCallbackAsync(dto.TransactionReference, dto.Status);
            return Ok();
        }

        private int GetUserId()
        {
            var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idStr, out var id) ? id : 0;
        }


        [HttpGet("payment-history")]
        public async Task<IActionResult> GetPaymentHistory()
        {
            var userId = GetUserId();
            if (userId == 0)
                return Unauthorized(new { Message = "Không xác định được người dùng." });
            var payments = await _unitOfWork.Payments
                .FindIncludingAsync(
                    p => p.UserMembership != null &&
                         p.UserMembership.UserID == userId &&
                         p.Status == "Success",
                    p => p.UserMembership,
                    p => p.UserMembership.Package
                );

            var result = payments.Select(p => new UserPaymentHistoryDto
            {
                PaymentId = p.PaymentID,
                PackageName = p.UserMembership.Package.PackageName,
                Amount = p.Amount,
                Method = p.PaymentMethod,
                Status = p.Status,
                CreatedAt = p.PaymentDate,
                EndDate = p.UserMembership.EndDate
            });

            return Ok(result);
        }

    }
}
