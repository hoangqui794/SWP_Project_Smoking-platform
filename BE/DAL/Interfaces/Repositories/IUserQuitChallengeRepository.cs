using Smoking.DAL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    public interface IUserQuitChallengeRepository : IGenericRepository<UserQuitChallenge>
    {
        Task<List<UserQuitChallenge>> GetChallengesForUserAsync(int userId, DateTime from, DateTime to);
        Task<IEnumerable<UserQuitChallenge>> GetByUserIdAndStageAsync(int userId, int stage);
        Task<IEnumerable<UserQuitChallenge>> GetAllWithUserAsync();   
        Task<List<UserQuitChallenge>> GetByUserIdAsync(int userId);    
    }
}
