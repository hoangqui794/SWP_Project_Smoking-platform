using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.API.Models.User;
using Smoking.BLL.Interfaces;
using System.Security.Claims;

namespace Smoking.API.Controllers.Member
{
    [ApiController]
    [Route("api/user")]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserProfileController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { Message = "Không xác d?nh du?c ngu?i dùng." });

            var user = await _userService.GetUserWithMembershipAsync(userId);
            if (user == null)
                return NotFound(new { Message = "Ngu?i dùng không t?n t?i." });

            var activeMembership = user.UserMemberships?
                .Where(um =>
                    (um.PaymentStatus == "Completed" || um.PaymentStatus == "AdminAssigned") &&
                    um.EndDate >= DateTime.UtcNow)
                .OrderByDescending(um => um.StartDate)
                .FirstOrDefault();

            return Ok(new
            {
                Message = "Thông tin cá nhân",
                User = new
                {
                    user.UserID,
                    user.FullName,
                    user.Email,
                    user.PhoneNumber,
                    user.ProfilePicture,
                    user.Gender,
                    DateOfBirth = user.DateOfBirth?.ToString("yyyy-MM-dd"),
                    RegistrationDate = user.RegistrationDate.ToString("yyyy-MM-dd"),
                    RoleName = user.Role?.RoleName ?? "Unknown",
                    user.CoachId,
                    user.Status,
                    user.Description,
                    Membership = activeMembership == null ? null : new
                    {
                        PackageName = activeMembership.Package.PackageName,
                        PackageType = activeMembership.Package.PackageType,
                        StartDate = activeMembership.StartDate.ToString("yyyy-MM-dd"),
                        EndDate = activeMembership.EndDate.ToString("yyyy-MM-dd"),
                        PaymentStatus = activeMembership.PaymentStatus
                    }
                }
            });
        }


        [HttpGet("notifications")]
        public IActionResult GetNotifications()
        {
            return Ok(new { Message = "Thông báo h? tr? cai thu?c - User" });
        }

        [HttpDelete("delete-user")]
        public async Task<IActionResult> DeleteUser([FromBody] DeleteUserRequest request)
        {
            try
            {
                await _userService.DeleteUserByEmailAsync(request.Email);
                return Ok(new { Message = "Xoá user thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            try
            {
                // Ki?m tra ngày sinh h?p l? (>= 12 tu?i)
                if (request.DateOfBirth != null)
                {
                    var today = DateTime.Today;
                    var age = today.Year - request.DateOfBirth.Value.Year;
                    if (request.DateOfBirth.Value.Date > today.AddYears(-age)) age--;

                    if (age < 12)
                    {
                        return BadRequest(new { Error = "Ngu?i dùng ph?i t? 12 tu?i tr? lên." });
                    }
                }

                await _userService.UpdateProfileAsync(
                    request.Email,
                    request.FullName,
                    request.PhoneNumber,
                    request.ProfilePicture,
                    request.Description,
                    request.Gender,
                    request.DateOfBirth
                );

                return Ok(new { Message = "C?p nh?t thông tin thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }


    }
}
