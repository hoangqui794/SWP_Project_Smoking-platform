using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.API.Models.Admin;
using Smoking.BLL.Models;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/milestones")]
    [Authorize(Roles = "1")]
    public class MilestoneAdminController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public MilestoneAdminController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetAll()
        {
            var milestones = await _unitOfWork.Milestones.GetMilestonesWithGroupsAsync();

            var groupDtos = milestones
                .GroupBy(m => new { m.MilestoneGroupID, m.MilestoneGroup.GroupName })
                .Select(g => new MilestoneGroupDTO
                {
                    GroupName = g.Key.GroupName,
                    Milestones = g.Select(m => new MilestoneDTO
                    {
                        Name = m.Name,
                        Description = m.Description,
                        Time = $"{m.MilestoneTime} {m.TimeUnit}",
                        Percent = m.Percent
                    }).ToList()
                }).ToList();

            return Ok(groupDtos);
        }

        // lấy dữ liệu theo groupId
        [HttpGet("list/{groupId}")]
        public async Task<IActionResult> GetByGroupId(int groupId)
        {
            var milestones = await _unitOfWork.Milestones.GetByGroupIdAsync(groupId);
            if (milestones == null || !milestones.Any())
                return NotFound(new { message = "Không có milestone nào trong nhóm này." });

            var milestoneDtos = milestones.Select(m => new MilestoneDTO
            {
                Name = m.Name,
                Description = m.Description,
                Time = $"{m.MilestoneTime} {m.TimeUnit}",
                Percent = m.Percent
            }).ToList();

            return Ok(milestoneDtos);
        }


        // lấy dữ liệu theo id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var milestone = await _unitOfWork.Milestones.GetByIdAsync(id);
            if (milestone == null)
                return NotFound(new { message = "Không tìm thấy milestone." });
            return Ok(milestone);
        }

        // POST: api/admin/milestones
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] MilestoneRequest model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var milestone = new Milestone
            {
                MilestoneGroupID = model.MilestoneGroupID,
                Name = model.Name,
                Description = model.Description,
                MilestoneTime = model.MilestoneTime,
                TimeUnit = model.TimeUnit,
                Percent = model.Percent
            };

            await _unitOfWork.Milestones.AddAsync(milestone);
            await _unitOfWork.CompleteAsync();
            return CreatedAtAction(nameof(GetById), new { id = milestone.MilestoneID }, milestone);
        }


        //[HttpPut("{id}")]
        //public async Task<IActionResult> Update(int id, [FromBody] Milestone model)
        //{
        //    if (!ModelState.IsValid)
        //        return BadRequest(ModelState);

        //    var existing = await _unitOfWork.Milestones.GetByIdAsync(id);
        //    if (existing == null)
        //        return NotFound(new { message = "Milestone không tồn tại." });

        //    existing.Name = model.Name;
        //    existing.Description = model.Description;
        //    existing.MilestoneTime = model.MilestoneTime;
        //    existing.TimeUnit = model.TimeUnit;
        //    existing.Percent = model.Percent;
        //    existing.MilestoneGroupID = model.MilestoneGroupID;

        //    _unitOfWork.Milestones.Update(existing);
        //    await _unitOfWork.CompleteAsync();

        //    return Ok(existing);
        //}

        // DELETE: api/admin/milestones/{id}
        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var milestone = await _unitOfWork.Milestones.GetByIdAsync(id);
            if (milestone == null)
                return NotFound(new { message = "Milestone không tồn tại." });

            // Lấy các bản ghi liên kết
            var relatedPackages = await _unitOfWork.PackageMilestones.GetByMilestoneIdAsync(id);

            // Xoá các bản ghi liên kết trước
            if (relatedPackages.Any())
                _unitOfWork.PackageMilestones.RemoveRange(relatedPackages);

            _unitOfWork.Milestones.Delete(milestone);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Xoá milestone và dữ liệu liên kết thành công." });
        }


        [HttpPut("update")]
        public async Task<IActionResult> Update(int id, [FromBody] MilestoneRequest model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = await _unitOfWork.Milestones.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = "Milestone không tồn tại." });

            existing.Name = model.Name;
            existing.Description = model.Description;
            existing.MilestoneTime = model.MilestoneTime;
            existing.TimeUnit = model.TimeUnit;
            existing.Percent = model.Percent;
            existing.MilestoneGroupID = model.MilestoneGroupID;

            _unitOfWork.Milestones.Update(existing);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Cập nhật milestone thành công.", milestone = existing });
        }


    }
}
