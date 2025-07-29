using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;

namespace Smoking.DAL.Repositories
{
    public class AnswerOptionRepository : GenericRepository<AnswerOption>, IAnswerOptionRepository
    {
        public AnswerOptionRepository(AppDbContext context) : base(context) { }
    }
}
