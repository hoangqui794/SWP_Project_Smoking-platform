using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class QuitPlanSelectedAnswerRepository : GenericRepository<QuitPlanSelectedAnswers>, IQuitPlanSelectedAnswerRepository
    {
        private readonly AppDbContext _context;

        public QuitPlanSelectedAnswerRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<QuitPlanSelectedAnswers>> GetAnswersByQuitPlanIdAsync(int quitPlanId)
        {
            return await _context.QuitPlanSelectedAnswers
                .Include(a => a.AnswerOption)
                    .ThenInclude(q => q.Question)
                .Where(a => a.QuitPlanID == quitPlanId)
                .ToListAsync();
        }

        public async Task<List<QuitPlanSelectedAnswers>> GetByUserIdAsync(int userId)
        {
            return await _context.QuitPlanSelectedAnswers
                .Include(q => q.AnswerOption)
                    .ThenInclude(a => a.Question)
                .Include(q => q.QuitPlan)
                .Where(q => q.QuitPlan.UserID == userId)
                .ToListAsync();
        }
    }
}
