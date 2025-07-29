using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Smoking.API.Models;
using Smoking.BLL.Interfaces;
using Smoking.BLL.Models;
using Smoking.BLL.Services;
using Smoking.DAL.Data;
using Smoking.DAL.Interfaces.Repositories;
using Smoking.DAL.Repositories;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
// ⭐ BƯỚC 1: THÊM DỊCH VỤ CORS
// =================================================================
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            // Thay thế "http://localhost:3000" bằng địa chỉ của frontend React của bạn
            policy.WithOrigins(
            "http://localhost:3000"
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});


// =================== CONFIGURATION ===================
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.Configure<MomoConfig>(builder.Configuration.GetSection("Momo"));
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();

// =================== DATABASE ===================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// =================== SERVICES & REPOSITORIES ===================
builder.Services.AddScoped<IFeedbackService, FeedbackService>();


// ---- Authentication & User ----
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IMilestoneService, MilestoneService>(); 
builder.Services.AddScoped<IMilestoneRepository, MilestoneRepository>();

// ---- Achievement ----
builder.Services.AddScoped<IAchievementService, AchievementService>();
builder.Services.AddScoped<IUserAchievementService, UserAchievementService>();
builder.Services.AddScoped<IAchievementEvaluatorService, AchievementEvaluatorService>();

// ---- Quit Plan & Progress ----
builder.Services.AddScoped<IQuitPlanService, QuitPlanService>();
builder.Services.AddScoped<IQuitPlanAutoService, QuitPlanAutoService>();
builder.Services.AddScoped<IQuitProgressService, QuitProgressService>();
builder.Services.AddScoped<IQuitProgressRepository, QuitProgressRepository>();
builder.Services.AddScoped<IRevenueService, RevenueService>();

// ---- Quit Challenge ----
builder.Services.AddScoped<IUserQuitChallengeService, UserQuitChallengeService>();
builder.Services.AddScoped<IUserQuitChallengeRepository, UserQuitChallengeRepository>();
builder.Services.AddScoped<IQuitChallengeTemplateService, QuitChallengeTemplateService>();
builder.Services.AddScoped<IQuitChallengeTemplateRepository, QuitChallengeTemplateRepository>();

// ---- Membership & Payment ----
builder.Services.AddScoped<IMembershipPackageService, MembershipPackageService>();
builder.Services.AddScoped<IUserMembershipService, UserMembershipService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IMembershipPackageRepository, MembershipPackageRepository>();
builder.Services.AddScoped<IUserMembershipRepository, UserMembershipRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();

// ---- Blog & Notification ----
builder.Services.AddScoped<IBlogService, BlogService>();
builder.Services.AddScoped<IBlogRepository, BlogRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

// ---- Questionnaire & Email ----
builder.Services.AddScoped<IQuestionnaireService, QuestionnaireService>();
builder.Services.AddScoped<IMailService, MailService>();

// ---- Package Milestone ----
builder.Services.AddScoped<IPackageMilestoneRepository, PackageMilestoneRepository>();
builder.Services.AddScoped<IPackageMilestoneService, PackageMilestoneService>();

// ---- UserMilestoneProgress ----
builder.Services.AddScoped<IUserMilestoneProgressService, UserMilestoneProgressService>();  // Đăng ký service UserMilestoneProgressService
builder.Services.AddScoped<IUserMilestoneProgressRepository, UserMilestoneProgressRepository>();  // Đăng ký repository UserMilestoneProgressRepository

// =================== JWT AUTHENTICATION ===================
var key = Encoding.UTF8.GetBytes(jwtSettings.SecretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// =================== JSON OPTIONS ===================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// =================== MEMORY CACHE ===================
builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor();


// =================== SWAGGER ===================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Smoking API", Version = "v1" });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter JWT Bearer token **_only_**",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    c.AddSecurityDefinition(securityScheme.Reference.Id, securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, new string[] { } }
    });
});

// =================== APP PIPELINE ===================
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Smoking API V1");
        c.RoutePrefix = "swagger";
    });
}
app.UseStaticFiles();
app.UseDefaultFiles();
app.UseHttpsRedirection();
// ⭐ BƯỚC 2: KÍCH HOẠT MIDDLEWARE CORS (ĐẶT TRƯỚC UseAuthentication)
// =================================================================
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")),
    RequestPath = ""
});

app.UseCors(MyAllowSpecificOrigins);

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
