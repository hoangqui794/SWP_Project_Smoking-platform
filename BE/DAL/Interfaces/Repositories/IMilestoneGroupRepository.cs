using Smoking.DAL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    public interface IMilestoneGroupRepository
    {
        Task<MilestoneGroup?> GetByIdAsync(int id);
        Task<IEnumerable<MilestoneGroup>> GetAllAsync();
    }

}
