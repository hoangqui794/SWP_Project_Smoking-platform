using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Smoking.DAL.Entities;

namespace Smoking.DAL.Interfaces.Repositories
{
    public interface INotificationRepository : IGenericRepository<Notification>
    {
        Task<IQueryable<Notification>> GetAllWithUserAndRoleAsync();  // Trả về IQueryable để có thể sử dụng Include
        Task<Notification> GetByIdWithUserAndRoleAsync(int id);  // Trả về Notification với User và Role
        Task CreateNotificationAsync(Notification notification);
    }
}
