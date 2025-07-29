using Smoking.BLL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface IRevenueService
    {
        Task<decimal> GetMonthlyRevenueAsync(int year, int month);
        Task<IEnumerable<MonthlyRevenueDto>> GetRevenueByMonthRangeAsync(int year);
    }

}
