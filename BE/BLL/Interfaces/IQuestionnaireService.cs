using Smoking.DAL.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface IQuestionnaireService
    {
        Task<List<Question>> GetAllQuestionsWithAnswersAsync();
        Task SaveUserAnswersAsync(int quitPlanId, List<QuitPlanSelectedAnswers> answers);
    }


}
