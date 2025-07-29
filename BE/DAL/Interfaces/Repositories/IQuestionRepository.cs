using Smoking.DAL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    public interface IQuestionRepository : IGenericRepository<Question>
    {
        Task<List<Question>> GetQuestionsWithAnswersAsync();
        Task<Question?> GetQuestionsWithAnswersByIdAsync(int id);

    }

}
