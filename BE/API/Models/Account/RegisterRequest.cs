namespace Smoking.API.Models.Account;
public class RegisterRequest
{
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string confirmPassword { get; set; }
    public string PhoneNumber { get; set; }
}

public class VerifyOtpRequest
{
    public string Email { get; set; }
    public string OtpCode { get; set; }
}
