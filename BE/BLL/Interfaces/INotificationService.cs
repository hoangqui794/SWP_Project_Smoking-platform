using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<Notification>> GetAllAsync(); // Lấy tất cả thông báo
        Task<Notification> GetByIdAsync(int id); // Lấy thông báo theo ID
        Task<IEnumerable<Notification>> GetByUserIdAsync(int userId); // Lấy thông báo theo UserID
        Task<Notification> CreateAsync(Notification entity); // Tạo mới thông báo
        Task<bool> UpdateAsync(Notification entity); // Cập nhật thông báo
        Task<bool> DeleteAsync(int id); // Xóa thông báo
    }
}
