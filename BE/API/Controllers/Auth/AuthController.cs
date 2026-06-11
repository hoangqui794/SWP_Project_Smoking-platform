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

        // Bước 1: Đăng ký - gửi OTP qua Email
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                await _authService.RegisterTempAsync(request.FullName, request.Email, request.Password, request.PhoneNumber);
                return Ok(new { Message = "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP xác thực." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // Bước 2: Xác nhận OTP - lưu user vào database
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            var success = await _authService.VerifyOtpAndRegisterAsync(request.Email, request.OtpCode);
            if (!success)
                return BadRequest(new { Error = "OTP không hợp lệ hoặc đã hết hạn." });

            return Ok(new { Message = "Xác thực OTP thành công. Tài khoản đã được kích hoạt." });
        }

        #endregion

        #region Login

        // Đăng nhập
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _authService.AuthenticateAsync(request.Email, request.Password);
                if (user == null)
                    return Unauthorized(new { Error = "Email hoặc mật khẩu không đúng." });

                if (!string.Equals(user.Status, "Active", StringComparison.OrdinalIgnoreCase))
                    return Unauthorized(new { Error = "Tài khoản của bạn không được phép đăng nhập." });

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

        // Tạo JWT Token
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

        // Bước 1: Gửi OTP quên mật khẩu
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                await _authService.SendForgotPasswordOtpAsync(request.Email);
                return Ok(new { Message = "Đã gửi mã OTP tới email. Vui lòng kiểm tra email để tiếp tục." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // Bước 2: Xác nhận OTP quên mật khẩu
        [HttpPost("verify-reset-otp")]
        public async Task<IActionResult> VerifyResetOtp([FromBody] VerifyOtpRequest request)
        {
            var isValid = await _authService.VerifyForgotPasswordOtpAsync(request.Email, request.OtpCode);
            if (!isValid)
                return BadRequest(new { Error = "OTP không hợp lệ hoặc đã hết hạn." });

            return Ok(new { Message = "Xác thực OTP thành công. Bạn có thể đặt lại mật khẩu mới." });
        }

        // Bước 3: Đặt lại mật khẩu mới
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                await _authService.ResetPasswordAsync(request.Email, request.NewPassword);
                return Ok(new { Message = "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới." });
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
            // Client chỉ cần xoá token
            return Ok(new { Message = "Đăng xuất thành công. Vui lòng xoá token ở client." });
        }

        #endregion
    }
}
