using Smoking.DAL.Entities;
using System.Threading.Tasks;

public interface IAuthService
{
    Task RegisterTempAsync(string fullName, string email, string password, string phoneNumber);
    Task<bool> VerifyOtpAndRegisterAsync(string email, string otpCode);
    Task<User> AuthenticateAsync(string email, string password);

    // Thêm các phương thức cho quên mật khẩu
    Task SendForgotPasswordOtpAsync(string email);
    Task<bool> VerifyForgotPasswordOtpAsync(string email, string otpCode);
    Task ResetPasswordAsync(string email, string newPassword);
    Task DeleteUserByEmailAsync(string email);
    Task UpdateProfileAsync(string email, string fullName, string phoneNumber, string profilePicture);


}
