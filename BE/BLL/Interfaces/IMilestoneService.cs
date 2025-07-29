using Smoking.BLL.Models;
using Smoking.DAL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Smoking.BLL.Interfaces
{
    public interface IMilestoneService
    {
        Task<List<MilestoneGroupDTO>> GetGroupedMilestonesAsync();
        Task<List<Milestone>> GetAllAsync();
    }
}