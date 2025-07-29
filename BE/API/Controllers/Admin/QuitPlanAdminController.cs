using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Interfaces.Repositories;

namespace Smoking.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/quitplan")]
    [Authorize(Roles = "1")]
    public class QuitPlanAdminController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IQuitPlanService _quitPlanService;

        public QuitPlanAdminController(IUnitOfWork unitOfWork, IQuitPlanService quitPlanService)
        {
            _unitOfWork = unitOfWork;
            _quitPlanService = quitPlanService;
        }


        [HttpGet("ListAllPlans")]
        public async Task<IActionResult> GetAllQuitPlans()
        {
            var plans = await _unitOfWork.QuitPlans.GetAllAsync();
            return Ok(plans);
        }

        [HttpGet("ListAllProgress")]
        public async Task<IActionResult> GetAllQuitProgresses()
        {
            var progresses = await _unitOfWork.QuitProgresses.GetAllAsync();
            return Ok(progresses);
        }

        [HttpGet("GetUserIDPlan")]
        public async Task<IActionResult> GetUserQuitPlans(int userId)
        {
            var plans = await _unitOfWork.QuitPlans.FindAsync(x => x.UserID == userId);
            return Ok(plans);
        }

        [HttpGet("GetUserIDProgress")]
        public async Task<IActionResult> GetUserQuitProgresses(int userId)
        {
            var plans = await _unitOfWork.QuitPlans.FindAsync(x => x.UserID == userId);
            var planIds = plans.Select(p => p.QuitPlanID).ToList();
            var progresses = await _unitOfWork.QuitProgresses.FindAsync(x => planIds.Contains(x.QuitPlanID));
            return Ok(progresses);
        }

        [HttpDelete("DeleteQuitPlanAndProgressUserID")]
        public async Task<IActionResult> DeleteAllByUser(int userId)
        {
            var result = await _quitPlanService.DeleteAllPlansAndProgressByUserAsync(userId);
            return result
                ? Ok("Đã xoá tất cả kế hoạch và tiến trình của người dùng.")
                : NotFound("Người dùng không có kế hoạch.");
        }


        [HttpGet("Statistics")]
        public async Task<IActionResult> GetGlobalQuitStatistics()
        {
            var allProgress = await _unitOfWork.QuitProgresses.GetAllAsync();
            var allPlans = await _unitOfWork.QuitPlans.GetAllAsync();

            var totalMoneySaved = allProgress.Sum(p => p.MoneySaved);
            var totalCigarettesDropped = allProgress.Sum(p => p.CigarettesDropped ?? 0);
            var totalUsers = allPlans.Select(p => p.UserID).Distinct().Count();
            var totalPlans = allPlans.Count();

            return Ok(new
            {
                TotalUsers = totalUsers,
                TotalQuitPlans = totalPlans,
                TotalMoneySaved = totalMoneySaved,
                TotalCigarettesDropped = totalCigarettesDropped
            });
        }
    }
}
