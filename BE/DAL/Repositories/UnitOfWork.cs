using Smoking.DAL.Data;
using Smoking.DAL.Entities;
using Smoking.DAL.Repositories;
using Smoking.DAL.Interfaces.Repositories;
using System.Threading.Tasks;

namespace Smoking.DAL.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;

            // Khởi tạo từng repository
            Roles = new RoleRepository(_context);
            Users = new UserRepository(_context);
            MembershipPackages = new MembershipPackageRepository(_context);
            UserMemberships = new UserMembershipRepository(_context);
            Payments = new PaymentRepository(_context);
            SmokingStatuses = new SmokingStatusRepository(_context);
            QuitPlans = new QuitPlanRepository(_context);
            QuitProgresses = new QuitProgressRepository(_context);
            Achievements = new AchievementRepository(_context);
            UserAchievements = new UserAchievementRepository(_context);
            Notifications = new NotificationRepository(_context);
            Blogs = new BlogRepository(_context);
            Feedbacks = new FeedbackRepository(_context);
            ConsultationBookings = new ConsultationBookingRepository(_context);
            Questions = new QuestionRepository(_context);
            QuitPlanSelectedAnswers = new QuitPlanSelectedAnswerRepository(_context);
            AnswerOptions = new AnswerOptionRepository(_context);
            QuitChallengeTemplates = new QuitChallengeTemplateRepository(_context);
            UserQuitChallenges = new UserQuitChallengeRepository(_context);
            Milestones = new MilestoneRepository(_context);
            MilestoneGroups = new MilestoneGroupRepository(_context);
            PackageMilestones = new PackageMilestoneRepository(_context);

        }

        public IRoleRepository Roles { get; private set; }
        public IUserRepository Users { get; private set; }
        public IMembershipPackageRepository MembershipPackages { get; private set; }
        public IUserMembershipRepository UserMemberships { get; private set; }
        public IPaymentRepository Payments { get; private set; }
        public ISmokingStatusRepository SmokingStatuses { get; private set; }
        public IQuitPlanRepository QuitPlans { get; private set; }
        public IQuitProgressRepository QuitProgresses { get; private set; }
        public IAchievementRepository Achievements { get; private set; }
        public IUserAchievementRepository UserAchievements { get; private set; }
        public INotificationRepository Notifications { get; private set; }
        public IBlogRepository Blogs { get; private set; }
        public IFeedbackRepository Feedbacks { get; private set; }
        public IConsultationBookingRepository ConsultationBookings { get; private set; }
        public IQuestionRepository Questions { get; private set; }
        public IQuitPlanSelectedAnswerRepository QuitPlanSelectedAnswers { get; private set; }
        public IAnswerOptionRepository AnswerOptions { get; private set; }
        public IQuitChallengeTemplateRepository QuitChallengeTemplates { get; private set; }
        public IUserQuitChallengeRepository UserQuitChallenges { get; private set; }
        public IMilestoneRepository Milestones { get; private set; }
        public IMilestoneGroupRepository MilestoneGroups { get; private set; }
        public IPackageMilestoneRepository PackageMilestones { get; private set; }
        public IQuitPlanSelectedAnswerRepository QuitPlanSelectedAnswerRepository { get; private set; }




        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public AppDbContext DbContext => _context;

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
