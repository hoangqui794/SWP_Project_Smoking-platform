using Microsoft.Extensions.Caching.Memory;
using Smoking.BLL.Interfaces;
using Smoking.BLL.Models;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System;
using System.Threading.Tasks;
using BCrypt.Net;

namespace Smoking.BLL.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMemoryCache _memoryCache;
        private readonly IMailService _mailService;

        public AuthService(IUnitOfWork unitOfWork, IMemoryCache memoryCache, IMailService mailService)
        {
            _unitOfWork = unitOfWork;
            _memoryCache = memoryCache;
            _mailService = mailService;
        }

        // -- Đăng ký tạm, gửi OTP --
        public async Task RegisterTempAsync(string fullName, string email, string password, string phoneNumber)
        {
            var existing = await _unitOfWork.Users.GetByEmailAsync(email);
            if (existing != null)
                throw new Exception("Email đã tồn tại.");

            var otpCode = new Random().Next(100000, 999999).ToString();

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

            var tempUser = new TempUserRegister
            {
                FullName = fullName,
                Email = email,
                Password = hashedPassword,
                PhoneNumber = phoneNumber,
                OtpCode = otpCode
            };

            _memoryCache.Set($"TEMP_USER_{email}", tempUser, TimeSpan.FromMinutes(5));
            _memoryCache.Set($"OTP_{email}", otpCode, TimeSpan.FromMinutes(5));

            await _mailService.SendOtpEmailAsync(email, otpCode);
        }

        // -- Xác thực OTP đăng ký --
        public async Task<bool> VerifyOtpAndRegisterAsync(string email, string otpCode)
        {
            if (_memoryCache.TryGetValue($"OTP_{email}", out string cachedOtp) && cachedOtp == otpCode)
            {
                if (_memoryCache.TryGetValue($"TEMP_USER_{email}", out TempUserRegister tempUser))
                {
                    var user = new User
                    {
                        FullName = tempUser.FullName,
                        Email = tempUser.Email,
                        Password = tempUser.Password, // đã băm ở RegisterTempAsync
                        PhoneNumber = tempUser.PhoneNumber,
                        Status = "Active",
                        RoleID = 2
                    };

                    await _unitOfWork.Users.AddAsync(user);
                    await _unitOfWork.CompleteAsync();

                    _memoryCache.Remove($"OTP_{email}");
                    _memoryCache.Remove($"TEMP_USER_{email}");

                    return true;
                }
            }
            return false;
        }

        // -- Đăng nhập --
        private const int MaxFailedAttempts = 5;
        private readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(5);

        public async Task<User> AuthenticateAsync(string email, string password)
        {
            if (_memoryCache.TryGetValue($"LOCK_{email}", out _))
            {
                throw new Exception("Tài khoản đã bị khóa tạm thời do đăng nhập sai quá nhiều. Vui lòng thử lại sau vài phút.");
            }

            var user = await _unitOfWork.Users.GetByEmailAsync(email);
            if (user == null)
                return null;

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.Password);

            if (!isPasswordValid)
            {
                string failKey = $"LOGIN_FAILS_{email}";
                int failCount = _memoryCache.TryGetValue(failKey, out int current) ? current : 0;
                failCount++;

                if (failCount >= MaxFailedAttempts)
                {
                    _memoryCache.Set($"LOCK_{email}", true, LockoutDuration);
                    _memoryCache.Remove(failKey);
                }
                else
                {
                    _memoryCache.Set(failKey, failCount, TimeSpan.FromMinutes(5));
                }

                return null;
            }

            _memoryCache.Remove($"LOGIN_FAILS_{email}");
            return user;
        }


        // -- Gửi OTP quên mật khẩu --
        public async Task SendForgotPasswordOtpAsync(string email)
        {
            var user = await _unitOfWork.Users.GetByEmailAsync(email);
            if (user == null)
                throw new Exception("Email không tồn tại.");

            var otpCode = new Random().Next(100000, 999999).ToString();
            _memoryCache.Set($"RESET_PWD_OTP_{email}", otpCode, TimeSpan.FromMinutes(5));

            string subject = "Đặt lại mật khẩu - Smoking App";
            string htmlBody = $@"
            <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px;'>
                <div style='text-align: center;'>
                    <img src='https://raw.githubusercontent.com/THQuis/SWP391_Group5/main/image/logo.png' alt='Breath Again Logo' style='width: 100px; margin-bottom: 20px;'/>
                    <h2>Đặt lại mật khẩu</h2>
                </div>
                <p>Xin chào,</p>
                <p>Bạn hoặc ai đó đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại Smoking App.</p>
                <p>Vui lòng sử dụng mã OTP sau để xác nhận:</p>
                <div style='background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;'>
                    {otpCode}
                </div>
                <p><strong>Lưu ý:</strong> Mã OTP có hiệu lực trong 5 phút.</p>
                <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
                <hr/>
                <p style='text-align: center; color: #888;'>Smoking App © 2025</p>
            </div>";

            await _mailService.SendHtmlEmailAsync(email, subject, htmlBody);
        }

        // -- Xác thực OTP quên mật khẩu --
        public async Task<bool> VerifyForgotPasswordOtpAsync(string email, string otpCode)
        {
            return _memoryCache.TryGetValue($"RESET_PWD_OTP_{email}", out string cachedOtp)
                   && cachedOtp == otpCode;
        }

        // -- Đặt lại mật khẩu mới --
        public async Task ResetPasswordAsync(string email, string newPassword)
        {
            var user = await _unitOfWork.Users.GetByEmailAsync(email);
            if (user == null)
                throw new Exception("Email không tồn tại.");

            // Băm lại mật khẩu mới
            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);

            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            _memoryCache.Remove($"RESET_PWD_OTP_{email}");
        }

        // -- Xoá người dùng --
        public async Task DeleteUserByEmailAsync(string email)
        {
            var user = await _unitOfWork.Users.GetByEmailAsync(email);
            if (user == null)
                throw new Exception("Không tìm thấy user với email này.");

            _unitOfWork.Users.Remove(user);
            await _unitOfWork.CompleteAsync();
        }

        // -- Cập nhật thông tin hồ sơ --
        public async Task UpdateProfileAsync(string email, string fullName, string phoneNumber, string profilePicture)
        {
            var user = await _unitOfWork.Users.GetByEmailAsync(email);
            if (user == null)
                throw new Exception("Không tìm thấy user với email này.");

            user.FullName = fullName;
            user.PhoneNumber = phoneNumber;
            user.ProfilePicture = profilePicture;

            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();
        }
    }
}
