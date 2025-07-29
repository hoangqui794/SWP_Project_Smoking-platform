using Smoking.DAL.Entities;  

namespace Smoking.API.Models.User
{
    public class BlogReport
    {
        public int BlogReportId { get; set; }  
        public int BlogId { get; set; }        
        public int UserId { get; set; }     
        public DateTime ReportDate { get; set; }
        public string Reason { get; set; } 

        // Tham chiếu đến Blog và User
        public Blog Blog { get; set; } 
        public Smoking.DAL.Entities.User User { get; set; } 
    }
}