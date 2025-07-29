using Smoking.DAL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    public interface IMilestoneRepository
    {
        Task<List<Milestone>> GetAllAsync();
        Task<Milestone?> GetByIdAsync(int id);
        Task AddAsync(Milestone milestone);
        void Update(Milestone milestone);
        void Delete(Milestone milestone);

        // Bổ sung:
        Task<List<Milestone>> GetMilestonesWithGroupsAsync(); // Lấy tất cả + include group
        Task<IEnumerable<Milestone>> GetByGroupIdAsync(int groupId); // Lấy theo nhóm
    }

}
