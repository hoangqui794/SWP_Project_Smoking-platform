using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.API.Models.Admin;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Threading.Tasks;


namespace Smoking.API.Controllers.Admin
    {
        [ApiController]
        [Route("api/admin/package-milestones")]
        [Authorize(Roles = "1")] // Chỉ admin mới được truy cập
        public class PackageMilestoneController : ControllerBase
        {
            private readonly IUnitOfWork _unitOfWork;

            public PackageMilestoneController(IUnitOfWork unitOfWork)
            {
                _unitOfWork = unitOfWork;
            }

        // Lấy tất cả các package milestone
        [HttpGet("list")]
        public async Task<IActionResult> GetAll()
        {
            var list = await _unitOfWork.PackageMilestones.GetAllAsync();

            var result = list.Select(pm => new {
                pm.PackageMilestoneID,
                pm.PackageID,
                PackageName = pm.Package?.PackageName ?? "N/A",
                pm.MilestoneID,
                MilestoneName = pm.Milestone?.Name ?? "N/A",
                pm.DetailDescription
            });

            return Ok(result);
        }

        //Lấy chi tiết một PackageMilestone theo ID
        [HttpGet("{id}")]
            public async Task<IActionResult> GetById(int id)
            {
                var item = await _unitOfWork.PackageMilestones.GetByIdAsync(id);
                if (item == null)
                    return NotFound(new { message = "Không tìm thấy dữ liệu." });

                return Ok(item);
            }

        // Tạo mới
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] PackageMilestoneDto dto)
        {
            if (dto.PackageID == null || dto.MilestoneID == null)
                return BadRequest("PackageID và MilestoneID là bắt buộc khi tạo.");

            var entity = new PackageMilestone
            {
                PackageID = dto.PackageID.Value,
                MilestoneID = dto.MilestoneID.Value,
                DetailDescription = dto.DetailDescription
            };

            await _unitOfWork.PackageMilestones.AddAsync(entity);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Tạo thành công", data = entity });
        }
        // Cập nhật
        [HttpPut("update")]
        public async Task<IActionResult> Update(int id, [FromBody] PackageMilestoneDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.DetailDescription))
                return BadRequest("DetailDescription không được để trống khi cập nhật.");

            var item = await _unitOfWork.PackageMilestones.GetByIdAsync(id);
            if (item == null)
                return NotFound(new { message = "Không tìm thấy dữ liệu." });

            item.DetailDescription = dto.DetailDescription;
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Cập nhật thành công" });
        }




        // Xóa
        [HttpDelete("delete")]
            public async Task<IActionResult> Delete(int id)
            {
                var item = await _unitOfWork.PackageMilestones.GetByIdAsync(id);
                if (item == null)
                    return NotFound(new { message = "Không tìm thấy dữ liệu." });

                _unitOfWork.PackageMilestones.Delete(item);
                await _unitOfWork.CompleteAsync();

                return Ok(new { message = "Xóa thành công" });
            }
        }
    }
