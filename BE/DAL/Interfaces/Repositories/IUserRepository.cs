using Smoking.DAL.Entities;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User> GetByEmailAsync(string email);
        Task<User> GetByEmailAndPasswordAsync(string email, string password);
        Task<IEnumerable<User>> GetAllWithRolesAsync();
        // Thêm phương thức GetByRoleAsync để lấy người dùng theo role
        Task<IEnumerable<User>> GetByRoleAsync(string role); // Lấy người dùng theo role
        Task<User> GetByIdAsync(int id);
        Task<User> GetUserWithMembershipAsync(int userId);
        Task<List<User>> GetUsersByRoleAsync(int roleId);
        Task<User> GetByIdWithCoachAsync(int userId);
        Task<List<User>> GetUsersByCoachIdAsync(int coachId);
        Task<int> CountUsersByCoachIdAsync(int coachId);
        Task<List<User>> GetUsersWithPendingCoachAsync();
        Task<int> CountByRoleNameAsync(string roleName);


    }
}
