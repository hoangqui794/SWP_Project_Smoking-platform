using Smoking.BLL.Interfaces;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Smoking.BLL.Services
{
    /// <summary>
    /// Xử lý nghiệp vụ blog cho Admin và User
    /// </summary>
    public class BlogService : IBlogService
    {
        private readonly IBlogRepository _repo;
        public BlogService(IBlogRepository repo) => _repo = repo;

        // ================= ADMIN =================

        // Lấy toàn bộ blog kèm User & Role
        public async Task<IEnumerable<Blog>> GetAllWithUserAndRoleAsync()
            => await _repo.GetAllWithUserAndRoleAsync();

        // Lấy blog theo trạng thái kèm User & Role
        public async Task<IEnumerable<Blog>> GetAllByStatusWithUserAndRoleAsync(string status)
            => await _repo.GetAllByStatusWithUserAndRoleAsync(status);

        // Lấy danh sách blog bị báo cáo
        public async Task<IEnumerable<Blog>> GetAllReportedWithUserAndRoleAsync()
            => await _repo.GetAllReportedWithUserAndRoleAsync();

        // Đếm tổng số blog hệ thống
        public async Task<int> CountAllAsync() => await _repo.CountAllAsync();

        // Đếm số blog theo trạng thái
        public async Task<int> CountByStatusAsync(string status) => await _repo.CountByStatusAsync(status);

        // Đếm số blog bị báo cáo
        public async Task<int> CountReportedAsync() => await _repo.CountReportedAsync();

        // Duyệt blog (chuyển trạng thái thành Approved)
        public async Task<bool> ApproveBlogAsync(int blogId)
        {
            var blog = await _repo.GetByIdWithUserAndRoleAsync(blogId);
            if (blog == null) return false;
            blog.Status = "Approved";
            _repo.Update(blog);
            await _repo.SaveChangesAsync();
            return true;
        }

        // Từ chối blog (chuyển trạng thái thành Rejected)
        public async Task<bool> RejectBlogAsync(int blogId)
        {
            var blog = await _repo.GetByIdWithUserAndRoleAsync(blogId);
            if (blog == null) return false;
            blog.Status = "Rejected";
            _repo.Update(blog);
            await _repo.SaveChangesAsync();
            return true;
        }

        // Đánh dấu blog đã xử lý báo cáo
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

        // Admin tạo blog mới (mặc định đã duyệt)
        public async Task<Blog> CreateByAdminAsync(Blog blog)
        {
            blog.Status = "Approved";
            blog.CreatedDate = System.DateTime.UtcNow;
            await _repo.AddAsync(blog);
            await _repo.SaveChangesAsync();
            return blog;
        }


        // ================= USER =================

        // Lấy tất cả blog của user
        public async Task<IEnumerable<Blog>> GetAllByUserIdAsync(int userId)
        {
            return await _repo.GetByAuthorIdWithUserAndRoleAsync(userId);  // Use the repository method that includes User and Role
        }

        // Lấy chi tiết blog theo ID
        public async Task<Blog> GetByIdAsync(int blogId)
            => await _repo.GetByIdAsync(blogId);

        // User tạo blog mới (mặc định chờ duyệt)
        public async Task<Blog> CreateByUserAsync(Blog blog)
        {
            //blog.Status = "Pending";
            blog.CreatedDate = System.DateTime.UtcNow;
            await _repo.AddAsync(blog);
            await _repo.SaveChangesAsync();
            return blog;
        }

        // User chỉnh sửa blog
        public async Task<bool> UpdateAsync(Blog blog)
        {
            _repo.Update(blog);
            await _repo.SaveChangesAsync();
            return true;
        }

        // Thống kê tổng số blog của user
        public async Task<int> CountAllByUserAsync(int userId)
            => await _repo.CountAllByUserAsync(userId);

        // Thống kê blog theo trạng thái của user
        public async Task<int> CountByUserAndStatusAsync(int userId, string status)
            => await _repo.CountByUserAndStatusAsync(userId, status);

        // Báo cáo blog (tăng số lần báo cáo)
        public async Task<bool> ReportBlogAsync(int blogId)
        {
            var blog = await _repo.GetByIdAsync(blogId);
            if (blog == null) return false;

            blog.ReportCount++;  // Tăng số lượng báo cáo lên 1
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
                    // Nếu đã like/dislike rồi mà nhấn lại => huỷ
                    existing.IsLike = null;
                }
                else
                {
                    existing.IsLike = isLike;
                    existing.ReactedAt = DateTime.UtcNow;
                }

                _repo.UpdateReaction(existing);
            }

            await _repo.SaveChangesAsync(); // 💥 Cần lưu xong rồi mới tính toán lại

            // Cập nhật lại tổng Likes/Dislikes bên bảng Blog
            var blog = await _repo.GetByIdAsync(blogId);
            blog.Likes = await _repo.CountReactionsAsync(blogId, true);
            blog.Dislikes = await _repo.CountReactionsAsync(blogId, false);
            _repo.Update(blog);

            await _repo.SaveChangesAsync(); // 💥 Phải lưu tiếp sau khi cập nhật blog

            return true;
        }



        public async Task<int> CountLikesAsync(int blogId) => await _repo.CountReactionsAsync(blogId, true);

        public async Task<int> CountDislikesAsync(int blogId) => await _repo.CountReactionsAsync(blogId, false);
        public async Task<bool?> GetUserReactionAsync(int blogId, int userId)
        {
            var reaction = await _repo.GetReactionAsync(blogId, userId);
            return reaction?.IsLike; // Có thể là true / false / null
        }
        public async Task<(int Likes, int Dislikes)> GetReactionCountAsync(int blogId)
        {
            var likes = await _repo.CountReactionsAsync(blogId, true);
            var dislikes = await _repo.CountReactionsAsync(blogId, false);
            return (likes, dislikes);
        }


    }
}
