using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Smoking.DAL.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgresCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Achievement",
                columns: table => new
                {
                    AchievementID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AchievementName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Criteria = table.Column<string>(type: "text", nullable: true),
                    BadgeImage = table.Column<string>(type: "text", nullable: true),
                    PackageType = table.Column<string>(type: "text", nullable: true),
                    SmokeFreeDaysRequired = table.Column<int>(type: "integer", nullable: true),
                    MoneySavedRequired = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    CigarettesDroppedRequired = table.Column<int>(type: "integer", nullable: true),
                    CheckinDaysRequired = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Achievement", x => x.AchievementID);
                });

            migrationBuilder.CreateTable(
                name: "MembershipPackage",
                columns: table => new
                {
                    PackageID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PackageName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PackageType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Duration = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MembershipPackage", x => x.PackageID);
                });

            migrationBuilder.CreateTable(
                name: "MilestoneGroup",
                columns: table => new
                {
                    MilestoneGroupID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GroupName = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MilestoneGroup", x => x.MilestoneGroupID);
                });

            migrationBuilder.CreateTable(
                name: "Questions",
                columns: table => new
                {
                    QuestionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuestionText = table.Column<string>(type: "text", nullable: false),
                    QuestionType = table.Column<string>(type: "text", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Questions", x => x.QuestionID);
                });

            migrationBuilder.CreateTable(
                name: "QuitChallengeTemplate",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    NotesSuggestion = table.Column<string>(type: "text", nullable: true),
                    Stage = table.Column<int>(type: "integer", nullable: false),
                    StageTitle = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuitChallengeTemplate", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    RoleID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleName = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role", x => x.RoleID);
                });

            migrationBuilder.CreateTable(
                name: "Milestone",
                columns: table => new
                {
                    MilestoneID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MilestoneGroupID = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    MilestoneTime = table.Column<int>(type: "integer", nullable: false),
                    TimeUnit = table.Column<string>(type: "text", nullable: false),
                    Percent = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Milestone", x => x.MilestoneID);
                    table.ForeignKey(
                        name: "FK_Milestone_MilestoneGroup_MilestoneGroupID",
                        column: x => x.MilestoneGroupID,
                        principalTable: "MilestoneGroup",
                        principalColumn: "MilestoneGroupID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AnswerOptions",
                columns: table => new
                {
                    AnswerOptionID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuestionID = table.Column<int>(type: "integer", nullable: false),
                    AnswerText = table.Column<string>(type: "text", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnswerOptions", x => x.AnswerOptionID);
                    table.ForeignKey(
                        name: "FK_AnswerOptions_Questions_QuestionID",
                        column: x => x.QuestionID,
                        principalTable: "Questions",
                        principalColumn: "QuestionID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FullName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Password = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: true),
                    RoleID = table.Column<int>(type: "integer", nullable: true),
                    RegistrationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ProfilePicture = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Gender = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CoachId = table.Column<int>(type: "integer", nullable: true),
                    PendingCoachId = table.Column<int>(type: "integer", nullable: true),
                    CoachChangeReason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.UserID);
                    table.ForeignKey(
                        name: "FK_User_Role_RoleID",
                        column: x => x.RoleID,
                        principalTable: "Role",
                        principalColumn: "RoleID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_User_User_CoachId",
                        column: x => x.CoachId,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_User_User_PendingCoachId",
                        column: x => x.PendingCoachId,
                        principalTable: "User",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "PackageMilestone",
                columns: table => new
                {
                    PackageMilestoneID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PackageID = table.Column<int>(type: "integer", nullable: false),
                    MilestoneID = table.Column<int>(type: "integer", nullable: false),
                    DetailDescription = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PackageMilestone", x => x.PackageMilestoneID);
                    table.ForeignKey(
                        name: "FK_PackageMilestone_MembershipPackage_PackageID",
                        column: x => x.PackageID,
                        principalTable: "MembershipPackage",
                        principalColumn: "PackageID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PackageMilestone_Milestone_MilestoneID",
                        column: x => x.MilestoneID,
                        principalTable: "Milestone",
                        principalColumn: "MilestoneID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Blog",
                columns: table => new
                {
                    BlogId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AuthorId = table.Column<int>(type: "integer", nullable: false),
                    CategoryName = table.Column<string>(type: "text", nullable: true),
                    BlogType = table.Column<string>(type: "text", nullable: true),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Likes = table.Column<int>(type: "integer", nullable: false),
                    Dislikes = table.Column<int>(type: "integer", nullable: false),
                    ReportCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Blog", x => x.BlogId);
                    table.ForeignKey(
                        name: "FK_Blog_User_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ConsultationBooking",
                columns: table => new
                {
                    BookingID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    CoachID = table.Column<int>(type: "integer", nullable: false),
                    BookingDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Duration = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    MeetingLink = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CoachNotes = table.Column<string>(type: "text", nullable: true),
                    PreferredLanguage = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReminderSent = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsultationBooking", x => x.BookingID);
                    table.ForeignKey(
                        name: "FK_ConsultationBooking_User_CoachID",
                        column: x => x.CoachID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConsultationBooking_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Feedback",
                columns: table => new
                {
                    FeedbackID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    FeedbackContent = table.Column<string>(type: "text", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    FeedbackDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Feedback", x => x.FeedbackID);
                    table.ForeignKey(
                        name: "FK_Feedback_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notification",
                columns: table => new
                {
                    NotificationID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    NotificationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NotificationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NotificationName = table.Column<string>(type: "text", nullable: false),
                    Condition = table.Column<string>(type: "text", nullable: false),
                    NotificationFor = table.Column<string>(type: "text", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notification", x => x.NotificationID);
                    table.ForeignKey(
                        name: "FK_Notification_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "QuitPlan",
                columns: table => new
                {
                    QuitPlanID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CigarettesPerDayAtStart = table.Column<int>(type: "integer", nullable: false),
                    PricePerPackAtStart = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CigarettesPerPack = table.Column<int>(type: "integer", nullable: false),
                    PlanDetails = table.Column<string>(type: "text", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuitPlan", x => x.QuitPlanID);
                    table.ForeignKey(
                        name: "FK_QuitPlan_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SmokingStatuses",
                columns: table => new
                {
                    SmokingStatusID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    CigarettesPerDay = table.Column<int>(type: "integer", nullable: false),
                    MonthlyCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PricePerPack = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SmokingStatuses", x => x.SmokingStatusID);
                    table.ForeignKey(
                        name: "FK_SmokingStatuses_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserAchievement",
                columns: table => new
                {
                    UserAchievementID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    AchievementID = table.Column<int>(type: "integer", nullable: false),
                    AwardedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAchievement", x => x.UserAchievementID);
                    table.ForeignKey(
                        name: "FK_UserAchievement_Achievement_AchievementID",
                        column: x => x.AchievementID,
                        principalTable: "Achievement",
                        principalColumn: "AchievementID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserAchievement_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserMembership",
                columns: table => new
                {
                    UserMembershipID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    PackageID = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserMembership", x => x.UserMembershipID);
                    table.ForeignKey(
                        name: "FK_UserMembership_MembershipPackage_PackageID",
                        column: x => x.PackageID,
                        principalTable: "MembershipPackage",
                        principalColumn: "PackageID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserMembership_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserMilestoneProgress",
                columns: table => new
                {
                    UserMilestoneID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    MilestoneID = table.Column<int>(type: "integer", nullable: false),
                    AchievedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserMilestoneProgress", x => x.UserMilestoneID);
                    table.ForeignKey(
                        name: "FK_UserMilestoneProgress_Milestone_MilestoneID",
                        column: x => x.MilestoneID,
                        principalTable: "Milestone",
                        principalColumn: "MilestoneID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserMilestoneProgress_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BlogReaction",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BlogId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    IsLike = table.Column<bool>(type: "boolean", nullable: true),
                    ReactedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlogReaction", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BlogReaction_Blog_BlogId",
                        column: x => x.BlogId,
                        principalTable: "Blog",
                        principalColumn: "BlogId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BlogReaction_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuitPlanSelectedAnswers",
                columns: table => new
                {
                    SelectedAnswerID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuitPlanID = table.Column<int>(type: "integer", nullable: false),
                    AnswerOptionID = table.Column<int>(type: "integer", nullable: false),
                    CustomAnswerText = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuitPlanSelectedAnswers", x => x.SelectedAnswerID);
                    table.ForeignKey(
                        name: "FK_QuitPlanSelectedAnswers_AnswerOptions_AnswerOptionID",
                        column: x => x.AnswerOptionID,
                        principalTable: "AnswerOptions",
                        principalColumn: "AnswerOptionID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuitPlanSelectedAnswers_QuitPlan_QuitPlanID",
                        column: x => x.QuitPlanID,
                        principalTable: "QuitPlan",
                        principalColumn: "QuitPlanID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuitProgress",
                columns: table => new
                {
                    ProgressID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuitPlanID = table.Column<int>(type: "integer", nullable: false),
                    ProgressDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CigarettesPerDayBaseline = table.Column<int>(type: "integer", nullable: false),
                    MoneySaved = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastSmokeDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CigarettesSmokedToday = table.Column<int>(type: "integer", nullable: true),
                    CigarettesDropped = table.Column<int>(type: "integer", nullable: true),
                    TotalCigarettesDropped = table.Column<int>(type: "integer", nullable: true),
                    TotalMoneySaved = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuitProgress", x => x.ProgressID);
                    table.ForeignKey(
                        name: "FK_QuitProgress_QuitPlan_QuitPlanID",
                        column: x => x.QuitPlanID,
                        principalTable: "QuitPlan",
                        principalColumn: "QuitPlanID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserQuitChallenge",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    QuitPlanId = table.Column<int>(type: "integer", nullable: false),
                    ChallengeDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TemplateId = table.Column<int>(type: "integer", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    ScheduledDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ImageData = table.Column<byte[]>(type: "bytea", nullable: true),
                    ImageContentType = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserQuitChallenge", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserQuitChallenge_QuitChallengeTemplate_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "QuitChallengeTemplate",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserQuitChallenge_QuitPlan_QuitPlanId",
                        column: x => x.QuitPlanId,
                        principalTable: "QuitPlan",
                        principalColumn: "QuitPlanID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserQuitChallenge_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payment",
                columns: table => new
                {
                    PaymentID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserID = table.Column<int>(type: "integer", nullable: false),
                    PackageID = table.Column<int>(type: "integer", nullable: false),
                    UserMembershipID = table.Column<int>(type: "integer", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TransactionReference = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payment", x => x.PaymentID);
                    table.ForeignKey(
                        name: "FK_Payment_MembershipPackage_PackageID",
                        column: x => x.PackageID,
                        principalTable: "MembershipPackage",
                        principalColumn: "PackageID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Payment_UserMembership_UserMembershipID",
                        column: x => x.UserMembershipID,
                        principalTable: "UserMembership",
                        principalColumn: "UserMembershipID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payment_User_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnswerOptions_QuestionID",
                table: "AnswerOptions",
                column: "QuestionID");

            migrationBuilder.CreateIndex(
                name: "IX_Blog_AuthorId",
                table: "Blog",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_BlogReaction_BlogId",
                table: "BlogReaction",
                column: "BlogId");

            migrationBuilder.CreateIndex(
                name: "IX_BlogReaction_UserId",
                table: "BlogReaction",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsultationBooking_CoachID",
                table: "ConsultationBooking",
                column: "CoachID");

            migrationBuilder.CreateIndex(
                name: "IX_ConsultationBooking_UserID",
                table: "ConsultationBooking",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_UserID",
                table: "Feedback",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Milestone_MilestoneGroupID",
                table: "Milestone",
                column: "MilestoneGroupID");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_UserID",
                table: "Notification",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_PackageMilestone_MilestoneID",
                table: "PackageMilestone",
                column: "MilestoneID");

            migrationBuilder.CreateIndex(
                name: "IX_PackageMilestone_PackageID",
                table: "PackageMilestone",
                column: "PackageID");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_PackageID",
                table: "Payment",
                column: "PackageID");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_UserID",
                table: "Payment",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Payment_UserMembershipID",
                table: "Payment",
                column: "UserMembershipID");

            migrationBuilder.CreateIndex(
                name: "IX_QuitPlan_UserID",
                table: "QuitPlan",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_QuitPlanSelectedAnswers_AnswerOptionID",
                table: "QuitPlanSelectedAnswers",
                column: "AnswerOptionID");

            migrationBuilder.CreateIndex(
                name: "IX_QuitPlanSelectedAnswers_QuitPlanID",
                table: "QuitPlanSelectedAnswers",
                column: "QuitPlanID");

            migrationBuilder.CreateIndex(
                name: "IX_QuitProgress_QuitPlanID",
                table: "QuitProgress",
                column: "QuitPlanID");

            migrationBuilder.CreateIndex(
                name: "IX_SmokingStatuses_UserID",
                table: "SmokingStatuses",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_User_CoachId",
                table: "User",
                column: "CoachId");

            migrationBuilder.CreateIndex(
                name: "IX_User_PendingCoachId",
                table: "User",
                column: "PendingCoachId");

            migrationBuilder.CreateIndex(
                name: "IX_User_RoleID",
                table: "User",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_UserAchievement_AchievementID",
                table: "UserAchievement",
                column: "AchievementID");

            migrationBuilder.CreateIndex(
                name: "IX_UserAchievement_UserID",
                table: "UserAchievement",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_UserMembership_PackageID",
                table: "UserMembership",
                column: "PackageID");

            migrationBuilder.CreateIndex(
                name: "IX_UserMembership_UserID",
                table: "UserMembership",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_UserMilestoneProgress_MilestoneID",
                table: "UserMilestoneProgress",
                column: "MilestoneID");

            migrationBuilder.CreateIndex(
                name: "IX_UserMilestoneProgress_UserID",
                table: "UserMilestoneProgress",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_UserQuitChallenge_QuitPlanId",
                table: "UserQuitChallenge",
                column: "QuitPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_UserQuitChallenge_TemplateId",
                table: "UserQuitChallenge",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_UserQuitChallenge_UserId",
                table: "UserQuitChallenge",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlogReaction");

            migrationBuilder.DropTable(
                name: "ConsultationBooking");

            migrationBuilder.DropTable(
                name: "Feedback");

            migrationBuilder.DropTable(
                name: "Notification");

            migrationBuilder.DropTable(
                name: "PackageMilestone");

            migrationBuilder.DropTable(
                name: "Payment");

            migrationBuilder.DropTable(
                name: "QuitPlanSelectedAnswers");

            migrationBuilder.DropTable(
                name: "QuitProgress");

            migrationBuilder.DropTable(
                name: "SmokingStatuses");

            migrationBuilder.DropTable(
                name: "UserAchievement");

            migrationBuilder.DropTable(
                name: "UserMilestoneProgress");

            migrationBuilder.DropTable(
                name: "UserQuitChallenge");

            migrationBuilder.DropTable(
                name: "Blog");

            migrationBuilder.DropTable(
                name: "UserMembership");

            migrationBuilder.DropTable(
                name: "AnswerOptions");

            migrationBuilder.DropTable(
                name: "Achievement");

            migrationBuilder.DropTable(
                name: "Milestone");

            migrationBuilder.DropTable(
                name: "QuitChallengeTemplate");

            migrationBuilder.DropTable(
                name: "QuitPlan");

            migrationBuilder.DropTable(
                name: "MembershipPackage");

            migrationBuilder.DropTable(
                name: "Questions");

            migrationBuilder.DropTable(
                name: "MilestoneGroup");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "Role");
        }
    }
}
