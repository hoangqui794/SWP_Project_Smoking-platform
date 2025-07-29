using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Smoking.BLL.Interfaces;
using Smoking.BLL.Services;

namespace Smoking.API.Controllers.Admin
{
    [Authorize(Roles = "1")] // admin
    [ApiController]
    [Route("api/[controller]")]
    public class RevenueController : ControllerBase
    {
        private readonly IRevenueService _revenueService;
        private readonly IUserService _userService;
        public RevenueController(IRevenueService revenueService, IUserService userService)
        {
            _revenueService = revenueService;
            _userService = userService;
        }

        [HttpGet("month")]
        public async Task<IActionResult> GetMonthlyRevenue([FromQuery] int year, [FromQuery] int month)
        {
            var total = await _revenueService.GetMonthlyRevenueAsync(year, month);
            return Ok(new { month, year, total });
        }

        [HttpGet("year")]
        public async Task<IActionResult> GetYearRevenue([FromQuery] int year)
        {
            var revenue = await _revenueService.GetRevenueByMonthRangeAsync(year);

            var memberCount = await _userService.CountUsersByRoleAsync("Member");
            var coachCount = await _userService.CountUsersByRoleAsync("Coach");

            return Ok(new
            {
                year,
                revenue,
                totalMembers = memberCount,
                totalCoaches = coachCount
            });
        }
    }

}
