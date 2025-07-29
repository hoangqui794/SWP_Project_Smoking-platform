using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Interfaces
{
    public interface IBlogService
    {
        // --- ADMIN FUNCTIONALITY ---
        Task<IEnumerable<Blog>> GetAllWithUserAndRoleAsync();
        Task<IEnumerable<Blog>> GetAllByStatusWithUserAndRoleAsync(string status);
        Task<IEnumerable<Blog>> GetAllReportedWithUserAndRoleAsync();
        Task<int> CountAllAsync();
        Task<int> CountByStatusAsync(string status);
        Task<int> CountReportedAsync();
        Task<bool> ApproveBlogAsync(int blogId);
        Task<bool> RejectBlogAsync(int blogId);
        Task<bool> MarkBlogAsReviewedAsync(int blogId);
        Task<bool> DeleteAsync(int blogId);
        Task<Blog> CreateByAdminAsync(Blog blog);
        Task<IEnumerable<Blog>> GetAllPublishedAsync();




        // --- USER FUNCTIONALITY ---
        Task<IEnumerable<Blog>> GetAllByUserIdAsync(int userId);
        Task<Blog> GetByIdAsync(int blogId);
        Task<Blog> CreateByUserAsync(Blog blog);
        Task<bool> UpdateAsync(Blog blog);
        Task<int> CountAllByUserAsync(int userId);
        Task<int> CountByUserAndStatusAsync(int userId, string status);
        Task<bool> ReportBlogAsync(int blogId);
        Task<bool> ToggleReactionAsync(int blogId, int userId, bool isLike);
        Task<int> CountLikesAsync(int blogId);
        Task<int> CountDislikesAsync(int blogId);
        Task<bool?> GetUserReactionAsync(int blogId, int userId);
        Task<(int Likes, int Dislikes)> GetReactionCountAsync(int blogId);


    }
}
