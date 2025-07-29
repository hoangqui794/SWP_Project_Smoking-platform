using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    public class SmokingStatusService : ISmokingStatusService
    {
        private readonly IUnitOfWork _unitOfWork;

        public SmokingStatusService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<SmokingStatus> CreateAsync(SmokingStatus entity)
        {
            await _unitOfWork.SmokingStatuses.AddAsync(entity);
            await _unitOfWork.CompleteAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _unitOfWork.SmokingStatuses.GetByIdAsync(id);
            if (existing == null)
                return false;

            _unitOfWork.SmokingStatuses.Remove(existing);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<IEnumerable<SmokingStatus>> GetAllAsync()
        {
            return await _unitOfWork.SmokingStatuses.GetAllAsync();
        }

        public async Task<IEnumerable<SmokingStatus>> GetByUserIdAsync(int userId)
        {
            return await _unitOfWork.SmokingStatuses.GetByUserIdAsync(userId);
        }

        public async Task<SmokingStatus> GetByIdAsync(int id)
        {
            return await _unitOfWork.SmokingStatuses.GetByIdAsync(id);
        }

        public async Task<bool> UpdateAsync(SmokingStatus entity)
        {
            var existing = await _unitOfWork.SmokingStatuses.GetByIdAsync(entity.SmokingStatusID);
            if (existing == null)
                return false;

            existing.CigarettesPerDay = entity.CigarettesPerDay;
            existing.MonthlyCost = entity.MonthlyCost;
            existing.PricePerPack = entity.PricePerPack;
            existing.LastUpdated = entity.LastUpdated;

            _unitOfWork.SmokingStatuses.Update(existing);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
