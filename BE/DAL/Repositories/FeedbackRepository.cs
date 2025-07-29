using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class FeedbackRepository : GenericRepository<Feedback>, IFeedbackRepository
    {
        public FeedbackRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Feedback>> GetByUserIdAsync(int userId)
        {
            return await _context.Feedback
                .Where(f => f.UserID == userId)
                .Include(f => f.User)
                    .ThenInclude(u => u.Role)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Feedback>> GetAllWithUserAsync()
        {
            return await _context.Feedback
                .Include(f => f.User)
                    .ThenInclude(u => u.Role)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Feedback?> GetByIdWithUserAsync(int id)
        {
            return await _context.Feedback
                .Include(f => f.User)
                    .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(f => f.FeedbackID == id);
        }
    }
}
