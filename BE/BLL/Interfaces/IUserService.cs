using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<User>> GetAllAsync();
        Task<User> GetByIdAsync(int id);
        Task<User> GetByEmailAsync(string email);
        Task<User> CreateAsync(User entity);
        Task<bool> UpdateAsync(User entity);
        Task<bool> DeleteAsync(int id);
        Task<User> AuthenticateAsync(string email, string password);

        // MỚI THÊM:
        Task DeleteUserByEmailAsync(string email);
        Task UpdateProfileAsync(string email, string fullName, string phoneNumber, string profilePicture, string description, string gender, DateTime? dateOfBirth);


        // Các phương thức mới
        Task<User> GetUserByEmailAsync(string email); // Lấy user theo email
        Task<IEnumerable<User>> GetAllUsersAsync(); // Lấy tất cả người dùng
        Task<IEnumerable<User>> GetUsersByRoleAsync(string role); // Lấy người dùng theo role
        Task<User> GetUserWithMembershipAsync(int userId);
        Task<int> CountUsersByRoleAsync(string roleName);

    }
}
