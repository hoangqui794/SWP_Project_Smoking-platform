using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> GetByEmailAndPasswordAsync(string email, string password)
        {
            return await _context.Users.
                Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == email && u.Password == password);
        }
        public async Task<IEnumerable<User>> GetAllWithRolesAsync()
        {
            return await _context.Users
                .Include(u => u.Role)
                .ToListAsync();
        }
        // Lấy người dùng theo role
        public async Task<IEnumerable<User>> GetByRoleAsync(string role)
        {
            return await _context.Users
                .Where(u => u.Role.RoleName == role) // Giả sử bạn có bảng Role với mối quan hệ với User
                .ToListAsync();
        }

        public async Task<User> GetByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.Role) // Load luôn thông tin Role
                .FirstOrDefaultAsync(u => u.UserID == id);
        }

        public async Task<User> GetUserWithMembershipAsync(int userId)
        {
            return await _context.Users
                .Include(u => u.Role)
                .Include(u => u.UserMemberships)
                    .ThenInclude(um => um.Package)
                .FirstOrDefaultAsync(u => u.UserID == userId);
        }
        public async Task<List<User>> GetUsersByRoleAsync(int roleId)
        {
            return await _context.Users
                .Where(u => u.RoleID == roleId && u.Status == "Active")
                .ToListAsync();
        }
        public async Task<User> GetByIdWithCoachAsync(int userId)
        {
            return await _context.Users
                .Include(u => u.Coach)
                .FirstOrDefaultAsync(u => u.UserID == userId);
        }
        public async Task<List<User>> GetUsersByCoachIdAsync(int coachId)
        {
            return await _context.Users
                .Where(u => u.CoachId == coachId)
                .ToListAsync();
        }

        public async Task<int> CountUsersByCoachIdAsync(int coachId)
        {
            return await _context.Users.CountAsync(u => u.CoachId == coachId);
        }
        public async Task<List<User>> GetUsersWithPendingCoachAsync()
        {
            return await _context.Users
                .Include(u => u.PendingCoach)
                .Where(u => u.PendingCoachId != null)
                .ToListAsync();
        }

        public async Task<int> CountByRoleNameAsync(string roleName)
        {
            return _context.Users
                .Count(u => u.Role.RoleName == roleName && u.Status == "Active");
        }
    }
}
