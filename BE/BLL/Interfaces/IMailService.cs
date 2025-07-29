using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface IMailService
    {

        Task SendOtpEmailAsync(string toEmail, string otpCode); // Cũ
        Task SendHtmlEmailAsync(string toEmail, string subject, string htmlBody); // NEW → dùng cho Quên mật khẩu
        Task SendEmailAsync(string toEmail, string subject, string body); // Để gửi email cơ bản

    }
}
