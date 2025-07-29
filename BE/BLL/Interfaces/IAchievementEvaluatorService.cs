namespace Smoking.BLL.Interfaces
{
    public interface IAchievementEvaluatorService
    {
        Task<bool> EvaluateAndGrantAchievementsAsync(int userId);
    }
}
