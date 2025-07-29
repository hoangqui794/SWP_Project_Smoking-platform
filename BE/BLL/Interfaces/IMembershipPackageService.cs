using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface IMembershipPackageService
    {
        Task<IEnumerable<MembershipPackage>> GetAllAsync();
        Task<MembershipPackage?> GetByIdAsync(int id);
    }
}
