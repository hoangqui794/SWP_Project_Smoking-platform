using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    /// <summary>
    /// Interface cho ConsultationBooking, bổ sung GetByUserIdAsync và GetByCoachIdAsync
    /// </summary>
    public interface IConsultationBookingRepository : IGenericRepository<ConsultationBooking>
    {
        Task<IEnumerable<ConsultationBooking>> GetByUserIdAsync(int userId);
        Task<IEnumerable<ConsultationBooking>> GetByCoachIdAsync(int coachId);
        Task<int> CountByCoachIdAsync(int coachId);

    }
}
