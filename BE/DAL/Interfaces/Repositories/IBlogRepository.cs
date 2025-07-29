using Smoking.DAL.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    /// <summary>
    /// Repository pattern cho Blog (quản lý cho cả Admin và User)
    /// </summary>
    public interface IBlogRepository
    {
        // ================= ADMIN =================
        Task<IEnumerable<Blog>> GetAllWithUserAndRoleAsync();
        Task<IEnumerable<Blog>> GetAllByStatusWithUserAndRoleAsync(string status);
        Task<IEnumerable<Blog>> GetAllReportedWithUserAndRoleAsync();
        Task<int> CountByStatusAsync(string status);
        Task<int> CountReportedAsync();
        Task<int> CountAllAsync();
        Task<Blog> GetByIdWithUserAndRoleAsync(int id);

        // ================= USER =================
        Task<IEnumerable<Blog>> GetAllByUserIdAsync(int userId);
        Task<Blog> GetByIdAsync(int blogId);
        Task<int> CountAllByUserAsync(int userId);
        Task<int> CountByUserAndStatusAsync(int userId, string status);
        Task<IEnumerable<Blog>> GetByAuthorIdWithUserAndRoleAsync(int authorId);
        Task<IEnumerable<Blog>> GetAllPublishedWithUserAndRoleAsync();

        // ================= Reaction =================
        Task<BlogReaction?> GetReactionAsync(int blogId, int userId);
        Task AddReactionAsync(BlogReaction reaction);
        void UpdateReaction(BlogReaction reaction);
        Task<int> CountReactionsAsync(int blogId, bool isLike);


        // ================= COMMON =================
        Task AddAsync(Blog blog);
        void Update(Blog blog);
        void Delete(Blog blog);
        Task SaveChangesAsync();
        // Tăng like/dislike truyền thống (nếu vẫn dùng song song)
        Task<bool> IncrementLikeAsync(int blogId);
        Task<bool> IncrementDislikeAsync(int blogId);
    }
}