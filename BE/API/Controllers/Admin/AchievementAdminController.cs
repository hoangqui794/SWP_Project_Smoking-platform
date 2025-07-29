using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.API.Models.Admin;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/achievements")]
    [Authorize(Roles = "1")] // Admin
    public class AchievementAdminController : ControllerBase
    {
        private readonly IAchievementService _service;

        public AchievementAdminController(IAchievementService service)
        {
            _service = service;
        }

        // 📋 Lấy tất cả thành tựu
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(new { success = true, data });
        }

        // 🔍 Lấy chi tiết theo ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            return item == null
                ? NotFound(new { success = false, message = "Không tìm thấy thành tựu." })
                : Ok(new { success = true, data = item });
        }

        // ➕ Thêm mới thành tựu
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] AchievementUpdate dto)
        {
            if (string.IsNullOrWhiteSpace(dto.AchievementName) || string.IsNullOrWhiteSpace(dto.PackageType))
                return BadRequest(new { success = false, message = "Tên và loại gói là bắt buộc." });

            var achievement = new Achievement
            {
                AchievementName = dto.AchievementName,
                Description = dto.Description,
                Criteria = dto.Criteria,
                BadgeImage = dto.BadgeImage,
                PackageType = dto.PackageType,
                SmokeFreeDaysRequired = dto.SmokeFreeDaysRequired,
                MoneySavedRequired = dto.MoneySavedRequired,
                CigarettesDroppedRequired = dto.CigarettesDroppedRequired,
                CheckinDaysRequired = dto.CheckinDaysRequired
            };

            await _service.CreateAsync(achievement);
            return Ok(new { success = true, message = "Tạo thành tựu thành công.", data = achievement });
        }

        // ✏️ Cập nhật thành tựu
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AchievementUpdate dto)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { success = false, message = "Không tìm thấy thành tựu để cập nhật." });

            existing.AchievementName = dto.AchievementName ?? existing.AchievementName;
            existing.Description = dto.Description;
            existing.Criteria = dto.Criteria;
            existing.BadgeImage = dto.BadgeImage;
            existing.PackageType = dto.PackageType;
            existing.SmokeFreeDaysRequired = dto.SmokeFreeDaysRequired;
            existing.MoneySavedRequired = dto.MoneySavedRequired;
            existing.CigarettesDroppedRequired = dto.CigarettesDroppedRequired;
            existing.CheckinDaysRequired = dto.CheckinDaysRequired;

            await _service.UpdateAsync(existing);
            return Ok(new { success = true, message = "Cập nhật thành công." });
        }

        // ❌ Xoá thành tựu
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            return result
                ? Ok(new { success = true, message = "Xoá thành công." })
                : NotFound(new { success = false, message = "Không tìm thấy thành tựu để xoá." });
        }

        // 🔎 Tìm kiếm
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string keyword)
        {
            var data = await _service.SearchAsync(keyword);

            if (!data.Any())
                return Ok(new { success = false, message = "Không tìm thấy kết quả nào.", data = Array.Empty<Achievement>() });

            return Ok(new { success = true, message = "Tìm thấy kết quả.", data });
        }
    }
}
