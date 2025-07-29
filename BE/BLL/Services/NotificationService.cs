using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public NotificationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // Lấy tất cả thông báo và bao gồm thông tin User và Role
        public async Task<IEnumerable<Notification>> GetAllAsync()
        {
            var notifications = await _unitOfWork.DbContext.Notifications
                .Include(n => n.User)           // Bao gồm thông tin User
                .ThenInclude(u => u.Role)       // Bao gồm Role của User
                .ToListAsync();                 // Trả về danh sách thông báo

            return notifications.Select(n => new Notification
            {
                NotificationID = n.NotificationID,
                UserID = n.UserID,
                Message = n.Message,
                NotificationDate = n.NotificationDate,
                NotificationType = n.NotificationType,
                SentAt = n.SentAt,
                NotificationName = n.NotificationName ?? "Default Notification",  // Đảm bảo không NULL
                Condition = n.Condition ?? "Pending",                              // Đảm bảo không NULL
                NotificationFor = n.NotificationFor ?? "All Users",                // Đảm bảo không NULL
                CreatedBy = n.CreatedBy ?? "System"                                // Đảm bảo không NULL
            }).ToList();
        }


        // Lấy thông báo theo ID
        public async Task<Notification> GetByIdAsync(int id)
        {
            var notification = await _unitOfWork.DbContext.Notifications
                .Include(n => n.User)
                .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(n => n.NotificationID == id);

            if (notification == null) return null;

            return new Notification
            {
                NotificationID = notification.NotificationID,
                UserID = notification.UserID,
                Message = notification.Message,
                NotificationDate = notification.NotificationDate,
                NotificationType = notification.NotificationType,
                SentAt = notification.SentAt,
                NotificationName = notification.NotificationName ?? "Default Notification",  // Đảm bảo không NULL
                IsRead = notification.IsRead,  // Thêm trường IsRead
                ReadAt = notification.ReadAt,  // Thêm trường ReadAt
                                               // 
                User = notification.User != null ? new User
                {
                    UserID = notification.User.UserID,
                    FullName = notification.User.FullName ?? "Unknown",  // Default value if null
                    Role = notification.User.Role != null ? new Role
                    {
                        RoleID = notification.User.Role.RoleID,
                        RoleName = notification.User.Role.RoleName ?? "Unknown"  // Default value if null
                    } : null
                } : null
            };
        }

        // Lấy thông báo theo UserID
        public async Task<IEnumerable<Notification>> GetByUserIdAsync(int userId)
        {
            var notifications = await _unitOfWork.DbContext.Notifications
                .Where(n => n.UserID == userId)
                .Include(n => n.User)
                .ThenInclude(u => u.Role)
                .ToListAsync();

            return notifications.Select(n => new Notification
            {
                NotificationID = n.NotificationID,
                UserID = n.UserID,
                Message = n.Message,
                NotificationDate = n.NotificationDate,
                NotificationType = n.NotificationType,
                NotificationName = n.NotificationName ?? "Default Notification",  // Đảm bảo không NULL
                SentAt = n.SentAt,
                IsRead = n.IsRead,  // Thêm trường IsRead
                ReadAt = n.ReadAt,  // Thêm trường ReadAt
                User = n.User != null ? new User
                {
                    UserID = n.User.UserID,
                    FullName = n.User.FullName ?? "Unknown",  // Default value if null
                    Role = n.User.Role != null ? new Role
                    {
                        RoleID = n.User.Role.RoleID,
                        RoleName = n.User.Role.RoleName ?? "Unknown"  // Default value if null
                    } : null
                } : null
            }).ToList();
        }

        // Tạo mới thông báo
        public async Task<Notification> CreateAsync(Notification entity)
        {
            await _unitOfWork.DbContext.Notifications.AddAsync(entity);
            await _unitOfWork.CompleteAsync();
            return entity;
        }

        // Cập nhật thông báo
        public async Task<bool> UpdateAsync(Notification entity)
        {
            var existing = await _unitOfWork.DbContext.Notifications.FindAsync(entity.NotificationID);
            if (existing == null) return false;

            existing.UserID = entity.UserID;
            existing.Message = entity.Message;
            existing.NotificationDate = entity.NotificationDate;
            existing.NotificationType = entity.NotificationType;

            existing.IsRead = entity.IsRead;  // Đánh dấu đã đọc
            existing.ReadAt = entity.ReadAt;  // Cập nhật thời gian đã đọc


            _unitOfWork.DbContext.Notifications.Update(existing);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        // Xóa thông báo
        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _unitOfWork.DbContext.Notifications.FindAsync(id);
            if (existing == null) return false;

            _unitOfWork.DbContext.Notifications.Remove(existing);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        // Đánh dấu thông báo đã đọc
        public async Task<bool> MarkAsReadAsync(int notificationId)
        {
            var notification = await _unitOfWork.DbContext.Notifications.FindAsync(notificationId);
            if (notification == null)
                return false;

            // Đánh dấu là đã đọc
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;  // Ghi lại thời gian đã đọc

            await _unitOfWork.DbContext.SaveChangesAsync(); // Lưu thay đổi vào cơ sở dữ liệu
            return true;
        }


    }
}
