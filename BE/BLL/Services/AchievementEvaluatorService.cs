using Microsoft.Extensions.Logging;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System;
using System.Linq;
using System.Threading.Tasks;

public class AchievementEvaluatorService : IAchievementEvaluatorService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AchievementEvaluatorService> _logger;
    private readonly IMailService _mailService;

    public AchievementEvaluatorService(
        IUnitOfWork unitOfWork,
        ILogger<AchievementEvaluatorService> logger,
        IMailService mailService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _mailService = mailService;
    }

    public async Task<bool> EvaluateAndGrantAchievementsAsync(int userId)
    {
        _logger.LogInformation("Đang đánh giá thành tựu cho UserID = {UserID}", userId);

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("Không tìm thấy người dùng với ID = {UserID}", userId);
            return false;
        }

        var quitPlan = (await _unitOfWork.QuitPlans.FindAsync(x => x.UserID == userId && x.Status == "Active"))
                        .FirstOrDefault();
        if (quitPlan == null)
        {
            _logger.LogWarning("Không tìm thấy QuitPlan đang hoạt động cho UserID = {UserID}", userId);
            return false;
        }

        var progresses = (await _unitOfWork.QuitProgresses.FindAsync(x => x.QuitPlanID == quitPlan.QuitPlanID))
                         .OrderByDescending(x => x.ProgressDate)
                         .ToList();

        if (!progresses.Any())
        {
            _logger.LogWarning("Không có dữ liệu QuitProgress cho UserID = {UserID}", userId);
            return false;
        }

        var latestProgress = progresses.First();
        int smokeFreeDays = progresses.Count(x => x.CigarettesSmokedToday == 0);
        decimal moneySaved = latestProgress.TotalMoneySaved ?? 0;
        int cigarettesDropped = latestProgress.TotalCigarettesDropped ?? 0;
        int checkinDays = progresses.Count(x => x.CigarettesSmokedToday != null);

        _logger.LogInformation("Tổng kết: SmokeFreeDays = {Days}, MoneySaved = {MoneySaved}, CigarettesDropped = {CigsDropped}, CheckinDays = {CheckinDays}",
            smokeFreeDays, moneySaved, cigarettesDropped, checkinDays);

        var allAchievements = await _unitOfWork.Achievements.GetAllAsync();
        var userAchievements = await _unitOfWork.UserAchievements.GetByUserIdAsync(userId);
        var grantedAchievementIds = userAchievements.Select(ua => ua.AchievementID).ToHashSet();

        foreach (var achievement in allAchievements)
        {
            if (grantedAchievementIds.Contains(achievement.AchievementID))
            {
                _logger.LogDebug("➡️ Đã có thành tựu {AchievementID}, bỏ qua", achievement.AchievementID);
                continue;
            }

            bool eligible =
                (achievement.SmokeFreeDaysRequired.HasValue && smokeFreeDays >= achievement.SmokeFreeDaysRequired.Value) ||
                (achievement.MoneySavedRequired.HasValue && moneySaved >= achievement.MoneySavedRequired.Value) ||
                (achievement.CigarettesDroppedRequired.HasValue && cigarettesDropped >= achievement.CigarettesDroppedRequired.Value) ||
                (achievement.CheckinDaysRequired.HasValue && checkinDays >= achievement.CheckinDaysRequired.Value);

            _logger.LogDebug("🔍 Kiểm tra AchievementID = {AchievementID} → Đủ điều kiện: {Eligible}",
                achievement.AchievementID, eligible);

            if (eligible)
            {
                await GrantAchievement(user, achievement);
            }
        }

        return true;
    }

    private async Task GrantAchievement(User user, Achievement achievement)
    {
        _logger.LogInformation("🏅 Cấp thành tựu {AchievementID} cho UserID = {UserID}", achievement.AchievementID, user.UserID);

        var userAchievement = new UserAchievement
        {
            UserID = user.UserID,
            AchievementID = achievement.AchievementID,
            AwardedDate = DateTime.UtcNow
        };

        await _unitOfWork.UserAchievements.AddAsync(userAchievement);
        await _unitOfWork.CompleteAsync();

        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            string subject = $"🎉 Bạn vừa đạt thành tựu: {achievement.AchievementName}!";

            // Nếu có ảnh badge thì thêm vào email
            string htmlBody = $@"
                <div style='
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #e0ffe0, #f0fff0);
                    border: 2px dashed #5cb85c;
                    border-radius: 10px;
                    padding: 20px;
                    max-width: 600px;
                    margin: auto;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);'>

                    <div style='text-align: center;'>
                        <h1 style='color: #28a745; font-size: 26px;'>🎉 Chúc mừng {user.FullName ?? "bạn"}! 🎉</h1>
                        <p style='font-size: 16px; color: #333;'>Bạn vừa đạt được một <strong>thành tựu mới</strong> trong hành trình cai thuốc lá:</p>
        
                        <div style='margin: 20px 0; padding: 15px; background-color: #dff0d8; border-radius: 8px;'>
                            <h2 style='color: #3c763d;'>{achievement.AchievementName}</h2>
                            <p style='font-size: 15px;'>{achievement.Description}</p>
                        </div>

                        <div style='font-size: 24px; margin-top: 15px;'>🌟👏🎊</div>
                    </div>

                    <hr style='margin-top: 30px; border: none; border-top: 1px solid #ccc;' />
                    <p style='font-size: 12px; color: #999; text-align: center;'>Smoking App &copy; 2025</p>
                </div>";


            try
            {
                await _mailService.SendHtmlEmailAsync(user.Email, subject, htmlBody);
                _logger.LogInformation("📧 Đã gửi email thành tựu đến {Email}", user.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Lỗi khi gửi email thành tựu cho {Email}", user.Email);
            }
        }
        else
        {
            _logger.LogWarning("⚠️ Không thể gửi email vì UserID = {UserID} không có email.", user.UserID);
        }
    }

}
