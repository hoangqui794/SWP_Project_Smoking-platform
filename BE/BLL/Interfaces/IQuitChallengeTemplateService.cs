using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface IQuitChallengeTemplateService
    {
        Task<List<QuitChallengeTemplate>> GetAllTemplatesAsync();
        Task CreateTemplateAsync(QuitChallengeTemplate template);
        Task<bool> UpdateTemplateAsync(int id, QuitChallengeTemplate updateTemplate);
        Task<bool> DeleteTemplateAsync(int id);
    }
}
