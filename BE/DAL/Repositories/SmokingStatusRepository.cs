using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class SmokingStatusRepository : GenericRepository<SmokingStatus>, ISmokingStatusRepository
    {
        public SmokingStatusRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<SmokingStatus>> GetByUserIdAsync(int userId)
        {
            return await _context.SmokingStatuses
                                 .Where(s => s.UserID == userId)
                                 .AsNoTracking()
                                 .ToListAsync();
        }
    }
}
