using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Smoking.DAL.Entities;

namespace Smoking.BLL.Interfaces
{
    public interface IPackageMilestoneService
    {
        Task<IEnumerable<PackageMilestone>> GetAllAsync();
        Task<PackageMilestone?> GetByIdAsync(int id);
        Task AddAsync(PackageMilestone entity);
        Task UpdateAsync(int id, string newDescription);
        Task DeleteAsync(int id);

    }
}
