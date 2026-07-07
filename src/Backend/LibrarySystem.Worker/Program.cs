using Hangfire;
using LibrarySystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using LibrarySystem.Worker.Jobs;
using LibrarySystem.Worker.Services;
using LibrarySystem.Infrastructure.Search;
using LibrarySystem.Application.Interfaces;
using System;

var builder = Host.CreateApplicationBuilder(args);

// Cấu hình ConnectionString
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost,1433;Database=UniversityLibraryDb;User Id=sa;Password=SuperStrongPassword123!;TrustServerCertificate=True;MultipleActiveResultSets=true;";

// Đăng ký ApplicationDbContext cho Worker
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Cấu hình Hangfire sử dụng SQL Server
builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(connectionString));

// Kích hoạt Hangfire Server (đây là nơi xử lý các Job)
builder.Services.AddHangfireServer();

// Đăng ký Job
builder.Services.AddTransient<FineCalculationJob>();
builder.Services.AddTransient<ISearchIndexerJob, SearchIndexingJob>();
builder.Services.AddTransient<OverdueClaimingJob>();
builder.Services.AddTransient<SushiHarvestJob>();
builder.Services.AddTransient<AssetProcessingJob>();

// Đăng ký Elasticsearch Service
builder.Services.AddSingleton<IElasticsearchService, ElasticsearchService>();

// Cấu hình HttpClient cho Webhook
builder.Services.AddHttpClient();

// Đăng ký RabbitMQ Listener
builder.Services.AddHostedService<RabbitMqListenerService>();

builder.Services.AddHttpClient();
builder.Services.AddScoped<LibrarySystem.Application.Interfaces.ISushiHarvestService, LibrarySystem.Infrastructure.Services.Erm.SushiHarvestService>();

// Đăng ký SIP2 & RFID Ecosystem
builder.Services.AddSingleton<RfidHardwareController>();
builder.Services.AddScoped<LibrarySystem.Application.Interfaces.IPhysicalItemService, LibrarySystem.Infrastructure.Services.Circulation.PhysicalItemService>();
builder.Services.AddScoped<Sip2Handler>();
builder.Services.AddHostedService<Sip2SocketServerService>();

var host = builder.Build();

// Lên lịch Job chạy tự động lúc 00:00 mỗi ngày
using (var scope = host.Services.CreateScope())
{
    var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();
    recurringJobManager.AddOrUpdate<FineCalculationJob>(
        "CalculateFinesDaily",
        job => job.ExecuteAsync(),
        Cron.Daily // Chạy mỗi ngày vào lúc 0h sáng
    );
    
    recurringJobManager.AddOrUpdate<OverdueClaimingJob>(
        "OverdueClaimingDaily",
        job => job.ExecuteAsync(),
        Cron.Daily 
    );

    recurringJobManager.AddOrUpdate<SushiHarvestJob>(
        "sushi-harvest-job",
        job => job.ExecuteAsync(),
        Cron.Monthly); // Chạy vào ngày mùng 1 mỗi tháng
}

host.Run();
