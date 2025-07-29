using Smoking.DAL.Entities;

namespace Smoking.DAL.Interfaces.Repositories
{
    public interface IPaymentRepository : IGenericRepository<Payment>
    {
        Task<Payment?> GetByTransactionReferenceAsync(string reference);
        Task UpdateAsync(Payment entity);
    }

}
