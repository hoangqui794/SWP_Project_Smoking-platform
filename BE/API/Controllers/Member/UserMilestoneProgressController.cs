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
    [Authorize(Roles = "2")] // Ch? ngu?i dùng (RoleID = 2) m?i có quy?n truy c?p
    public class UserMilestoneProgressController : ControllerBase
    {
        private readonly IUserMilestoneProgressService _userMilestoneProgressService;
        private readonly IMilestoneService _milestoneService; // Thêm service d? l?y d? li?u các m?c

        // Trong controller, inject AppDbContext (ho?c thông qua service)
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
                return Unauthorized(new { message = "Không th? xác d?nh ID ngu?i dùng." });
            }

            var allMilestones = await _milestoneService.GetAllAsync();
            if (allMilestones == null || !allMilestones.Any())
                return NotFound(new { message = "Không có m?c ti?n trình nào trong h? th?ng." });

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

            // L?y startDate t? QuitPlan (n?u có)
            var quitPlan = await _context.QuitPlans
                .Where(q => q.UserID == userId)
                .OrderByDescending(q => q.StartDate)
                .FirstOrDefaultAsync();

            DateTime? startDate = quitPlan?.StartDate;

            if (startDate == null)
            {
                // N?u chua có ngày b?t d?u, tr? v? nhu cu
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

            var now = DateTime.UtcNow;
            var resultWithRealtime = progressList.Select(up =>
            {
                double milestoneTime = up.Milestone?.MilestoneTime ?? 0;
                string timeUnitRaw = up.Milestone?.TimeUnit?.Trim().ToLower() ?? "minute";

                // QUY Ð?I THÁNG/NAM SANG NGÀY
                if (timeUnitRaw == "tháng")
                {
                    milestoneTime *= 30;
                    timeUnitRaw = "ngày";
                }
                else if (timeUnitRaw == "nam")
                {
                    milestoneTime *= 365;
                    timeUnitRaw = "ngày";
                }

                // CHU?N HÓA timeUnit v? ti?ng Anh
                var timeUnit = timeUnitRaw switch
                {
                    "phút" => "minute",
                    "gi?" => "hour",
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



        // L?y ti?n trình c?a ngu?i dùng theo ID ti?n trình
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            // L?y UserID t? JWT token m?t cách an toàn
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            {
                return Unauthorized(new { message = "Không th? xác d?nh ID ngu?i dùng." });
            }

            var progress = await _userMilestoneProgressService.GetByIdAsync(id);

            // Ki?m tra quy?n s? h?u ti?n trình
            if (progress == null || progress.UserID != userId)
                return NotFound(new { message = "Không tìm th?y ti?n trình ho?c ti?n trình không thu?c ngu?i dùng này." });

            return Ok(progress);
        }


    }
}
