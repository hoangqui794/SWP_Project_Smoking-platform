using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;


namespace Smoking.DAL.Repositories
{
    public class MilestoneRepository : IMilestoneRepository
    {
        private readonly AppDbContext _context;

        public MilestoneRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Milestone>> GetAllAsync()
        {
            return await _context.Milestones.ToListAsync();
        }

        public async Task<Milestone?> GetByIdAsync(int id)
        {
            return await _context.Milestones.FindAsync(id);
        }

        public async Task AddAsync(Milestone milestone)
        {
            await _context.Milestones.AddAsync(milestone);
        }

        public void Update(Milestone milestone)
        {
            _context.Milestones.Update(milestone);
        }

        public void Delete(Milestone milestone)
        {
            _context.Milestones.Remove(milestone);
        }

        // Thêm Include group
        public async Task<List<Milestone>> GetMilestonesWithGroupsAsync()
        {
            return await _context.Milestones
        .Include(m => m.MilestoneGroup)  
        .ToListAsync();
        }

        // Thêm filter theo MilestoneGroupID
        public async Task<IEnumerable<Milestone>> GetByGroupIdAsync(int groupId)
        {
            return await _context.Milestones
                .Include(m => m.MilestoneGroup)
                .Where(m => m.MilestoneGroupID == groupId)
                .ToListAsync();
        }
    }
}