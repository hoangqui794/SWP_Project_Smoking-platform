using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class UserMilestoneProgressRepository : IUserMilestoneProgressRepository
    {
        private readonly AppDbContext _context;

        public UserMilestoneProgressRepository(AppDbContext context)
        {
            _context = context;
        }

        // Lấy tất cả tiến trình của người dùng
        public async Task<List<UserMilestoneProgress>> GetByUserIdAsync(int userId)
        {
            return await _context.UserMilestoneProgresses
                .Where(up => up.UserID == userId)
                .Include(up => up.Milestone)
                    .ThenInclude(m => m.PackageMilestones)
                .ToListAsync();
        }

        // Lấy tiến trình theo ID
        public async Task<UserMilestoneProgress> GetByIdAsync(int id)
        {
            return await _context.UserMilestoneProgresses
                .Include(up => up.Milestone)
                .FirstOrDefaultAsync(up => up.UserMilestoneID == id);
        }

        // Thêm tiến trình
        public async Task AddAsync(UserMilestoneProgress userMilestoneProgress)
        {
            await _context.UserMilestoneProgresses.AddAsync(userMilestoneProgress);
            await _context.SaveChangesAsync();
        }

        // Lấy theo milestoneId
        public async Task<IEnumerable<UserMilestoneProgress>> GetByMilestoneIdAsync(int milestoneId)
        {
            return await _context.UserMilestoneProgresses
                .Where(x => x.MilestoneID == milestoneId)
                .ToListAsync();
        }

        // Xoá nhiều bản ghi
        public void RemoveRange(IEnumerable<UserMilestoneProgress> items)
        {
            _context.UserMilestoneProgresses.RemoveRange(items);
        }
    }


}

