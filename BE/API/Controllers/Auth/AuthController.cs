using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Smoking.API.Models;
using Smoking.API.Models.Account;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.API.Controllers.Auth
{
    [ApiController]
    [Route("api/Auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly JwtSettings _jwtSettings;
        private readonly IUserService _userService;

        public AuthController(IAuthService authService, IOptions<JwtSettings> jwtOptions, IUserService userService)
        {
            _authService = authService;
            _jwtSettings = jwtOptions.Value;
            _userService = userService;
        }

        #region Register

        // Bu?c 1: Ðang ký - g?i OTP qua Email
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                await _authService.RegisterTempAsync(request.FullName, request.Email, request.Password, request.PhoneNumber);
                return Ok(new { Message = "Ðang ký thành công. Vui lòng ki?m tra email d? l?y mã OTP xác th?c." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // Bu?c 2: Xác nh?n OTP - luu user vào database
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            var success = await _authService.VerifyOtpAndRegisterAsync(request.Email, request.OtpCode);
            if (!success)
                return BadRequest(new { Error = "OTP không h?p l? ho?c dã h?t h?n." });

            return Ok(new { Message = "Xác th?c OTP thành công. Tài kho?n dã du?c kích ho?t." });
        }

        #endregion

        #region Login

        // Ðang nh?p
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _authService.AuthenticateAsync(request.Email, request.Password);
                if (user == null)
                    return Unauthorized(new { Error = "Email ho?c m?t kh?u không dúng." });

                if (!string.Equals(user.Status, "Active", StringComparison.OrdinalIgnoreCase))
                    return Unauthorized(new { Error = "Tài kho?n c?a b?n không du?c phép dang nh?p." });

                var fullUser = await _userService.GetUserWithMembershipAsync(user.UserID);
                var token = GenerateJwtToken(fullUser);

                var activeMembership = fullUser.UserMemberships?
                    .Where(um =>
                        (um.PaymentStatus == "Completed" || um.PaymentStatus == "AdminAssigned") &&
                        um.EndDate >= DateTime.UtcNow)
                    .OrderByDescending(um => um.StartDate)
                    .FirstOrDefault();

                return Ok(new
                {
                    Token = token,
                    User = new
                    {
                        fullUser.UserID,
                        fullUser.FullName,
                        fullUser.Email,
                        fullUser.PhoneNumber,
                        fullUser.Status,
                        fullUser.RoleID,
                        RoleName = fullUser.Role?.RoleName ?? "Unknown",
                        fullUser.Gender,
                        fullUser.CoachId,
                        fullUser.ProfilePicture,
                        DateOfBirth = fullUser.DateOfBirth?.ToString("yyyy-MM-dd"),
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
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // T?o JWT Token
        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                    new Claim(ClaimTypes.Name, user.FullName),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.RoleID.ToString())
                }),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiresInMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        #endregion

        #region Forgot Password

        // Bu?c 1: G?i OTP quên m?t kh?u
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                await _authService.SendForgotPasswordOtpAsync(request.Email);
                return Ok(new { Message = "Ðã g?i mã OTP t?i email. Vui lòng ki?m tra email d? ti?p t?c." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // Bu?c 2: Xác nh?n OTP quên m?t kh?u
        [HttpPost("verify-reset-otp")]
        public async Task<IActionResult> VerifyResetOtp([FromBody] VerifyOtpRequest request)
        {
            var isValid = await _authService.VerifyForgotPasswordOtpAsync(request.Email, request.OtpCode);
            if (!isValid)
                return BadRequest(new { Error = "OTP không h?p l? ho?c dã h?t h?n." });

            return Ok(new { Message = "Xác th?c OTP thành công. B?n có th? d?t l?i m?t kh?u m?i." });
        }

        // Bu?c 3: Ð?t l?i m?t kh?u m?i
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                await _authService.ResetPasswordAsync(request.Email, request.NewPassword);
                return Ok(new { Message = "Ð?t l?i m?t kh?u thành công. B?n có th? dang nh?p b?ng m?t kh?u m?i." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        #endregion

        #region Logout

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Client ch? c?n xoá token
            return Ok(new { Message = "Ðang xu?t thành công. Vui lòng xoá token ? client." });
        }

        #endregion
    }
}
