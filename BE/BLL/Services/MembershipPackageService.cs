using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    public class MembershipPackageService : IMembershipPackageService
    {
        private readonly IUnitOfWork _unitOfWork;
        public MembershipPackageService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<MembershipPackage>> GetAllAsync()
            => await _unitOfWork.MembershipPackages.GetAllAsync();

        public async Task<MembershipPackage?> GetByIdAsync(int id)
            => await _unitOfWork.MembershipPackages.GetByIdAsync(id);
    }

}
