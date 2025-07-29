using Smoking.DAL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface IUserQuitChallengeService
    {
        Task GenerateChallengesAsync(int quitPlanId, int userId, DateTime startDate);
        Task<List<UserQuitChallenge>> GetChallengesForWeekAsync(int userId, DateTime startOfWeek);
        Task MarkAsCompletedAsync(int challengeId, string? notes, byte[]? imageData, string? contentType);
        Task<int> AssignChallengesToUserAsync(int userId, int stage);
        Task<List<UserQuitChallenge>> GetProgressiveChallengesForWeekAsync(int userId, DateTime weekStart, int stage);
        Task UnmarkAsCompletedAsync(int challengeId);
        Task<IEnumerable<UserQuitChallenge>> GetChallengesForStageAsync(int userId, int stage);
        Task<List<UserQuitChallenge>> GetAllChallengesAsync(int userId);

        Task<List<QuitChallengeTemplate>> GetAllTemplatesAsync();

    }
}
