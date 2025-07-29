using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class UserMembershipRepository : GenericRepository<UserMembership>, IUserMembershipRepository
    {
        private readonly AppDbContext _context;
        public UserMembershipRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<UserMembership?> GetActiveByUserIdAsync(int userId)
        {
            return await _context.Set<UserMembership>()
                .FirstOrDefaultAsync(x => x.UserID == userId && x.PaymentStatus == "Completed" && x.EndDate > DateTime.UtcNow);
        }

        public async Task UpdateAsync(UserMembership entity)
        {
            _context.Set<UserMembership>().Update(entity);
            await Task.CompletedTask;
        }
        public async Task<UserMembership> GetLatestValidMembershipByUserIdAsync(int userId)
        {
            return await _context.UserMemberships
                .Include(m => m.Package)
                .Where(m => m.UserID == userId &&
                            m.EndDate >= DateTime.Now &&
                            m.PaymentStatus == "Completed")
                .OrderByDescending(m => m.EndDate)
                .FirstOrDefaultAsync();
        }


    }
}
