using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    /// <summary>
    /// X? lý nghi?p v? blog cho Admin và User
    /// </summary>
    public class BlogService : IBlogService
    {
        private readonly IBlogRepository _repo;
        public BlogService(IBlogRepository repo) => _repo = repo;

        // ================= ADMIN =================

        // L?y toàn b? blog kèm User & Role
        public async Task<IEnumerable<Blog>> GetAllWithUserAndRoleAsync()
            => await _repo.GetAllWithUserAndRoleAsync();

        // L?y blog theo tr?ng thái kèm User & Role
        public async Task<IEnumerable<Blog>> GetAllByStatusWithUserAndRoleAsync(string status)
            => await _repo.GetAllByStatusWithUserAndRoleAsync(status);

        // L?y danh sách blog b? báo cáo
        public async Task<IEnumerable<Blog>> GetAllReportedWithUserAndRoleAsync()
            => await _repo.GetAllReportedWithUserAndRoleAsync();

        // Ð?m t?ng s? blog h? th?ng
        public async Task<int> CountAllAsync() => await _repo.CountAllAsync();

        // Ð?m s? blog theo tr?ng thái
        public async Task<int> CountByStatusAsync(string status) => await _repo.CountByStatusAsync(status);

        // Ð?m s? blog b? báo cáo
        public async Task<int> CountReportedAsync() => await _repo.CountReportedAsync();

        // Duy?t blog (chuy?n tr?ng thái thành Approved)
        public async Task<bool> ApproveBlogAsync(int blogId)
        {
            var blog = await _repo.GetByIdWithUserAndRoleAsync(blogId);
            if (blog == null) return false;
            blog.Status = "Approved";
            _repo.Update(blog);
            await _repo.SaveChangesAsync();
            return true;
        }

        // T? ch?i blog (chuy?n tr?ng thái thành Rejected)
        public async Task<bool> RejectBlogAsync(int blogId)
        {
            var blog = await _repo.GetByIdWithUserAndRoleAsync(blogId);
            if (blog == null) return false;
            blog.Status = "Rejected";
            _repo.Update(blog);
            await _repo.SaveChangesAsync();
            return true;
        }

        // Ðánh d?u blog dã x? lý báo cáo
        public async Task<bool> MarkBlogAsReviewedAsync(int blogId)
        {
            var blog = await _repo.GetByIdWithUserAndRoleAsync(blogId);
            if (blog == null) return false;
            blog.ReportCount = 0;
            _repo.Update(blog);
            await _repo.SaveChangesAsync();
            return true;
        }

        // Xoá blog
        public async Task<bool> DeleteAsync(int blogId)
        {
            var blog = await _repo.GetByIdWithUserAndRoleAsync(blogId);
            if (blog == null) return false;
            _repo.Delete(blog);
            await _repo.SaveChangesAsync();
            return true;
        }

        // Admin t?o blog m?i (m?c d?nh dã duy?t)
        public async Task<Blog> CreateByAdminAsync(Blog blog)
        {
            blog.Status = "Approved";
            blog.CreatedDate = System.DateTime.UtcNow;
            await _repo.AddAsync(blog);
            await _repo.SaveChangesAsync();
            return blog;
        }


        // ================= USER =================

        // L?y t?t c? blog c?a user
        public async Task<IEnumerable<Blog>> GetAllByUserIdAsync(int userId)
        {
            return await _repo.GetByAuthorIdWithUserAndRoleAsync(userId);  // Use the repository method that includes User and Role
        }

        // L?y chi ti?t blog theo ID
        public async Task<Blog> GetByIdAsync(int blogId)
            => await _repo.GetByIdAsync(blogId);

        // User t?o blog m?i (m?c d?nh ch? duy?t)
        public async Task<Blog> CreateByUserAsync(Blog blog)
        {
            //blog.Status = "Pending";
            blog.CreatedDate = System.DateTime.UtcNow;
            await _repo.AddAsync(blog);
            await _repo.SaveChangesAsync();
            return blog;
        }

        // User ch?nh s?a blog
        public async Task<bool> UpdateAsync(Blog blog)
        {
            _repo.Update(blog);
            await _repo.SaveChangesAsync();
            return true;
        }

        // Th?ng kê t?ng s? blog c?a user
        public async Task<int> CountAllByUserAsync(int userId)
            => await _repo.CountAllByUserAsync(userId);

        // Th?ng kê blog theo tr?ng thái c?a user
        public async Task<int> CountByUserAndStatusAsync(int userId, string status)
            => await _repo.CountByUserAndStatusAsync(userId, status);

        // Báo cáo blog (tang s? l?n báo cáo)
        public async Task<bool> ReportBlogAsync(int blogId)
        {
            var blog = await _repo.GetByIdAsync(blogId);
            if (blog == null) return false;

            blog.ReportCount++;  // Tang s? lu?ng báo cáo lên 1
            _repo.Update(blog);
            await _repo.SaveChangesAsync();

            return true;
        }
        public async Task<IEnumerable<Blog>> GetAllPublishedAsync()
        {
            return await _repo.GetAllPublishedWithUserAndRoleAsync();
        }
        public async Task<bool> ToggleReactionAsync(int blogId, int userId, bool isLike)
        {
            var existing = await _repo.GetReactionAsync(blogId, userId);

            if (existing == null)
            {
                await _repo.AddReactionAsync(new BlogReaction
                {
                    BlogId = blogId,
                    UserId = userId,
                    IsLike = isLike,
                    ReactedAt = DateTime.UtcNow
                });
            }
            else
            {
                if (existing.IsLike == isLike)
                {
                    // N?u dã like/dislike r?i mà nh?n l?i => hu?
                    existing.IsLike = null;
                }
                else
                {
                    existing.IsLike = isLike;
                    existing.ReactedAt = DateTime.UtcNow;
                }

                _repo.UpdateReaction(existing);
            }

            await _repo.SaveChangesAsync(); // ?? C?n luu xong r?i m?i tính toán l?i

            // C?p nh?t l?i t?ng Likes/Dislikes bên b?ng Blog
            var blog = await _repo.GetByIdAsync(blogId);
            blog.Likes = await _repo.CountReactionsAsync(blogId, true);
            blog.Dislikes = await _repo.CountReactionsAsync(blogId, false);
            _repo.Update(blog);

            await _repo.SaveChangesAsync(); // ?? Ph?i luu ti?p sau khi c?p nh?t blog

            return true;
        }



        public async Task<int> CountLikesAsync(int blogId) => await _repo.CountReactionsAsync(blogId, true);

        public async Task<int> CountDislikesAsync(int blogId) => await _repo.CountReactionsAsync(blogId, false);
        public async Task<bool?> GetUserReactionAsync(int blogId, int userId)
        {
            var reaction = await _repo.GetReactionAsync(blogId, userId);
            return reaction?.IsLike; // Có th? là true / false / null
        }
        public async Task<(int Likes, int Dislikes)> GetReactionCountAsync(int blogId)
        {
            var likes = await _repo.CountReactionsAsync(blogId, true);
            var dislikes = await _repo.CountReactionsAsync(blogId, false);
            return (likes, dislikes);
        }


    }
}
