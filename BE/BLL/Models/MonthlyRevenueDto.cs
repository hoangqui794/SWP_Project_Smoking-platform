using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Smoking.BLL.Models
{
    public class MonthlyRevenueDto
    {
        public int Month { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalTransactions { get; set; }
    }

}
