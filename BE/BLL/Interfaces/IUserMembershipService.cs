using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface IUserMembershipService
    {
        Task<UserMembership> CreateOrUpdateMembershipAsync(int userId, int packageId);
        Task<UserMembership?> GetActiveByUserIdAsync(int userId);
    }

}
