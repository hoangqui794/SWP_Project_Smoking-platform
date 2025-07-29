using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface ISmokingStatusService
    {
        Task<IEnumerable<SmokingStatus>> GetAllAsync();
        Task<SmokingStatus> GetByIdAsync(int id);
        Task<IEnumerable<SmokingStatus>> GetByUserIdAsync(int userId);
        Task<SmokingStatus> CreateAsync(SmokingStatus entity);
        Task<bool> UpdateAsync(SmokingStatus entity);
        Task<bool> DeleteAsync(int id);
    }
}
