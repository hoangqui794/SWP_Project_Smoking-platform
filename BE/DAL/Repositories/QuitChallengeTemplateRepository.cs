using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class QuitChallengeTemplateRepository : GenericRepository<QuitChallengeTemplate>, IQuitChallengeTemplateRepository
    {
        public QuitChallengeTemplateRepository(AppDbContext context) : base(context) { }

        public async Task<List<QuitChallengeTemplate>> GetAllTemplatesAsync()
        {
            return await _context.QuitChallengeTemplates.ToListAsync();
        }
    }


}
