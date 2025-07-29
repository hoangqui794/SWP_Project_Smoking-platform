using Smoking.BLL.Models;
using Smoking.BLL.Interfaces;
using Smoking.DAL.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class RevenueService : IRevenueService
{
    private readonly IUnitOfWork _unitOfWork;

    public RevenueService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    // ✅ Lấy doanh thu của một tháng cụ thể
    public async Task<decimal> GetMonthlyRevenueAsync(int year, int month)
    {
        var payments = await _unitOfWork.Payments.FindAsync(p =>
            p.PaymentDate.Year == year &&
            p.PaymentDate.Month == month &&
            p.Status == "Success"
        );

        return payments?.Sum(p => p.Amount) ?? 0;
    }

    public async Task<IEnumerable<MonthlyRevenueDto>> GetRevenueByMonthRangeAsync(int year)
    {
        var payments = (await _unitOfWork.Payments.FindAsync(p =>
            p.PaymentDate.Year == year &&
            p.Status == "Success"
        )).ToList();

        var grouped = payments
            .GroupBy(p => p.PaymentDate.Month)
            .Select(g => new MonthlyRevenueDto
            {
                Month = g.Key,
                TotalRevenue = g.Sum(p => p.Amount),
                TotalTransactions = g.Count()
            })
            .OrderBy(x => x.Month)
            .ToList();

        return grouped;
    }
}
