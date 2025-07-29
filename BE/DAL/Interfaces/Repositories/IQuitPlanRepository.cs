using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    /// <summary>
    /// Interface cho QuitPlan, bổ sung GetByUserIdAsync
    /// </summary>
    public interface IQuitPlanRepository : IGenericRepository<QuitPlan>
    {
        Task<IEnumerable<QuitPlan>> GetByUserIdAsync(int userId);
        Task<QuitPlan?> GetLatestByUserIdAsync(int userId);

    }
}
