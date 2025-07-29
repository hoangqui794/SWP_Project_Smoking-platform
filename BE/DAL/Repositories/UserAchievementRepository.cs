using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class UserAchievementRepository : GenericRepository<UserAchievement>, IUserAchievementRepository
    {
        public UserAchievementRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<UserAchievement>> GetByUserIdAsync(int userId)
        {
            return await _context.UserAchievements
                .Where(ua => ua.UserID == userId)
                .Include(ua => ua.Achievement)  // Include related Achievement data
                .ToListAsync();
        }

        public async Task<bool> CheckIfAchievementGrantedAsync(int userId, int achievementId)
        {
            return await _context.UserAchievements
                .AnyAsync(ua => ua.UserID == userId && ua.AchievementID == achievementId);
        }

        // Phương thức Update (cập nhật thông tin thành tích người dùng)
        public async Task Update(UserAchievement entity)
        {
            _context.UserAchievements.Update(entity);
            await _context.SaveChangesAsync();
        }

        // Phương thức Remove (xóa thành tích của người dùng)
        public async Task Remove(UserAchievement entity)
        {
            _context.UserAchievements.Remove(entity);
            await _context.SaveChangesAsync();
        }
        public async Task<IEnumerable<UserAchievement>> GetAllWithUserAndAchievementAsync()
        {
            return await _context.UserAchievements
                .Include(ua => ua.User)
                .Include(ua => ua.Achievement)
                .ToListAsync();
        }

    }
}
