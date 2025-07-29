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
    public class MilestoneGroupRepository : IMilestoneGroupRepository
    {
        private readonly AppDbContext _context;

        public MilestoneGroupRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MilestoneGroup?> GetByIdAsync(int id)
        {
            return await _context.MilestoneGroups.FindAsync(id);
        }

        public async Task<IEnumerable<MilestoneGroup>> GetAllAsync()
        {
            return await _context.MilestoneGroups.ToListAsync();
        }
    }

}
