using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Smoking.DAL.Entities;

namespace Smoking.DAL.Interfaces.Repositories
{
    public interface IPackageMilestoneRepository
    {
        Task<IEnumerable<PackageMilestone>> GetAllAsync();
        Task<PackageMilestone?> GetByIdAsync(int id);
        Task AddAsync(PackageMilestone milestone);
        void Update(PackageMilestone milestone);
        void Delete(PackageMilestone milestone);
        Task<IEnumerable<PackageMilestone>> GetByMilestoneIdAsync(int milestoneId);
        void RemoveRange(IEnumerable<PackageMilestone> entities);

    }
}
