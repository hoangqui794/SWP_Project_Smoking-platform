using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    public class UserMembershipService : IUserMembershipService
    {
        private readonly IUnitOfWork _unitOfWork;
        public UserMembershipService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<UserMembership> CreateOrUpdateMembershipAsync(int userId, int packageId)
        {
            var now = DateTime.UtcNow;
            var package = await _unitOfWork.MembershipPackages.GetByIdAsync(packageId);
            if (package == null) throw new Exception("Gói không t?n t?i");

            var end = package.Duration > 0
            ? now.AddMonths(package.Duration)
            : DateTime.MaxValue;


            var current = await _unitOfWork.UserMemberships.GetActiveByUserIdAsync(userId);

            if (current != null)
            {
                current.PackageID = packageId;
                current.StartDate = now;
                current.EndDate = end;
                current.PaymentStatus = "Completed";
                await _unitOfWork.UserMemberships.UpdateAsync(current);
                await _unitOfWork.CompleteAsync();
                return current;
            }

            var newMembership = new UserMembership
            {
                UserID = userId,
                PackageID = packageId,
                StartDate = now,
                EndDate = end,
                PaymentStatus = "Completed"
            };
            await _unitOfWork.UserMemberships.AddAsync(newMembership);
            await _unitOfWork.CompleteAsync();
            return newMembership;
        }

        public async Task<UserMembership?> GetActiveByUserIdAsync(int userId)
        {
            return await _unitOfWork.UserMemberships.GetActiveByUserIdAsync(userId);
        }


    }

}
