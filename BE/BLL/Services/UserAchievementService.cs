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
            // 1. Ki?m tra User
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
            {
                Console.WriteLine($"? Không tìm th?y User v?i ID = {userId}");
                return false;
            }

            // 2. Ki?m tra Achievement
            var achievement = await _unitOfWork.Achievements.GetByIdAsync(achievementId);
            if (achievement == null)
            {
                Console.WriteLine($"? Không tìm th?y Achievement v?i ID = {achievementId}");
                return false;
            }

            // 3. Ki?m tra xem dã c?p thành t?u chua
            var existedList = await _unitOfWork.UserAchievements
                .FindAsync(x => x.UserID == userId && x.AchievementID == achievementId);

            if (existedList.Any())
            {
                Console.WriteLine($"?? Thành t?u ID={achievementId} dã c?p cho User ID={userId} tru?c dó.");
                return false;
            }

            // 4. Thêm b?n ghi UserAchievement
            var userAchievement = new UserAchievement
            {
                UserID = userId,
                AchievementID = achievementId,
                AwardedDate = DateTime.UtcNow
            };

            await _unitOfWork.UserAchievements.AddAsync(userAchievement);
            var savedAchievement = await _unitOfWork.CompleteAsync();
            if (savedAchievement <= 0)
            {
                Console.WriteLine("? L?i khi luu UserAchievement.");
                return false;
            }

            var message = $"B?n dã d?t thành t?u: {achievement.AchievementName}. Ti?p t?c c? g?ng nhé!";
            var notify = new Notification
            {
                UserID = userId,
                Message = message,
                NotificationType = "Achievement",
                NotificationName = "Thành t?u m?i",
                SentAt = DateTime.UtcNow,
                Condition = "Ðã g?i",
                NotificationFor = "Cá nhân",
                CreatedBy = "System"
            };

            await _notificationService.CreateAsync(notify);
            await _unitOfWork.CompleteAsync();

            // 6. G?i email n?u có
            if (sendEmail && !string.IsNullOrWhiteSpace(user.Email))
            {
                try
                {
                    await _mailService.SendEmailAsync(user.Email, "B?n v?a d?t thành t?u m?i!", message);
                    Console.WriteLine($"?? Email dã g?i t?i {user.Email}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"? G?i email th?t b?i: {ex.Message}");
                    // Không throw l?i, vì không ?nh hu?ng t?i vi?c c?p thành t?u
                }
            }

            Console.WriteLine($"? Thành t?u ID={achievementId} dã c?p cho User ID={userId} thành công.");
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
