using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    public class QuitProgressService : IQuitProgressService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAchievementEvaluatorService _achievementEvaluatorService;

        public QuitProgressService(IUnitOfWork unitOfWork, IAchievementEvaluatorService achievementEvaluatorService)
        {
            _unitOfWork = unitOfWork;
            _achievementEvaluatorService = achievementEvaluatorService;
        }

        public async Task<IEnumerable<QuitProgress>> GetByPlanIdAsync(int quitPlanId)
        {
            return await _unitOfWork.QuitProgresses.FindAsync(x => x.QuitPlanID == quitPlanId);
        }

        public async Task<QuitProgress> GetByDateAsync(int quitPlanId, DateTime progressDate)
        {
            return await _unitOfWork.QuitProgresses.FindFirstOrDefaultAsync(x => x.QuitPlanID == quitPlanId && x.ProgressDate == progressDate);
        }

        public async Task<bool> UpdateQuitProgressAsync(int quitPlanId, DateTime progressDate, int cigarettesSmokedToday, decimal pricePerPack, int cigarettesPerPack)
        {
            var quitPlan = await _unitOfWork.QuitPlans.GetByIdAsync(quitPlanId);
            if (quitPlan == null) return false;

            decimal pricePerCigarette = pricePerPack / cigarettesPerPack;
            int cigarettesPerDayAtStart = quitPlan.CigarettesPerDayAtStart;
            int cigarettesDropped = cigarettesPerDayAtStart - cigarettesSmokedToday;
            decimal moneySaved = (cigarettesDropped > 0) ? cigarettesDropped * pricePerCigarette : 0;

            var quitProgress = await _unitOfWork.QuitProgresses.FindFirstOrDefaultAsync(x => x.QuitPlanID == quitPlanId && x.ProgressDate == progressDate);

            if (quitProgress != null)
            {
                quitProgress.CigarettesSmokedToday = cigarettesSmokedToday;
                quitProgress.CigarettesDropped = cigarettesDropped;
                quitProgress.MoneySaved = moneySaved;
                quitProgress.LastSmokeDate = progressDate;
                quitProgress.CigarettesPerDayBaseline = cigarettesPerDayAtStart;
                quitProgress.Notes = "Đã cập nhật tiến trình";

                _unitOfWork.QuitProgresses.Update(quitProgress);
            }
            else
            {
                quitProgress = new QuitProgress
                {
                    QuitPlanID = quitPlanId,
                    ProgressDate = progressDate,
                    CigarettesSmokedToday = cigarettesSmokedToday,
                    CigarettesDropped = cigarettesDropped,
                    MoneySaved = moneySaved,
                    LastSmokeDate = progressDate,
                    CigarettesPerDayBaseline = cigarettesPerDayAtStart,
                    Notes = "Tiến trình mới"
                };

                await _unitOfWork.QuitProgresses.AddAsync(quitProgress);
            }

            var result = await _unitOfWork.CompleteAsync();

            if (result > 0)
            {
                var previousProgresses = await _unitOfWork.QuitProgresses.FindAsync(x => x.QuitPlanID == quitPlanId && x.ProgressDate < progressDate);
                int totalCigsDroppedBefore = previousProgresses.Sum(p => p.CigarettesDropped ?? 0);
                decimal totalMoneySavedBefore = previousProgresses.Sum(p => p.MoneySaved);

                quitProgress.TotalCigarettesDropped = totalCigsDroppedBefore + cigarettesDropped;
                quitProgress.TotalMoneySaved = totalMoneySavedBefore + moneySaved;

                _unitOfWork.QuitProgresses.Update(quitProgress);
                await _unitOfWork.CompleteAsync();

                // 🔥 Gọi kiểm tra & trao thành tựu
                await _achievementEvaluatorService.EvaluateAndGrantAchievementsAsync(quitPlan.UserID);
            }

            return true;
        }

        public async Task<bool> DeleteProgressAsync(int progressId)
        {
            var quitProgress = await _unitOfWork.QuitProgresses.GetByIdAsync(progressId);
            if (quitProgress == null) return false;

            _unitOfWork.QuitProgresses.Remove(quitProgress);
            var result = await _unitOfWork.CompleteAsync();

            return result > 0;
        }
    }
}
