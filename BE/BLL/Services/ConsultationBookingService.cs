using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    public class ConsultationBookingService : IConsultationBookingService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ConsultationBookingService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ConsultationBooking> CreateAsync(ConsultationBooking entity)
        {
            await _unitOfWork.ConsultationBookings.AddAsync(entity);
            await _unitOfWork.CompleteAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _unitOfWork.ConsultationBookings.GetByIdAsync(id);
            if (existing == null)
                return false;

            _unitOfWork.ConsultationBookings.Remove(existing);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<IEnumerable<ConsultationBooking>> GetAllAsync()
        {
            return await _unitOfWork.ConsultationBookings.GetAllAsync();
        }

        public async Task<IEnumerable<ConsultationBooking>> GetByCoachIdAsync(int coachId)
        {
            return await _unitOfWork.ConsultationBookings.GetByCoachIdAsync(coachId);
        }

        public async Task<IEnumerable<ConsultationBooking>> GetByUserIdAsync(int userId)
        {
            return await _unitOfWork.ConsultationBookings.GetByUserIdAsync(userId);
        }

        public async Task<ConsultationBooking> GetByIdAsync(int id)
        {
            return await _unitOfWork.ConsultationBookings.GetByIdAsync(id);
        }

        public async Task<bool> UpdateAsync(ConsultationBooking entity)
        {
            var existing = await _unitOfWork.ConsultationBookings.GetByIdAsync(entity.BookingID);
            if (existing == null)
                return false;

            existing.UserID = entity.UserID;
            existing.CoachID = entity.CoachID;
            existing.BookingDate = entity.BookingDate;
            existing.Duration = entity.Duration;
            existing.Status = entity.Status;
            existing.MeetingLink = entity.MeetingLink;
            existing.Notes = entity.Notes;
            existing.CoachNotes = entity.CoachNotes;
            existing.PreferredLanguage = entity.PreferredLanguage;
            existing.ReminderSent = entity.ReminderSent;
            // CreatedDate giữ nguyên

            _unitOfWork.ConsultationBookings.Update(existing);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
