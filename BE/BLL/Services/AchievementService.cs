using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    public class AchievementService : IAchievementService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AchievementService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Achievement>> GetAllAsync()
        {
            return await _unitOfWork.Achievements.GetAllAsync();
        }

        public async Task<Achievement> GetByIdAsync(int id)
        {
            return await _unitOfWork.Achievements.GetByIdAsync(id);
        }

        public async Task<Achievement> CreateAsync(Achievement entity)
        {
            await _unitOfWork.Achievements.AddAsync(entity);
            await _unitOfWork.CompleteAsync();
            return entity;
        }

        public async Task<bool> UpdateAsync(Achievement entity)
        {
            var existingAchievement = await _unitOfWork.Achievements.GetByIdAsync(entity.AchievementID);
            if (existingAchievement == null) return false;

            existingAchievement.AchievementName = entity.AchievementName;
            existingAchievement.Description = entity.Description;
            existingAchievement.Criteria = entity.Criteria;
            existingAchievement.BadgeImage = entity.BadgeImage;
            existingAchievement.PackageType = entity.PackageType;
            existingAchievement.SmokeFreeDaysRequired = entity.SmokeFreeDaysRequired;
            existingAchievement.MoneySavedRequired = entity.MoneySavedRequired;
            existingAchievement.CigarettesDroppedRequired = entity.CigarettesDroppedRequired;

            _unitOfWork.Achievements.Update(existingAchievement);
            await _unitOfWork.CompleteAsync();
            return true;
        }


        public async Task<bool> DeleteAsync(int id)
        {
            var achievement = await _unitOfWork.Achievements.GetByIdAsync(id);
            if (achievement == null) return false;

            _unitOfWork.Achievements.Remove(achievement);
            await _unitOfWork.CompleteAsync();
            return true;
        }
        public async Task<IEnumerable<Achievement>> SearchAsync(string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                return await _unitOfWork.Achievements.GetAllAsync();

            return await _unitOfWork.Achievements.FindAsync(x =>
                x.AchievementName.ToLower().Contains(keyword.ToLower()) ||
                x.Description.ToLower().Contains(keyword.ToLower()));
        }


    }
}