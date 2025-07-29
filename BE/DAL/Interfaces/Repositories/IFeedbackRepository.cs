using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    /// <summary>
    /// Interface cho Feedback, bổ sung GetByUserIdAsync
    /// </summary>
    public interface IFeedbackRepository : IGenericRepository<Feedback>
    {
        Task<IEnumerable<Feedback>> GetByUserIdAsync(int userId);
        Task<IEnumerable<Feedback>> GetAllWithUserAsync();
        Task<Feedback?> GetByIdWithUserAsync(int id);
    }
}
