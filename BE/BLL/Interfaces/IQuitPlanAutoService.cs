using Smoking.DAL.Entities;
using System;
using System.Threading.Tasks;

public interface IQuitPlanAutoService
{
    Task<QuitPlan?> CreateAutoQuitPlanAsync(
        int userId,
        int cigarettesPerDay,
        decimal pricePerPack,
        int cigarettesPerPack,
        DateTime? startDate = null,
        int? targetDurationInMonths = null
    );
}
