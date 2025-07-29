using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Smoking.DAL.Data;
using Microsoft.EntityFrameworkCore;

namespace Smoking.API.Controllers
{
    [ApiController]
    [Route("api/user/milestones")]
    [Authorize(Roles = "2")] // Chỉ người dùng (RoleID = 2) mới có quyền truy cập
    public class UserMilestoneProgressController : ControllerBase
    {
        private readonly IUserMilestoneProgressService _userMilestoneProgressService;
        private readonly IMilestoneService _milestoneService; // Thêm service để lấy dữ liệu các mốc

        // Trong controller, inject AppDbContext (hoặc thông qua service)
        private readonly AppDbContext _context;
        public UserMilestoneProgressController(
            IUserMilestoneProgressService userMilestoneProgressService,
            IMilestoneService milestoneService,
            AppDbContext context)
        {
            _userMilestoneProgressService = userMilestoneProgressService;
            _milestoneService = milestoneService;
            _context = context;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetAll()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            {
                return Unauthorized(new { message = "Không thể xác định ID người dùng." });
            }

            var allMilestones = await _milestoneService.GetAllAsync();
            if (allMilestones == null || !allMilestones.Any())
                return NotFound(new { message = "Không có mốc tiến trình nào trong hệ thống." });

            var progressList = await _userMilestoneProgressService.GetAllByUserIdAsync(userId);

            if (progressList == null || !progressList.Any())
            {
                foreach (var milestone in allMilestones)
                {
                    var userMilestoneProgress = new UserMilestoneProgress
                    {
                        UserID = userId,
                        MilestoneID = milestone.MilestoneID,
                        AchievedDate = null,
                    };
                    await _userMilestoneProgressService.AddAsync(userMilestoneProgress);
                }
                progressList = await _userMilestoneProgressService.GetAllByUserIdAsync(userId);
            }

            // Lấy startDate từ QuitPlan (nếu có)
            var quitPlan = await _context.QuitPlans
                .Where(q => q.UserID == userId)
                .OrderByDescending(q => q.StartDate)
                .FirstOrDefaultAsync();

            DateTime? startDate = quitPlan?.StartDate;

            if (startDate == null)
            {
                // Nếu chưa có ngày bắt đầu, trả về như cũ
                var result = progressList.Select(up => new
                {
                    up.UserMilestoneID,
                    up.MilestoneID,
                    MilestoneName = up.Milestone?.Name ?? "N/A",
                    up.AchievedDate,
                    Description = up.Milestone?.Description ?? "N/A",
                    MilestoneGroupID = up.Milestone?.MilestoneGroupID,
                    MilestoneGroupName = up.Milestone?.MilestoneGroup?.GroupName ?? "N/A",
                    MilestoneTime = up.Milestone?.MilestoneTime,
                    Percent = up.Milestone?.Percent,
                    TimeUnit = up.Milestone?.TimeUnit,
                    PackageMilestones = up.Milestone?.PackageMilestones ?? new List<PackageMilestone>(),
                    Achieved = false,
                    ProgressPercent = 0
                }).ToList();
                return Ok(result);
            }

            var now = DateTime.Now;
            var resultWithRealtime = progressList.Select(up =>
            {
                double milestoneTime = up.Milestone?.MilestoneTime ?? 0;
                string timeUnitRaw = up.Milestone?.TimeUnit?.Trim().ToLower() ?? "minute";

                // QUY ĐỔI THÁNG/NĂM SANG NGÀY
                if (timeUnitRaw == "tháng")
                {
                    milestoneTime *= 30;
                    timeUnitRaw = "ngày";
                }
                else if (timeUnitRaw == "năm")
                {
                    milestoneTime *= 365;
                    timeUnitRaw = "ngày";
                }

                // CHUẨN HÓA timeUnit về tiếng Anh
                var timeUnit = timeUnitRaw switch
                {
                    "phút" => "minute",
                    "giờ" => "hour",
                    "ngày" => "day",
                    _ => timeUnitRaw
                };

                DateTime milestoneDate = timeUnit switch
                {
                    "minute" => startDate.Value.AddMinutes(milestoneTime),
                    "hour" => startDate.Value.AddHours(milestoneTime),
                    "day" => startDate.Value.AddDays(milestoneTime),
                    _ => startDate.Value
                };

                double totalUnit = timeUnit switch
                {
                    "minute" => (now - startDate.Value).TotalMinutes,
                    "hour" => (now - startDate.Value).TotalHours,
                    "day" => (now - startDate.Value).TotalDays,
                    _ => 0
                };

                var achieved = now >= milestoneDate;
                if (totalUnit < 0) totalUnit = 0;

                var percent = milestoneTime > 0
                    ? Math.Min(100, Math.Max(0, (int)(totalUnit * 100 / milestoneTime)))
                    : 0;

                return new
                {
                    up.UserMilestoneID,
                    up.MilestoneID,
                    MilestoneName = up.Milestone?.Name ?? "N/A",
                    up.AchievedDate,
                    Description = up.Milestone?.Description ?? "N/A",
                    MilestoneGroupID = up.Milestone?.MilestoneGroupID,
                    MilestoneGroupName = up.Milestone?.MilestoneGroup?.GroupName ?? "N/A",
                    MilestoneTime = up.Milestone?.MilestoneTime,
                    Percent = up.Milestone?.Percent,
                    TimeUnit = up.Milestone?.TimeUnit,
                    PackageMilestones = up.Milestone?.PackageMilestones ?? new List<PackageMilestone>(),
                    Achieved = achieved,
                    ProgressPercent = achieved ? 100 : percent
                };
            }).ToList();



            return Ok(resultWithRealtime);
        }



        // Lấy tiến trình của người dùng theo ID tiến trình
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            // Lấy UserID từ JWT token một cách an toàn
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            {
                return Unauthorized(new { message = "Không thể xác định ID người dùng." });
            }

            var progress = await _userMilestoneProgressService.GetByIdAsync(id);

            // Kiểm tra quyền sở hữu tiến trình
            if (progress == null || progress.UserID != userId)
                return NotFound(new { message = "Không tìm thấy tiến trình hoặc tiến trình không thuộc người dùng này." });

            return Ok(progress);
        }


    }
}
