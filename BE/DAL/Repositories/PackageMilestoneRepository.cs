using Smoking.DAL.Data;
using Smoking.DAL.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Entities;

namespace Smoking.DAL.Repositories
{
    public class PackageMilestoneRepository : IPackageMilestoneRepository
    {
        private readonly AppDbContext _context;

        public PackageMilestoneRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PackageMilestone>> GetAllAsync()
        {
            return await _context.PackageMilestones
                .Include(pm => pm.Milestone)
                .Include(pm => pm.Package)
                .ToListAsync();
        }


        public async Task<PackageMilestone?> GetByIdAsync(int id)
        {
            return await _context.PackageMilestones
                .Include(pm => pm.Milestone)
                .Include(pm => pm.Package)
                .FirstOrDefaultAsync(pm => pm.PackageMilestoneID == id);
        }

        public async Task AddAsync(PackageMilestone milestone)
        {
            await _context.PackageMilestones.AddAsync(milestone);
        }

        public void Update(PackageMilestone milestone)
        {
            _context.PackageMilestones.Update(milestone);
        }

        public void Delete(PackageMilestone milestone)
        {
            _context.PackageMilestones.Remove(milestone);
        }
        public async Task<IEnumerable<PackageMilestone>> GetByMilestoneIdAsync(int milestoneId)
        {
            return await _context.PackageMilestones
                .Where(pm => pm.MilestoneID == milestoneId)
                .ToListAsync();
        }

        public void RemoveRange(IEnumerable<PackageMilestone> entities)
        {
            _context.PackageMilestones.RemoveRange(entities);
        }
    }
}
