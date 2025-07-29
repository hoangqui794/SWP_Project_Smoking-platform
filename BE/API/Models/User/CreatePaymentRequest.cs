namespace Smoking.API.Models.User
{
    public class CreatePaymentRequest
    {
        public int? UserId { get; set; }     // ← thêm dòng này
        public int PackageId { get; set; }
        public string Method { get; set; }
    }

    public class PaymentCallbackDto
    {
        public string TransactionReference { get; set; }
        public string Status { get; set; }
    }

    public class UserPaymentHistoryDto
    {
        public int PaymentId { get; set; }
        public string PackageName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Method { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public DateTime EndDate { get; set; }
    }

}
