using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    public class UserMilestoneProgressService : IUserMilestoneProgressService
    {
        private readonly IUserMilestoneProgressRepository _repository;

        public UserMilestoneProgressService(IUserMilestoneProgressRepository repository)
        {
            _repository = repository;
        }

        // Lấy tất cả tiến trình của người dùng
        public async Task<List<UserMilestoneProgress>> GetAllByUserIdAsync(int userId)
        {
            // Sử dụng repository để lấy dữ liệu, không cần _context nữa
            return await _repository.GetByUserIdAsync(userId);
        }

        // Lấy tiến trình theo ID
        public async Task<UserMilestoneProgress> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        // Thêm tiến trình vào cơ sở dữ liệu
        public async Task AddAsync(UserMilestoneProgress userMilestoneProgress)
        {
            await _repository.AddAsync(userMilestoneProgress);
        }
    }
}
