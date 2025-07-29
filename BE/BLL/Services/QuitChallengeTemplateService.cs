using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    public class QuitChallengeTemplateService : IQuitChallengeTemplateService
    {
        private readonly IUnitOfWork _unitOfWork;

        public QuitChallengeTemplateService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<QuitChallengeTemplate>> GetAllTemplatesAsync()
        {
            return await _unitOfWork.QuitChallengeTemplates.GetAllTemplatesAsync();
        }

        public async Task CreateTemplateAsync(QuitChallengeTemplate template)
        {
            await _unitOfWork.QuitChallengeTemplates.AddAsync(template);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<bool> UpdateTemplateAsync(int id, QuitChallengeTemplate updatedTemplate)
        {
            var existing = await _unitOfWork.QuitChallengeTemplates.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Title = updatedTemplate.Title;
            existing.Description = updatedTemplate.Description;
            existing.NotesSuggestion = updatedTemplate.NotesSuggestion;
            existing.Stage = updatedTemplate.Stage;
            existing.StageTitle = updatedTemplate.StageTitle;

            _unitOfWork.QuitChallengeTemplates.Update(existing);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<bool> DeleteTemplateAsync(int id)
        {
            var existing = await _unitOfWork.QuitChallengeTemplates.GetByIdAsync(id);
            if (existing == null) return false;

            _unitOfWork.QuitChallengeTemplates.Remove(existing);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
