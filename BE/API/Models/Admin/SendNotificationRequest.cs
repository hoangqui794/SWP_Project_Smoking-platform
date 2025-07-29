using System;
using System.Collections.Generic;

namespace Smoking.API.Models.Admin
{
    public class SendNotificationRequest
    {
        public bool ToAllUsers { get; set; }               // Gửi cho tất cả user
        public string ToRole { get; set; }                 // Gửi cho role nhất định
        public List<string> Emails { get; set; }           // Gửi cho danh sách email

        public string Message { get; set; }
        public string NotificationType { get; set; }
        public string NotificationName { get; set; }
        public string Condition { get; set; }
        public string NotificationFor { get; set; }
        public string CreatedBy { get; set; }
        public bool SendEmail { get; set; } = true;        // Có gửi email không (mặc định có)
    }
}