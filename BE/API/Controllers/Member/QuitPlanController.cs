using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.API.Models.User;
using Smoking.BLL.Interfaces;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "2")]
public class QuitPlanController : ControllerBase
{
    private readonly IQuitPlanAutoService _quitPlanAutoService;
    private readonly IQuitPlanService _quitPlanService;

    public QuitPlanController(IQuitPlanAutoService quitPlanAutoService, IQuitPlanService quitPlanService)
    {
        _quitPlanAutoService = quitPlanAutoService;
        _quitPlanService = quitPlanService;
    }

    [HttpPost("CreateQuitPlan")]
    public async Task<IActionResult> AutoCreateQuitPlan([FromBody] AutoQuitPlanRequest request)
    {
        var plan = await _quitPlanAutoService.CreateAutoQuitPlanAsync(
            request.UserId,
            request.CigarettesPerDay,
            request.PricePerPack,
            request.CigarettesPerPack,
            request.StartDate,
            request.TargetDurationInMonths
        );

        if (plan == null)
            return BadRequest("Bạn đã có kế hoạch đang hoạt động.");

        return Ok(new
        {
            message = "Tạo kế hoạch cai thuốc thành công.",
            startDate = plan.StartDate.ToString("dd/MM/yyyy"),
            endDate = plan.EndDate?.ToString("dd/MM/yyyy") ?? "Chưa có ngày kết thúc",
        });
    }

    [HttpPatch("UpdateQuitPlan")]
    public async Task<IActionResult> UpdateCoreInfoByUserId(int userId, [FromBody] QuitPlanUpdateCoreRequest request)
    {
        var plans = await _quitPlanService.GetByUserIdAsync(userId);
        var activePlan = plans.FirstOrDefault(p => p.Status == "Active");

        if (activePlan == null)
            return NotFound("Không tìm thấy kế hoạch đang hoạt động.");

        if (request.CigarettesPerDayAtStart.HasValue)
            activePlan.CigarettesPerDayAtStart = request.CigarettesPerDayAtStart.Value;

        if (request.PricePerPackAtStart.HasValue)
            activePlan.PricePerPackAtStart = request.PricePerPackAtStart.Value;

        if (request.CigarettesPerPack.HasValue)
            activePlan.CigarettesPerPack = request.CigarettesPerPack.Value;

        if (request.TargetDurationInMonths.HasValue)
        {
            activePlan.EndDate = activePlan.StartDate.AddMonths(request.TargetDurationInMonths.Value);
        }

        var success = await _quitPlanService.UpdateAsync(activePlan);
        return success
            ? Ok(new { message = "Cập nhật thành công.", plan = activePlan })
            : StatusCode(500, "Cập nhật thất bại.");
    }


    [HttpDelete("DeleteQuitPlanAndProgress")]
    public async Task<IActionResult> DeleteAllByUser(int userId)
    {
        var result = await _quitPlanService.DeleteAllPlansAndProgressByUserAsync(userId);
        return result
            ? Ok("Đã xoá tất cả kế hoạch và tiến trình của người dùng.")
            : NotFound("Người dùng không có kế hoạch.");
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var plans = await _quitPlanService.GetByUserIdAsync(userId);
        return Ok(plans);
    }

}
