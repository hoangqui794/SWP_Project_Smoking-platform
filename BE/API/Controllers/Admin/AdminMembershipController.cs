using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smoking.API.Models.Admin;
using Smoking.API.Models.Admin.Smoking.API.Models.Admin;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces;
using Smoking.DAL.Interfaces.Repositories;

namespace Smoking.API.Controllers.Admin
{
    [Route("api/admin/memberships")]
    [ApiController]
    [Authorize(Roles = "1")]
    public class AdminMembershipController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public AdminMembershipController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // Lấy danh sách user membership
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUserMemberships()
        {
            var memberships = await _unitOfWork.UserMemberships.GetAllWithIncludeAsync(includeProperties: "User,Package");

            var result = memberships.Select(m => new AdminUserMembershipDto
            {
                UserMembershipID = m.UserMembershipID,
                UserID = m.UserID,
                FullName = m.User.FullName,
                Email = m.User.Email,
                PackageName = m.Package.PackageName,
                StartDate = m.StartDate,
                EndDate = m.EndDate,
                PaymentStatus = m.PaymentStatus
            });

            return Ok(result);
        }

        // Gán gói thành viên cho user (Admin assign, không thanh toán)
        [HttpPost("assign")]
        public async Task<IActionResult> AssignMembershipToUser([FromBody] AdminUpdateMembershipDto dto)
        {
            var package = await _unitOfWork.MembershipPackages.GetByIdAsync(dto.PackageId);
            if (package == null) return NotFound("Không tìm thấy gói");

            var user = await _unitOfWork.Users.GetByIdAsync(dto.UserId);
            if (user == null) return NotFound("Không tìm thấy người dùng");

            var now = DateTime.UtcNow;
            var end = package.Duration > 0
                ? now.AddMonths(package.Duration)
                : DateTime.MaxValue;

            var existing = await _unitOfWork.UserMemberships.GetActiveByUserIdAsync(dto.UserId);
            if (existing != null)
            {
                existing.PackageID = dto.PackageId;
                existing.StartDate = now;
                existing.EndDate = end;
                existing.PaymentStatus = "AdminAssigned";
                await _unitOfWork.UserMemberships.UpdateAsync(existing);
            }
            else
            {
                var newMembership = new UserMembership
                {
                    UserID = dto.UserId,
                    PackageID = dto.PackageId,
                    StartDate = now,
                    EndDate = end,
                    PaymentStatus = "AdminAssigned"
                };
                await _unitOfWork.UserMemberships.AddAsync(newMembership);
            }

            await _unitOfWork.CompleteAsync();
            return Ok(new { message = "Cập nhật thành công" });
        }

        // Lấy danh sách tất cả các gói
        [HttpGet("packages")]
        public async Task<IActionResult> GetAllPackages()
        {
            var packages = await _unitOfWork.MembershipPackages.GetAllAsync();
            var userMemberships = await _unitOfWork.UserMemberships.GetAllAsync();

            var result = packages.Select(p => new AdminPackageWithCountDto
            {
                PackageId = p.PackageID,
                PackageName = p.PackageName,
                Duration = p.Duration,
                Price = p.Price,
                PurchasedCount = userMemberships.Count(m => m.PackageID == p.PackageID)
            }).ToList();

            return Ok(result);
        }

        // Tạo gói thành viên mới
        [HttpPost("createpackages")]
        public async Task<IActionResult> CreatePackage([FromBody] AdminCreatePackageDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra tên gói đã tồn tại chưa
            var existing = await _unitOfWork.MembershipPackages
                .FindFirstOrDefaultAsync(p => p.PackageName == dto.PackageName);
            if (existing != null)
                return BadRequest("❌ Tên gói đã tồn tại. Vui lòng chọn tên khác.");

            var newPackage = new MembershipPackage
            {
                PackageName = dto.PackageName,
                PackageType = dto.PackageType,
                Description = dto.Description ?? "",
                Price = dto.Price,
                Duration = dto.Duration
            };

            await _unitOfWork.MembershipPackages.AddAsync(newPackage);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "✅ Tạo gói thành công", newPackage });
        }

        // Cập nhật gói thành viên
        [HttpPut("Updatepackages/{id}")]
        public async Task<IActionResult> UpdatePackage(int id, [FromBody] MembershipPackage updatedPackage)
        {
            var package = await _unitOfWork.MembershipPackages.GetByIdAsync(id);
            if (package == null)
                return NotFound("Không tìm thấy gói");

            package.PackageName = updatedPackage.PackageName;
            package.PackageType = updatedPackage.PackageType;
            package.Description = updatedPackage.Description;
            package.Price = updatedPackage.Price;
            package.Duration = updatedPackage.Duration;

            _unitOfWork.MembershipPackages.Update(package);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Cập nhật gói thành công", package });
        }

        // Xóa gói thành viên
        [HttpDelete("Deletepackages/{id}")]
        public async Task<IActionResult> DeletePackage(int id)
        {
            var package = await _unitOfWork.MembershipPackages.GetByIdAsync(id);
            if (package == null)
                return NotFound("Không tìm thấy gói");

            var inUse = await _unitOfWork.UserMemberships.AnyAsync(m => m.PackageID == id);
            if (inUse)
                return BadRequest("Không thể xoá vì có người dùng đang sử dụng gói này.");

            _unitOfWork.MembershipPackages.Remove(package);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "Xoá gói thành công" });
        }
    }
}
