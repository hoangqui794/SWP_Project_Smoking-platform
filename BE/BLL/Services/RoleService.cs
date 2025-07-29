using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    public class RoleService : IRoleService
    {
        private readonly IUnitOfWork _unitOfWork;

        public RoleService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Role> CreateAsync(Role entity)
        {
            await _unitOfWork.Roles.AddAsync(entity);
            await _unitOfWork.CompleteAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _unitOfWork.Roles.GetByIdAsync(id);
            if (existing == null)
                return false;

            _unitOfWork.Roles.Remove(existing);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<IEnumerable<Role>> GetAllAsync()
        {
            return await _unitOfWork.Roles.GetAllAsync();
        }

        public async Task<Role> GetByIdAsync(int id)
        {
            return await _unitOfWork.Roles.GetByIdAsync(id);
        }

        public async Task<Role> GetByNameAsync(string roleName)
        {
            return await _unitOfWork.Roles.GetByNameAsync(roleName);
        }

        public async Task<bool> UpdateAsync(Role entity)
        {
            var existing = await _unitOfWork.Roles.GetByIdAsync(entity.RoleID);
            if (existing == null)
                return false;

            existing.RoleName = entity.RoleName;
            existing.Description = entity.Description;
            _unitOfWork.Roles.Update(existing);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
