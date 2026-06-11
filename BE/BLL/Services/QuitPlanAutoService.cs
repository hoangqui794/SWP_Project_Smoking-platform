using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class QuitPlanAutoService : IQuitPlanAutoService
{
    private readonly IUnitOfWork _unitOfWork;

    public QuitPlanAutoService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<QuitPlan?> CreateAutoQuitPlanAsync(
        int userId,
        int cigarettesPerDay,
        decimal pricePerPack,
        int cigarettesPerPack,
        DateTime? startDate = null,
        int? targetDurationInMonths = null)
    {
        bool hasActivePlan = await _unitOfWork.QuitPlans
            .AnyAsync(x => x.UserID == userId && x.Status == "Active");

        if (hasActivePlan)
            return null;

        var start = startDate?.Date ?? DateTime.Today;
        DateTime? calculatedEndDate = null;

        if (targetDurationInMonths.HasValue && targetDurationInMonths.Value > 0)
        {
            calculatedEndDate = start.AddMonths(targetDurationInMonths.Value);
        }

        int totalPlanDays = (calculatedEndDate.HasValue)
            ? (calculatedEndDate.Value - start).Days + 1
            : 7;

        if (totalPlanDays <= 0)
            totalPlanDays = 7;

        string[] tips =
        {
            "T?p trung nh?n bi?t con thèm thu?c, ghi l?i th?i di?m thèm nh?t.",
            "Thay 1 l?n hút b?ng vi?c u?ng nu?c ho?c di d?o.",
            "B?t d?u tránh hút vào bu?i sáng.",
            "Th? thay th? thu?c b?ng k?o cao su ho?c trái cây khô.",
            "Ghi l?i c?m xúc m?i l?n mu?n hút d? hi?u b?n thân.",
            "Tang v?n d?ng nh? nhu di b? bu?i sáng.",
            "T? thu?ng cho mình n?u hoàn thành k? ho?ch hôm nay."
        };

        var dailyPlan = new List<string>();
        for (int day = 1; day <= totalPlanDays; day++)
        {
            int targetCigarettes = cigarettesPerDay - (day - 1);
            if (targetCigarettes < 0) targetCigarettes = 0;

            string tip = tips[(day - 1) % tips.Length];
            dailyPlan.Add($"Ngày {day}: Hút {targetCigarettes} di?u – {tip}");
        }

        var planDetails = string.Join(Environment.NewLine, dailyPlan);

        var newPlan = new QuitPlan
        {
            UserID = userId,
            CigarettesPerDayAtStart = cigarettesPerDay,
            PricePerPackAtStart = pricePerPack,
            CigarettesPerPack = cigarettesPerPack,
            StartDate = start,
            EndDate = calculatedEndDate,
            Reason = "T? d?ng l?p k? ho?ch",
            PlanDetails = planDetails,
            Status = "Active",
            CreatedDate = DateTime.UtcNow
        };

        await _unitOfWork.QuitPlans.AddAsync(newPlan);
        var result = await _unitOfWork.CompleteAsync();

        if (result <= 0)
            return null;

        var quitProgress = new QuitProgress
        {
            QuitPlanID = newPlan.QuitPlanID,
            ProgressDate = start,
            CigarettesPerDayBaseline = cigarettesPerDay,
            MoneySaved = 0,
            Notes = "B?t d?u k? ho?ch",
            LastSmokeDate = start
        };

        await _unitOfWork.QuitProgresses.AddAsync(quitProgress);
        await _unitOfWork.CompleteAsync();

        return newPlan;
    }
}
