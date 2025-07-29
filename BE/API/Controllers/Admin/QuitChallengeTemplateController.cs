using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.API.Models.Admin;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using System.Threading.Tasks;

[ApiController]
[Route("api/admin/challenge-templates")]
[Authorize(Roles = "1")] // Admin role
public class QuitChallengeTemplateController : ControllerBase
{
    private readonly IQuitChallengeTemplateService _service;

    public QuitChallengeTemplateController(IQuitChallengeTemplateService service)
    {
        _service = service;
    }

    // 📌 Lấy tất cả mẫu thử thách
    [HttpGet("all")]
    public async Task<IActionResult> GetAllTemplates()
    {
        var templates = await _service.GetAllTemplatesAsync();
        return Ok(new { success = true, data = templates });
    }

    // ➕ Tạo mẫu thử thách mới
    [HttpPost("create")]
    public async Task<IActionResult> CreateTemplate([FromBody] QuitChallengeTemplateCreateDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });

        var template = new QuitChallengeTemplate
        {
            Title = model.Title,
            Description = model.Description,
            NotesSuggestion = model.NotesSuggestion,
            Stage = model.Stage,
            StageTitle = model.StageTitle
        };

        await _service.CreateTemplateAsync(template);
        return Ok(new { success = true, message = "Tạo mẫu thử thách thành công." });
    }

    // ✏️ Cập nhật mẫu thử thách
    [HttpPut("update/{id}")]
    public async Task<IActionResult> UpdateTemplate(int id, [FromBody] QuitChallengeTemplateCreateDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ." });

        var template = new QuitChallengeTemplate
        {
            Title = model.Title,
            Description = model.Description,
            NotesSuggestion = model.NotesSuggestion,
            Stage = model.Stage,
            StageTitle = model.StageTitle
        };

        var result = await _service.UpdateTemplateAsync(id, template);
        if (!result)
            return NotFound(new { success = false, message = "Không tìm thấy mẫu thử thách để cập nhật." });

        return Ok(new { success = true, message = "Cập nhật mẫu thử thách thành công." });
    }

    // ❌ Xoá mẫu thử thách
    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteTemplate(int id)
    {
        var result = await _service.DeleteTemplateAsync(id);
        if (!result)
            return NotFound(new { success = false, message = "Không tìm thấy mẫu thử thách để xoá." });

        return Ok(new { success = true, message = "Xoá mẫu thử thách thành công." });
    }
}
