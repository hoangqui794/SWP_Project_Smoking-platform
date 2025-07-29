using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface IUserMilestoneProgressService
    {
        Task<List<UserMilestoneProgress>> GetAllByUserIdAsync(int userId);
        Task<UserMilestoneProgress> GetByIdAsync(int id);
        Task AddAsync(UserMilestoneProgress userMilestoneProgress);
    }
}
