using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IUnitOfWork _unitOfWork;

        public FeedbackService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Feedback> CreateAsync(Feedback entity)
        {
            await _unitOfWork.Feedbacks.AddAsync(entity);
            await _unitOfWork.CompleteAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _unitOfWork.Feedbacks.GetByIdAsync(id);
            if (existing == null)
                return false;

            _unitOfWork.Feedbacks.Remove(existing);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<IEnumerable<Feedback>> GetAllAsync()
        {
            return await _unitOfWork.Feedbacks.GetAllAsync();
        }

        public async Task<IEnumerable<Feedback>> GetAllWithUserAsync() 
        {
            return await _unitOfWork.Feedbacks.GetAllWithUserAsync();
        }

        public async Task<IEnumerable<Feedback>> GetByUserIdAsync(int userId)
        {
            return await _unitOfWork.Feedbacks.GetByUserIdAsync(userId);
        }

        public async Task<Feedback> GetByIdAsync(int id)
        {
            return await _unitOfWork.Feedbacks.GetByIdAsync(id);
        }

        public async Task<bool> UpdateAsync(Feedback entity)
        {
            var existing = await _unitOfWork.Feedbacks.GetByIdAsync(entity.FeedbackID);
            if (existing == null)
                return false;

            existing.UserID = entity.UserID;
            existing.FeedbackContent = entity.FeedbackContent;
            existing.Rating = entity.Rating;
            existing.FeedbackDate = entity.FeedbackDate;

            _unitOfWork.Feedbacks.Update(existing);
            await _unitOfWork.CompleteAsync();
            return true;
        }
        public async Task<Feedback?> GetByIdWithUserAsync(int id)
        {
            return await _unitOfWork.Feedbacks.GetByIdWithUserAsync(id);
        }

    }
}
