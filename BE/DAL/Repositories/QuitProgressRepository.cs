using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class QuitProgressRepository : GenericRepository<QuitProgress>, IQuitProgressRepository
    {
        public QuitProgressRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<QuitProgress>> GetByQuitPlanIdAsync(int quitPlanId)
        {
            return await _context.QuitProgresses
                                 .Where(p => p.QuitPlanID == quitPlanId)
                                 .AsNoTracking()
                                 .ToListAsync();
        }

        public async Task<QuitProgress> FindFirstOrDefaultAsync(Expression<Func<QuitProgress, bool>> predicate)
        {
            return await _context.QuitProgresses.FirstOrDefaultAsync(predicate);
        }

        public async Task<IEnumerable<QuitProgress>> GetAllWithUserAsync()
        {
            return await _context.QuitProgresses
                .Include(p => p.QuitPlan)
                    .ThenInclude(q => q.User)
                .ToListAsync();
        }

        public async Task<List<QuitProgress>> GetByUserIdAsync(int userId)
        {
            return await _context.QuitProgresses
                .Include(p => p.QuitPlan)
                .Where(p => p.QuitPlan != null && p.QuitPlan.UserID == userId)
                .ToListAsync();
        }
    }
}
