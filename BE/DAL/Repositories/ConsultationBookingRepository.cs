using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class ConsultationBookingRepository : GenericRepository<ConsultationBooking>, IConsultationBookingRepository
    {
        public ConsultationBookingRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<ConsultationBooking>> GetByUserIdAsync(int userId)
        {
            return await _context.ConsultationBookings
                                 .Include(cb => cb.Coach)
                                 .Where(cb => cb.UserID == userId)
                                 .AsNoTracking()
                                 .ToListAsync();
        }

        public async Task<IEnumerable<ConsultationBooking>> GetByCoachIdAsync(int coachId)
        {
            return await _context.ConsultationBookings
                                 .Include(cb => cb.User)
                                 .Where(cb => cb.CoachID == coachId)
                                 .AsNoTracking()
                                 .ToListAsync();
        }

        public async Task<int> CountByCoachIdAsync(int coachId)
        {
            return await _context.ConsultationBookings
                                 .CountAsync(cb => cb.CoachID == coachId);
        }

    }
}
