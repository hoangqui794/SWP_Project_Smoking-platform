using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class PaymentRepository : GenericRepository<Payment>, IPaymentRepository
    {
        private readonly AppDbContext _context;
        public PaymentRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Payment?> GetByTransactionReferenceAsync(string reference)
        {
            return await _context.Set<Payment>().FirstOrDefaultAsync(p => p.TransactionReference == reference);
        }

        public async Task UpdateAsync(Payment entity)
        {
            _context.Set<Payment>().Update(entity);
            await Task.CompletedTask; // hoặc bỏ nếu không cần async
        }

    }
}
