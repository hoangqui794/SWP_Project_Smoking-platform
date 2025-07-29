using Microsoft.Extensions.Options;
using Smoking.BLL.Interfaces;
using Smoking.BLL.Models;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    public class MailService : IMailService
    {
        private readonly EmailSettings _emailSettings;

        public MailService(IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }

        public async Task SendOtpEmailAsync(string toEmail, string otpCode)
        {
            string subject = "Xác thực đăng ký tài khoản - Breath Again";
            string htmlBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px;'>
                    <div style='text-align: center;'>
                        <img src='https://raw.githubusercontent.com/THQuis/SWP391_Group5/main/image/logo.png' alt='Logo' style='width: 100px; margin-bottom: 20px;'/>
                        <h2>Xác thực đăng ký tài khoản</h2>
                    </div>
                    <p>Xin chào,</p>
                    <p>Bạn đã yêu cầu đăng ký tài khoản tại Breath Again.</p>
                    <p>Vui lòng sử dụng mã OTP sau để xác nhận đăng ký:</p>
                    <div style='background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;'>
                        {otpCode}
                    </div>
                    <p><strong>Lưu ý:</strong> Mã OTP có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này với người khác.</p>
                    <p>Nếu bạn không yêu cầu đăng ký tài khoản, hãy bỏ qua email này.</p>
                    <hr/>
                    <p style='text-align: center; color: #888;'>Breath Again © 2025</p>
                </div>";

            await SendHtmlEmailAsync(toEmail, subject, htmlBody);
        }



        public async Task SendHtmlEmailAsync(string toEmail, string subject, string htmlBody)
        {
            using var smtpClient = new SmtpClient(_emailSettings.SmtpServer)
            {
                Port = _emailSettings.SmtpPort,
                Credentials = new NetworkCredential(_emailSettings.SenderEmail, _emailSettings.SenderPassword),
                EnableSsl = _emailSettings.EnableSsl
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);
            await smtpClient.SendMailAsync(mailMessage);
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            using var smtpClient = new SmtpClient(_emailSettings.SmtpServer)
            {
                Port = _emailSettings.SmtpPort,
                Credentials = new NetworkCredential(_emailSettings.SenderEmail, _emailSettings.SenderPassword),
                EnableSsl = _emailSettings.EnableSsl
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_emailSettings.SenderEmail, _emailSettings.SenderName),
                Subject = subject,
                Body = body,
                IsBodyHtml = false
            };

            mailMessage.To.Add(toEmail);
            await smtpClient.SendMailAsync(mailMessage); // Gửi email cơ bản
        }
    }
}
