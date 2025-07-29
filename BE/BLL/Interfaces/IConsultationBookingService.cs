using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface IConsultationBookingService
    {
        Task<IEnumerable<ConsultationBooking>> GetAllAsync();
        Task<ConsultationBooking> GetByIdAsync(int id);
        Task<IEnumerable<ConsultationBooking>> GetByUserIdAsync(int userId);
        Task<IEnumerable<ConsultationBooking>> GetByCoachIdAsync(int coachId);
        Task<ConsultationBooking> CreateAsync(ConsultationBooking entity);
        Task<bool> UpdateAsync(ConsultationBooking entity);
        Task<bool> DeleteAsync(int id);
    }
}
