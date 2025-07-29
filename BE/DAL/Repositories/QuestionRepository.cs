using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class QuestionRepository : GenericRepository<Question>, IQuestionRepository
    {
        public QuestionRepository(AppDbContext context) : base(context) { }

        public async Task<List<Question>> GetQuestionsWithAnswersAsync()
        {
            return await _context.Questions
                .Include(q => q.AnswerOptions)
                .Where(q => q.IsActive)
                .OrderBy(q => q.DisplayOrder)
                .ToListAsync();
        }

        public async Task<Question?> GetQuestionsWithAnswersByIdAsync(int id)
        {
            return await _context.Questions
                .Include(q => q.AnswerOptions)
                .FirstOrDefaultAsync(q => q.QuestionID == id);
        }
    }

}
