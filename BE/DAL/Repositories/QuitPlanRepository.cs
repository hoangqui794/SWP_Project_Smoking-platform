using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class QuitPlanRepository : GenericRepository<QuitPlan>, IQuitPlanRepository
    {
        public QuitPlanRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<QuitPlan>> GetByUserIdAsync(int userId)
        {
            return await _context.QuitPlans
                                 .Where(q => q.UserID == userId)
                                 .AsNoTracking()
                                 .ToListAsync();
        }

        public async Task<QuitPlan?> GetLatestByUserIdAsync(int userId)
        {
            return await _context.QuitPlans
                                 .Where(q => q.UserID == userId)
                                 .OrderByDescending(q => q.StartDate) // hoặc CreatedDate nếu có
                                 .FirstOrDefaultAsync();
        }

    }


}
