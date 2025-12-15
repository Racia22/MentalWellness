using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MentalWellness.API.Data;
using MentalWellness.API.Models;

namespace MentalWellness.API.Services;

public class AppointmentReminderService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AppointmentReminderService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5); // Check every 5 minutes

    public AppointmentReminderService(
        IServiceProvider serviceProvider,
        ILogger<AppointmentReminderService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AppointmentReminderService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndSendRemindersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AppointmentReminderService");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("AppointmentReminderService stopped");
    }

    private async Task CheckAndSendRemindersAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var notificationService = scope.ServiceProvider.GetRequiredService<NotificationService>();

        try
        {
            var now = DateTime.UtcNow;
            
            // Window: 55 minutes to 65 minutes from now (1 hour ± 5 minutes)
            var windowStart = now.AddMinutes(55);
            var windowEnd = now.AddMinutes(65);
            
            // Calculate target date and time range for SQL translation
            var targetDate = windowStart.Date;
            var targetTimeStart = windowStart.TimeOfDay;
            var targetTimeEnd = windowEnd.TimeOfDay;

            // Find appointments starting in approximately 1 hour (within 5-minute window)
            // and that haven't had a reminder sent yet
            var appointmentsNeedingReminders = await context.Appointments
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Notifications)
                .Where(a => 
                    a.Status == "Scheduled" &&
                    a.AppointmentDate.Date == targetDate &&
                    a.AppointmentTime >= targetTimeStart &&
                    a.AppointmentTime <= targetTimeEnd &&
                    // Ensure no reminder has been sent for this appointment
                    !a.Notifications.Any(n => n.NotificationType == "AppointmentReminder" && n.AppointmentId == a.AppointmentId)
                )
                .ToListAsync();
            
            // Additional filter in memory to ensure exact 1-hour window
            appointmentsNeedingReminders = appointmentsNeedingReminders
                .Where(a => 
                {
                    var appointmentDateTime = a.AppointmentDate.Date.Add(a.AppointmentTime);
                    return appointmentDateTime >= windowStart && appointmentDateTime <= windowEnd;
                })
                .ToList();

            _logger.LogInformation("Found {Count} appointments needing reminders", appointmentsNeedingReminders.Count);

            foreach (var appointment in appointmentsNeedingReminders)
            {
                try
                {
                    if (appointment.Patient?.User != null)
                    {
                        await notificationService.CreateNotificationAsync(
                            userId: appointment.Patient.UserId,
                            notificationType: "AppointmentReminder",
                            entityType: "Appointment",
                            entityId: appointment.AppointmentId,
                            appointmentId: appointment.AppointmentId,
                            title: "Appointment Reminder",
                            message: $"Reminder: Your appointment with Dr. {appointment.Doctor?.User?.FullName ?? "Doctor"} starts in 1 hour",
                            actionUrl: $"/patient/appointments/{appointment.AppointmentId}",
                            priority: "High"
                        );

                        _logger.LogInformation("Reminder sent for appointment {AppointmentId} to patient {PatientId}", 
                            appointment.AppointmentId, appointment.Patient.UserId);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send reminder for appointment {AppointmentId}", appointment.AppointmentId);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking for appointment reminders");
        }
    }
}

