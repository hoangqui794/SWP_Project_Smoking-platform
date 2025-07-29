using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface IAchievementService
    {
        Task<IEnumerable<Achievement>> GetAllAsync();
        Task<Achievement> GetByIdAsync(int id);
        Task<Achievement> CreateAsync(Achievement entity);
        Task<bool> UpdateAsync(Achievement entity);
        Task<bool> DeleteAsync(int id);

        Task<IEnumerable<Achievement>> SearchAsync(string keyword);
    }
}
