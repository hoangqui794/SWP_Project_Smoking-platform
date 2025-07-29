using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface IQuitPlanService
    {
        Task<IEnumerable<QuitPlan>> GetAllAsync();
        Task<QuitPlan> GetByIdAsync(int id);
        Task<IEnumerable<QuitPlan>> GetByUserIdAsync(int userId);
        Task<QuitPlan> CreateAsync(QuitPlan entity);
        Task<bool> UpdateAsync(QuitPlan entity);
        Task<bool> DeleteAsync(int id);
        Task<bool> DeleteAllPlansAndProgressByUserAsync(int userId);

    }
}
