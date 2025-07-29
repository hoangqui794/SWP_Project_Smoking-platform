using Smoking.BLL.Interfaces;
using Smoking.DAL.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Smoking.DAL.Entities;

namespace Smoking.BLL.Services
{
    public class PackageMilestoneService : IPackageMilestoneService
    {
        private readonly IPackageMilestoneRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public PackageMilestoneService(IPackageMilestoneRepository repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<PackageMilestone>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<PackageMilestone?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(PackageMilestone entity)
        {
            await _repository.AddAsync(entity);
            await _unitOfWork.CompleteAsync();
        }

        public async Task UpdateAsync(int id, string newDescription)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing != null)
            {
                existing.DetailDescription = newDescription;
                _repository.Update(existing);
                await _unitOfWork.CompleteAsync();
            }
        }

        public async Task DeleteAsync(int id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing != null)
            {
                _repository.Delete(existing);
                await _unitOfWork.CompleteAsync();
            }
        }
    }

}
