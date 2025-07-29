using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    public interface IUserMembershipRepository : IGenericRepository<UserMembership>
    {
        Task<UserMembership?> GetActiveByUserIdAsync(int userId);
        Task UpdateAsync(UserMembership entity);
        Task<UserMembership> GetLatestValidMembershipByUserIdAsync(int userId);

    }
}
