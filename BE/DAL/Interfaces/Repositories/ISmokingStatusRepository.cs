using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    /// <summary>
    /// Interface cho SmokingStatus, bổ sung GetByUserIdAsync
    /// </summary>
    public interface ISmokingStatusRepository : IGenericRepository<SmokingStatus>
    {
        Task<IEnumerable<SmokingStatus>> GetByUserIdAsync(int userId);
    }
}
