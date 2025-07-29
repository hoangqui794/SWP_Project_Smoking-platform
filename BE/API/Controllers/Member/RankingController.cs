using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.DAL.Interfaces.Repositories;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.API.Controllers
{
    [ApiController]
    [Route("api/ranking")]
    public class RankingController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public RankingController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("top-smoke-free-days")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTopBySmokeFreeDays(int top = 10)
        {
            var progresses = await _unitOfWork.QuitProgresses.GetAllWithUserAsync();

            var ranked = progresses
                .Where(p => p.QuitPlan != null
                            && p.QuitPlan.User != null
                            && p.QuitPlan.User.Status == "Active")
                .GroupBy(p => p.QuitPlan.UserID)
                .Select(g => new
                {
                    UserID = g.Key,
                    FullName = g.First().QuitPlan.User.FullName,
                    ProfilePicture = g.First().QuitPlan.User.ProfilePicture,
                    SmokeFreeDays = g.Count(p => p.CigarettesSmokedToday == 0)
                })
                .OrderByDescending(x => x.SmokeFreeDays)
                .Take(top)
                .ToList();

            return Ok(ranked);
        }

        [HttpGet("top-money-saved")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTopByMoneySaved(int top = 10)
        {
            var progresses = await _unitOfWork.QuitProgresses.GetAllWithUserAsync();

            var ranked = progresses
                .Where(p => p.QuitPlan != null
                            && p.QuitPlan.User != null
                            && p.QuitPlan.User.Status == "Active")
                .GroupBy(p => p.QuitPlan.UserID)
                .Select(g =>
                {
                    var latest = g.OrderByDescending(p => p.ProgressDate).First();
                    return new
                    {
                        UserID = g.Key,
                        FullName = latest.QuitPlan.User.FullName,
                        ProfilePicture = latest.QuitPlan.User.ProfilePicture,
                        TotalMoneySaved = latest.TotalMoneySaved
                    };
                })
                .OrderByDescending(x => x.TotalMoneySaved)
                .Take(top)
                .ToList();

            return Ok(ranked);
        }

        [HttpGet("top-cigarettes-dropped")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTopByCigarettesDropped(int top = 10)
        {
            var progresses = await _unitOfWork.QuitProgresses.GetAllWithUserAsync();

            var ranked = progresses
                .Where(p => p.QuitPlan != null
                            && p.QuitPlan.User != null
                            && p.QuitPlan.User.Status == "Active")
                .GroupBy(p => p.QuitPlan.UserID)
                .Select(g =>
                {
                    var latest = g.OrderByDescending(p => p.ProgressDate).First();
                    return new
                    {
                        UserID = g.Key,
                        FullName = latest.QuitPlan.User.FullName,
                        ProfilePicture = latest.QuitPlan.User.ProfilePicture,
                        TotalCigarettesDropped = latest.TotalCigarettesDropped
                    };
                })
                .OrderByDescending(x => x.TotalCigarettesDropped)
                .Take(top)
                .ToList();

            return Ok(ranked);
        }

        [HttpGet("top-achievements-cigarettes")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTopByAchievementCigarettes(int top = 10)
        {
            var achievements = await _unitOfWork.UserAchievements.GetAllWithUserAndAchievementAsync();

            var ranked = achievements
                .Where(a => a.Achievement != null
                            && a.Achievement.CigarettesDroppedRequired > 0
                            && a.User != null
                            && a.User.Status == "Active")
                .GroupBy(a => a.UserID)
                .Select(g => new
                {
                    UserID = g.Key,
                    FullName = g.First().User.FullName,
                    ProfilePicture = g.First().User.ProfilePicture,
                    TotalCigarettesByAchievement = g.Sum(a => a.Achievement.CigarettesDroppedRequired)
                })
                .OrderByDescending(x => x.TotalCigarettesByAchievement)
                .Take(top)
                .ToList();

            return Ok(ranked);
        }

        [HttpGet("top-challenges-completed")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTopByCompletedChallenges(int top = 10)
        {
            var challenges = await _unitOfWork.UserQuitChallenges.GetAllWithUserAsync();

            var ranked = challenges
                .Where(c => c.IsCompleted
                            && c.User != null
                            && c.User.Status == "Active")
                .GroupBy(c => c.UserId)
                .Select(g => new
                {
                    UserID = g.Key,
                    FullName = g.First().User.FullName,
                    ProfilePicture = g.First().User.ProfilePicture,
                    CompletedChallenges = g.Count()
                })
                .OrderByDescending(x => x.CompletedChallenges)
                .Take(top)
                .ToList();

            return Ok(ranked);
        }
    }
}
