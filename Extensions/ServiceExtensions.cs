using MentalWellness.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MentalWellness.API.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                sqlOptions => sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(30),
                    errorNumbersToAdd: null)
            ));

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Authentication & Authorization Services
        services.AddScoped<Services.AuthService>();

        // Core Services
        services.AddScoped<Services.PatientService>();
        services.AddScoped<Services.DoctorService>();
        services.AddScoped<Services.AppointmentService>();
        services.AddScoped<Services.PaymentService>();
        services.AddScoped<Services.MedicalRecordService>();
        services.AddScoped<Services.TreatmentPlanService>();
        services.AddScoped<Services.MoodLogService>();
        services.AddScoped<Services.FeedbackService>();
        services.AddScoped<Services.MessageService>();
        services.AddScoped<Services.NotificationService>();
        services.AddScoped<Services.AdminService>();

        // Payment Services
        services.AddScoped<Services.MoMoService>();
        services.AddScoped<Services.AirtelMoneyService>();

        // Email Service
        services.AddScoped<Services.EmailService>();

        // Invoice Service
        services.AddScoped<Services.InvoiceService>();

        // Background Services
        services.AddHostedService<Services.AppointmentReminderService>();

        // Helpers
        services.AddSingleton<Helpers.JwtHelper>();

        return services;
    }

    public static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration configuration)
    {
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
        
        if (allowedOrigins != null && allowedOrigins.Length > 0)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials()
                          .SetPreflightMaxAge(TimeSpan.FromSeconds(3600));
                });
            });
        }
        else
        {
            // Fallback: Allow all origins for development
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });
        }

        return services;
    }
}
