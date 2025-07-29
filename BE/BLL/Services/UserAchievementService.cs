using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    public class UserAchievementService : IUserAchievementService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationService _notificationService;
        private readonly IMailService _mailService;

        public UserAchievementService(
            IUnitOfWork unitOfWork,
            INotificationService notificationService,
            IMailService mailService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _mailService = mailService;
        }

        public async Task<bool> GrantAchievementAsync(int userId, int achievementId, bool sendEmail = true)
        {
            // 1. Kiểm tra User
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
            {
                Console.WriteLine($"❌ Không tìm thấy User với ID = {userId}");
                return false;
            }

            // 2. Kiểm tra Achievement
            var achievement = await _unitOfWork.Achievements.GetByIdAsync(achievementId);
            if (achievement == null)
            {
                Console.WriteLine($"❌ Không tìm thấy Achievement với ID = {achievementId}");
                return false;
            }

            // 3. Kiểm tra xem đã cấp thành tựu chưa
            var existedList = await _unitOfWork.UserAchievements
                .FindAsync(x => x.UserID == userId && x.AchievementID == achievementId);

            if (existedList.Any())
            {
                Console.WriteLine($"⚠️ Thành tựu ID={achievementId} đã cấp cho User ID={userId} trước đó.");
                return false;
            }

            // 4. Thêm bản ghi UserAchievement
            var userAchievement = new UserAchievement
            {
                UserID = userId,
                AchievementID = achievementId,
                AwardedDate = DateTime.Now
            };

            await _unitOfWork.UserAchievements.AddAsync(userAchievement);
            var savedAchievement = await _unitOfWork.CompleteAsync();
            if (savedAchievement <= 0)
            {
                Console.WriteLine("❌ Lỗi khi lưu UserAchievement.");
                return false;
            }

            var message = $"Bạn đã đạt thành tựu: {achievement.AchievementName}. Tiếp tục cố gắng nhé!";
            var notify = new Notification
            {
                UserID = userId,
                Message = message,
                NotificationType = "Achievement",
                NotificationName = "Thành tựu mới",
                SentAt = DateTime.Now,
                Condition = "Đã gửi",
                NotificationFor = "Cá nhân",
                CreatedBy = "System"
            };

            await _notificationService.CreateAsync(notify);
            await _unitOfWork.CompleteAsync();

            // 6. Gửi email nếu có
            if (sendEmail && !string.IsNullOrWhiteSpace(user.Email))
            {
                try
                {
                    await _mailService.SendEmailAsync(user.Email, "Bạn vừa đạt thành tựu mới!", message);
                    Console.WriteLine($"📧 Email đã gửi tới {user.Email}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❗ Gửi email thất bại: {ex.Message}");
                    // Không throw lỗi, vì không ảnh hưởng tới việc cấp thành tựu
                }
            }

            Console.WriteLine($"✅ Thành tựu ID={achievementId} đã cấp cho User ID={userId} thành công.");
            return true;
        }


        public async Task<IEnumerable<UserAchievement>> GetAchievementsByUserIdAsync(int userId)
        {
            return await _unitOfWork.UserAchievements.FindAsync(x => x.UserID == userId);
        }

        public async Task<User> GetUserByIdAsync(int userId)
        {
            return await _unitOfWork.Users.GetByIdAsync(userId);
        }

        public async Task<Achievement> GetAchievementByIdAsync(int achievementId)
        {
            return await _unitOfWork.Achievements.GetByIdAsync(achievementId);
        }

        public async Task<IEnumerable<object>> GetAchievementsWithStatusAsync(int userId)
        {
            var allAchievements = await _unitOfWork.Achievements.GetAllAsync();
            var userAchievements = await _unitOfWork.UserAchievements
                .FindAsync(ua => ua.UserID == userId);

            //var userAchievementDict = userAchievements
            //    .ToDictionary(ua => ua.AchievementID, ua => ua.AwardedDate);
            var userAchievementDict = userAchievements
                .GroupBy(ua => ua.AchievementID)
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(x => x.AwardedDate).First().AwardedDate
                );

            var result = allAchievements.Select(a => new
            {
                a.AchievementID,
                a.AchievementName,
                a.Description,
                a.BadgeImage,
                a.PackageType,
                a.SmokeFreeDaysRequired,
                a.MoneySavedRequired,
                a.CigarettesDroppedRequired,
                IsUnlocked = userAchievementDict.ContainsKey(a.AchievementID),
                DateAchieved = userAchievementDict.TryGetValue(a.AchievementID, out var date) ? (DateTime?)date : null
            });

            return result;
        }

    }
}
