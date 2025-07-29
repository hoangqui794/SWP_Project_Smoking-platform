using Smoking.DAL.Entities;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    /// <summary>
    /// Interface riêng cho Role, bổ sung phương thức GetByNameAsync
    /// </summary>
    public interface IRoleRepository : IGenericRepository<Role>
    {
        Task<Role> GetByNameAsync(string roleName);
    }
}
