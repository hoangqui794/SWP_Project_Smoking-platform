using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class RoleRepository : GenericRepository<Role>, IRoleRepository
    {
        public RoleRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Role> GetByNameAsync(string roleName)
        {
            return await _context.Roles
                                 .AsNoTracking()
                                 .FirstOrDefaultAsync(r => r.RoleName == roleName);
        }
    }
}
