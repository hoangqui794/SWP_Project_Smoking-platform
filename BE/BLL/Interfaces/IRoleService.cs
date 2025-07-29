using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface IRoleService
    {
        Task<IEnumerable<Role>> GetAllAsync();
        Task<Role> GetByIdAsync(int id);
        Task<Role> GetByNameAsync(string roleName);
        Task<Role> CreateAsync(Role entity);
        Task<bool> UpdateAsync(Role entity);
        Task<bool> DeleteAsync(int id);
    }
}
