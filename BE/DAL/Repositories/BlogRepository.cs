using Microsoft.EntityFrameworkCore;
using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Interfaces.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class BlogRepository : IBlogRepository
    {
        private readonly AppDbContext _context;

        public BlogRepository(AppDbContext context)
        {
            _context = context;
        }

        // ============ ADMIN ============
        public async Task<IEnumerable<Blog>> GetAllWithUserAndRoleAsync()
        {
            return await _context.Blogs
                .Include(b => b.User)
                .ThenInclude(u => u.Role)
                .ToListAsync();
        }

        public async Task<IEnumerable<Blog>> GetAllByStatusWithUserAndRoleAsync(string status)
        {
            return await _context.Blogs
                .Include(b => b.User)
                .ThenInclude(u => u.Role)
                .Where(b => b.Status == status)
                .ToListAsync();
        }

        public async Task<IEnumerable<Blog>> GetAllReportedWithUserAndRoleAsync()
        {
            return await _context.Blogs
                .Include(b => b.User)
                .ThenInclude(u => u.Role)
                .Where(b => b.ReportCount > 0)
                .ToListAsync();
        }

        public async Task<int> CountByStatusAsync(string status)
            => await _context.Blogs.CountAsync(b => b.Status == status);

        public async Task<int> CountReportedAsync()
            => await _context.Blogs.CountAsync(b => b.ReportCount > 0);

        public async Task<int> CountAllAsync()
            => await _context.Blogs.CountAsync();

        public async Task<Blog> GetByIdWithUserAndRoleAsync(int id)
        {
            return await _context.Blogs
                .Include(b => b.User)
                .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(b => b.BlogId == id);
        }

        public async Task<IEnumerable<Blog>> GetByAuthorIdWithUserAndRoleAsync(int authorId)
        {
            return await _context.Blogs
                .Include(b => b.User)
                .ThenInclude(u => u.Role)
                .Where(b => b.AuthorId == authorId)
                .ToListAsync();
        }

        // ============ USER ============
        public async Task<IEnumerable<Blog>> GetAllByUserIdAsync(int userId)
        {
            return await _context.Blogs
                .Where(b => b.AuthorId == userId)
                .ToListAsync();
        }

        public async Task<Blog> GetByIdAsync(int blogId)
        {
            return await _context.Blogs
                .FirstOrDefaultAsync(b => b.BlogId == blogId);
        }

        public async Task<int> CountAllByUserAsync(int userId)
            => await _context.Blogs.CountAsync(b => b.AuthorId == userId);

        public async Task<int> CountByUserAndStatusAsync(int userId, string status)
            => await _context.Blogs.CountAsync(b => b.AuthorId == userId && b.Status == status);

        public async Task<IEnumerable<Blog>> GetAllPublishedWithUserAndRoleAsync()
        {
            return await _context.Blogs
                .Include(b => b.User)
                .ThenInclude(u => u.Role)
                .Where(b => b.Status == "Published")
                .ToListAsync();
        }

        // ============ COMMON ============
        public async Task AddAsync(Blog blog)
        {
            await _context.Blogs.AddAsync(blog);
        }

        public void Update(Blog blog)
        {
            _context.Blogs.Update(blog);
        }

        public void Delete(Blog blog)
        {
            _context.Blogs.Remove(blog);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        // ============ Reaction ============
        public async Task<BlogReaction?> GetReactionAsync(int blogId, int userId)
        {
            return await _context.BlogReactions
                .FirstOrDefaultAsync(r => r.BlogId == blogId && r.UserId == userId);
        }

        public async Task AddReactionAsync(BlogReaction reaction)
        {
            await _context.BlogReactions.AddAsync(reaction);
        }

        public void UpdateReaction(BlogReaction reaction)
        {
            _context.BlogReactions.Update(reaction);
        }

        public async Task<int> CountReactionsAsync(int blogId, bool isLike)
        {
            return await _context.BlogReactions
                .CountAsync(r => r.BlogId == blogId && r.IsLike == isLike);
        }
        public async Task<bool> IncrementLikeAsync(int blogId)
        {
            var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.BlogId == blogId);
            if (blog == null) return false;

            blog.Likes += 1;
            _context.Blogs.Update(blog);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IncrementDislikeAsync(int blogId)
        {
            var blog = await _context.Blogs.FirstOrDefaultAsync(b => b.BlogId == blogId);
            if (blog == null) return false;

            blog.Dislikes += 1;
            _context.Blogs.Update(blog);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}