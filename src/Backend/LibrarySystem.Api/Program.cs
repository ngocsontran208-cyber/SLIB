using Hangfire;
using LibrarySystem.Infrastructure.Data;
using LibrarySystem.Infrastructure.DrmEngine;
using LibrarySystem.Infrastructure.Search;
using LibrarySystem.Api.Hubs;
using LibrarySystem.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();
builder.Services.AddControllers().AddJsonOptions(x => 
{
    x.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
builder.Services.AddSignalR();

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4000", "http://127.0.0.1:4000") // Các origin của Staff Portal và OPAC
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Bắt buộc để gửi/nhận HttpOnly Cookie
    });
});

// Lấy chuỗi kết nối từ appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Đăng ký ApplicationDbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Đăng ký DRM Engine
builder.Services.AddScoped<IDrmEngineService, DrmEngineService>();

// Đăng ký MARC Services
builder.Services.AddScoped<LibrarySystem.Application.Interfaces.IMarcValidationService, LibrarySystem.Infrastructure.Services.Marc.MarcValidationService>();
builder.Services.AddScoped<LibrarySystem.Application.Interfaces.IMarcImportService, LibrarySystem.Infrastructure.Services.Marc.MarcImportService>();
builder.Services.AddScoped<LibrarySystem.Application.Interfaces.IMarcSanitizationService, LibrarySystem.Infrastructure.Services.Marc.MarcSanitizationService>();

// Đăng ký SruClientService kèm HttpClient
builder.Services.AddHttpClient<LibrarySystem.Application.Interfaces.ISruClientService, LibrarySystem.Infrastructure.Services.Marc.SruClientService>();

// Đăng ký Acquisition Services
builder.Services.AddScoped<LibrarySystem.Application.Interfaces.IAcquisitionService, LibrarySystem.Infrastructure.Services.Acquisition.AcquisitionService>();
builder.Services.AddScoped<LibrarySystem.Application.Interfaces.ISerialsService, LibrarySystem.Infrastructure.Services.Acquisition.SerialsService>();
builder.Services.AddScoped<LibrarySystem.Application.Interfaces.IReceivingService, LibrarySystem.Infrastructure.Services.Acquisition.ReceivingService>();
builder.Services.AddScoped<LibrarySystem.Application.Interfaces.IAuthorityService, LibrarySystem.Infrastructure.Services.Cataloging.AuthorityService>();
builder.Services.AddScoped<LibrarySystem.Application.Interfaces.IPhysicalItemService, LibrarySystem.Infrastructure.Services.Circulation.PhysicalItemService>();
builder.Services.AddScoped<LibrarySystem.Application.Interfaces.IErmService, LibrarySystem.Infrastructure.Services.Erm.ErmService>();
builder.Services.AddScoped<LibrarySystem.Application.Services.ITemplateParserService, LibrarySystem.Application.Services.TemplateParserService>();
builder.Services.AddScoped<LibrarySystem.Application.Interfaces.ISushiHarvestService, LibrarySystem.Infrastructure.Services.Erm.SushiHarvestService>();
builder.Services.AddHttpClient();

// Đăng ký RabbitMqProducer
builder.Services.AddSingleton<RabbitMqProducer>();

// Đăng ký Elasticsearch Service
builder.Services.AddSingleton<IElasticsearchService, ElasticsearchService>();

// Cấu hình Hangfire sử dụng SQL Server
builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(connectionString));

// Cấu hình JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "ThisIsASuperSecretKeyForJwtAuthenticationInUniversityLibrarySystem";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "LibrarySystem";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.ContainsKey("AccessToken"))
                {
                    context.Token = context.Request.Cookies["AccessToken"];
                }
                return Task.CompletedTask;
            }
        };
    });

// Cấu hình Policy-Based Authorization (ABAC)
builder.Services.AddAuthorization(options =>
{
    // Yêu cầu bắt buộc phải có Claim "Department" = "IT" HOẶC Role = Admin
    options.AddPolicy("RequireITDepartment", policy => 
        policy.RequireAssertion(context => 
            context.User.HasClaim(c => c.Type == "Department" && c.Value == "IT") ||
            context.User.IsInRole("Admin")));
            
    // Yêu cầu có Permission ManageDRM
    options.AddPolicy("CanManageDRM", policy => 
        policy.RequireClaim("Permission", "ManageDRM"));
});

// Cấu hình Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("DrmPolicy", opt =>
    {
        opt.PermitLimit = 30; // 30 request
        opt.Window = TimeSpan.FromMinutes(1); // trong 1 phút
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 0; // Không hàng đợi, vượt 30 là từ chối ngay
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Thêm CORS middleware (Phải đặt trước HttpsRedirection và Routing)
app.UseCors("AllowFrontend");

// Bỏ HttpsRedirection trong lúc dev bằng HTTP để tránh lỗi CORS Preflight Redirect
// app.UseHttpsRedirection();

// Thêm Rate Limiter
app.UseRateLimiter();

// Thêm UseAuthentication TRƯỚC UseAuthorization
app.UseAuthentication();
app.UseAuthorization();

// Đăng ký Hangfire Dashboard (Truy cập qua /hangfire)
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    // Cấu hình Authorization cho Dashboard (Tạm thời cho phép truy cập Local)
    // Thực tế cần dùng IAuthorizationFilter để chặn người ngoài
    Authorization = new[] { new Hangfire.Dashboard.LocalRequestsOnlyAuthorizationFilter() }
});

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notification");

app.Run();