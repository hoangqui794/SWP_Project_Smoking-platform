using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    public class QuestionnaireService : IQuestionnaireService
    {
        private readonly IUnitOfWork _unitOfWork;

        public QuestionnaireService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<Question>> GetAllQuestionsWithAnswersAsync()
        {
            return await _unitOfWork.Questions.GetQuestionsWithAnswersAsync();
        }

        public async Task SaveUserAnswersAsync(int quitPlanId, List<QuitPlanSelectedAnswers> answers)
        {
            foreach (var answer in answers)
            {
                answer.QuitPlanID = quitPlanId; // đảm bảo luôn đúng kế hoạch đang xử lý
                await _unitOfWork.QuitPlanSelectedAnswers.AddAsync(answer);
            }

            await _unitOfWork.CompleteAsync();
        }
    }

}
