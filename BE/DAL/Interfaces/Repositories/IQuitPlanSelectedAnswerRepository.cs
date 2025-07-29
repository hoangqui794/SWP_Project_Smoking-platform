using Smoking.DAL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    public interface IQuitPlanSelectedAnswerRepository : IGenericRepository<QuitPlanSelectedAnswers>
    {
        Task<List<QuitPlanSelectedAnswers>> GetAnswersByQuitPlanIdAsync(int quitPlanId);
        Task<List<QuitPlanSelectedAnswers>> GetByUserIdAsync(int userId);
    }

}
