using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Smoking.BLL.Interfaces;
using Smoking.BLL.Models;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Smoking.BLL.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserMembershipService _userMembershipService;
        private readonly MomoConfig _momoConfig;

        public PaymentService(
            IUnitOfWork unitOfWork,
            IUserMembershipService userMembershipService,
            IOptions<MomoConfig> momoOptions)
        {
            _unitOfWork = unitOfWork;
            _userMembershipService = userMembershipService;
            _momoConfig = momoOptions.Value;
        }

        public async Task<(string payUrl, string transactionReference)> CreatePaymentAsync(int userId, int packageId, string method)
        {
            // 1. Kiểm tra đầu vào
            if (userId <= 0)
                throw new Exception("Người dùng không hợp lệ.");

            if (string.IsNullOrWhiteSpace(method))
                throw new Exception("Phương thức thanh toán không hợp lệ.");

            // 2. Kiểm tra user có tồn tại
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
                throw new Exception("Người dùng không tồn tại.");

            // 3. Kiểm tra xem user đã có gói còn hiệu lực chưa
            var current = await _unitOfWork.UserMemberships.GetActiveByUserIdAsync(userId);
            if (current != null)
                throw new Exception("Bạn đang sử dụng một gói thành viên còn hiệu lực. Vui lòng đợi hết hạn để mua gói mới.");

            // 4. Lấy thông tin gói
            var package = await _unitOfWork.MembershipPackages.GetByIdAsync(packageId);
            if (package == null)
                throw new Exception("Gói thành viên không tồn tại.");

            // 5. Tạo thông tin thanh toán MoMo
            var requestId = Guid.NewGuid().ToString();
            var orderId = Guid.NewGuid().ToString(); // Dùng làm TransactionReference
            var amount = package.Price.ToString("F0");

            var rawHash = $"accessKey={_momoConfig.AccessKey}&amount={amount}&extraData=&ipnUrl={_momoConfig.NotifyUrl}&orderId={orderId}&orderInfo=Thanh toán gói {package.PackageName}&partnerCode={_momoConfig.PartnerCode}&redirectUrl={_momoConfig.ReturnUrl}&requestId={requestId}&requestType=captureWallet";
            var signature = CreateSignature(_momoConfig.SecretKey, rawHash);

            var body = new
            {
                partnerCode = _momoConfig.PartnerCode,
                accessKey = _momoConfig.AccessKey,
                requestId,
                amount,
                orderId,
                orderInfo = $"Thanh toán gói {package.PackageName}",
                redirectUrl = _momoConfig.ReturnUrl,
                ipnUrl = _momoConfig.NotifyUrl,
                extraData = "",
                requestType = "captureWallet",
                signature,
                lang = "vi"
            };

            using var client = new HttpClient();
            var content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
            var response = await client.PostAsync(_momoConfig.Endpoint, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            Console.WriteLine("[DEBUG] Momo response: " + responseBody);

            var responseData = JsonSerializer.Deserialize<JsonElement>(responseBody);
            if (!responseData.TryGetProperty("payUrl", out var urlProp))
                throw new Exception("MoMo không trả về liên kết thanh toán (payUrl): " + responseBody);

            var payUrl = urlProp.GetString();

            // 6. Lưu Payment vào DB (Status = Pending)
            var payment = new Payment
            {
                Amount = package.Price,
                PaymentMethod = method,
                Status = "Pending",
                TransactionReference = orderId,
                PaymentDate = DateTime.UtcNow,
                UserID = userId,
                PackageID = packageId
            };

            try
            {
                await _unitOfWork.Payments.AddAsync(payment);
                await _unitOfWork.CompleteAsync();
            }
            catch (Exception ex)
            {
                var inner = ex.InnerException?.Message ?? ex.Message;
                throw new Exception($"Lỗi khi lưu Payment vào cơ sở dữ liệu: {inner}");
            }

            return (payUrl!, orderId);
        }

        public async Task HandlePaymentCallbackAsync(string reference, string status)
        {
            var payment = await _unitOfWork.Payments.GetByTransactionReferenceAsync(reference);
            if (payment == null)
                return;

            if (payment.Status == "Success")
                return;

            payment.Status = status;

            if (status == "Success")
            {
                var membership = await _userMembershipService.CreateOrUpdateMembershipAsync(payment.UserID, payment.PackageID);
                payment.UserMembershipID = membership.UserMembershipID;
            }

            await _unitOfWork.Payments.UpdateAsync(payment);
            await _unitOfWork.CompleteAsync();
        }

        private string CreateSignature(string secretKey, string rawData)
        {
            var encoding = new UTF8Encoding();
            var keyByte = encoding.GetBytes(secretKey);
            var messageBytes = encoding.GetBytes(rawData);

            using var hmacsha256 = new HMACSHA256(keyByte);
            var hashmessage = hmacsha256.ComputeHash(messageBytes);
            return BitConverter.ToString(hashmessage).Replace("-", "").ToLower();
        }
        public async Task<IEnumerable<Payment>> GetPaymentsByFilterAsync(DateTime? fromDate, DateTime? toDate, string? status, int? userId)
        {
            return await _unitOfWork.Payments.FindAsync(
                p =>
                    (!fromDate.HasValue || p.PaymentDate >= fromDate.Value) &&
                    (!toDate.HasValue || p.PaymentDate <= toDate.Value) &&
                    (string.IsNullOrEmpty(status) || p.Status == status) &&
                    (!userId.HasValue || p.UserID == userId),
                q => q.Include(p => p.User)
                      .Include(p => p.Package)
                      .Include(p => p.UserMembership)
            );
        }

    }
}
