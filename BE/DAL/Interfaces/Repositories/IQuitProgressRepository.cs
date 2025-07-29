using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    /// <summary>
    /// Interface cho QuitProgress, bổ sung GetByQuitPlanIdAsync
    /// </summary>
    public interface IQuitProgressRepository : IGenericRepository<QuitProgress>
    {
        Task<IEnumerable<QuitProgress>> GetByQuitPlanIdAsync(int quitPlanId);
        Task<QuitProgress> FindFirstOrDefaultAsync(Expression<Func<QuitProgress, bool>> predicate);
        Task<IEnumerable<QuitProgress>> GetAllWithUserAsync(); // ✅ giữ lại
        Task<List<QuitProgress>> GetByUserIdAsync(int userId); // ✅ giữ lại
    }
}
