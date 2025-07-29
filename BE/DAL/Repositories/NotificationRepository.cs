using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
    {
        public NotificationRepository(AppDbContext context) : base(context) { }

        // Trả về IQueryable để có thể áp dụng Where, Include, v.v.
        public async Task<IQueryable<Notification>> GetAllWithUserAndRoleAsync()
        {
            return _context.Notifications
                .Include(n => n.User)           // Bao gồm thông tin User
                .ThenInclude(u => u.Role);      // Bao gồm Role của User
        }

        // Lấy Notification theo ID với thông tin User và Role
        public async Task<Notification> GetByIdWithUserAndRoleAsync(int id)
        {
            return await _context.Notifications
                .Include(n => n.User)
                .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(n => n.NotificationID == id);
        }

        // Tạo mới một Notification
        public async Task CreateNotificationAsync(Notification notification)
        {
            await _context.Notifications.AddAsync(notification);
        }

        // Cập nhật thông tin Notification
        public async Task Update(Notification entity)
        {
            _context.Notifications.Update(entity); // This ensures that your notification gets updated
            await _context.SaveChangesAsync(); // Commit the changes to DB
        }


        // Xóa Notification
        public async Task Remove(Notification entity)
        {
            _context.Notifications.Remove(entity); // Xóa Notification
            await _context.SaveChangesAsync(); // Lưu thay đổi vào cơ sở dữ liệu
        }

        // Cập nhật trạng thái thông báo đã đọc
        public async Task UpdateAsync(Notification notification)
        {
            _context.Notifications.Update(notification);
            await _context.SaveChangesAsync();
        }
    }
}
