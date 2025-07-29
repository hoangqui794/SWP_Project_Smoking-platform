using Smoking.DAL.Data;
using System;
using System.Threading.Tasks;

namespace Smoking.DAL.Interfaces.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IRoleRepository Roles { get; }
        IUserRepository Users { get; }
        IMembershipPackageRepository MembershipPackages { get; }
        IUserMembershipRepository UserMemberships { get; }
        IPaymentRepository Payments { get; }
        ISmokingStatusRepository SmokingStatuses { get; }
        IQuitPlanRepository QuitPlans { get; }
        IQuitProgressRepository QuitProgresses { get; }
        IAchievementRepository Achievements { get; }
        IUserAchievementRepository UserAchievements { get; }
        INotificationRepository Notifications { get; }
        IBlogRepository Blogs { get; }
        IFeedbackRepository Feedbacks { get; }
        IConsultationBookingRepository ConsultationBookings { get; }
        IQuestionRepository Questions { get; }
        IQuitPlanSelectedAnswerRepository QuitPlanSelectedAnswers { get; }
        IAnswerOptionRepository AnswerOptions { get; }
        IQuitChallengeTemplateRepository QuitChallengeTemplates { get; }
        IUserQuitChallengeRepository UserQuitChallenges { get; }

        IMilestoneRepository Milestones { get; }
        IMilestoneGroupRepository MilestoneGroups { get; }
        IPackageMilestoneRepository PackageMilestones { get; }
        IQuitPlanSelectedAnswerRepository QuitPlanSelectedAnswerRepository { get; }



        Task<int> CompleteAsync();
        AppDbContext DbContext { get; }
    }
}
