using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.Models;
using MentalWellness.API.DTOs.Notification;
using MentalWellness.API.Helpers;

namespace MentalWellness.API.Services;

public class NotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly EmailService _emailService;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        ApplicationDbContext context,
        EmailService emailService,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Notification> CreateNotificationAsync(
        Guid userId,
        string notificationType,
        string entityType,
        Guid? entityId,
        Guid? appointmentId,
        string title,
        string message,
        string? actionUrl = null,
        string priority = "Normal",
        DateTime? expiresAt = null)
    {
        var now = DateTime.UtcNow;
        var notification = new Notification
        {
            NotificationId = Guid.NewGuid(),
            UserId = userId,
            NotificationType = notificationType,
            EntityType = entityType,
            EntityId = entityId,
            AppointmentId = appointmentId,
            Title = title,
            Message = message,
            ActionUrl = actionUrl,
            Priority = priority,
            IsSent = true, // Automatically set to true as per requirements
            SentAt = now, // Automatically set to now as per requirements
            IsRead = false,
            ReadAt = null,
            ExpiresAt = expiresAt,
            CreatedAt = now
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Notification created: Type={Type}, UserId={UserId}, Title={Title}", 
            notificationType, userId, title);

        // Send email if configured (optional, for Email notification type)
        if (notificationType == "Email")
        {
            await SendEmailNotificationAsync(notification);
        }

        return notification;
    }

    public async Task SendEmailNotificationAsync(Notification notification)
    {
        try
        {
            var user = await _context.Users.FindAsync(notification.UserId);
            if (user == null || string.IsNullOrEmpty(user.Email))
                return;

            var success = await _emailService.SendEmailAsync(
                user.Email,
                notification.Title,
                notification.Message
            );

            if (success)
            {
                notification.IsSent = true;
                notification.SentAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email notification {NotificationId}", notification.NotificationId);
        }
    }

    public async Task NotifyAppointmentCreatedAsync(Guid userId, Guid appointmentId, DateTime appointmentDate, TimeSpan appointmentTime, string doctorName)
    {
        var title = NotificationHelper.GenerateNotificationTitle("Appointment", "Created");
        var message = NotificationHelper.GenerateNotificationMessage(
            "Appointment",
            "Created",
            $"Your appointment with Dr. {doctorName} is scheduled for {appointmentDate:dd MMM yyyy} at {appointmentTime:hh\\:mm}"
        );

        await CreateNotificationAsync(
            userId,
            "Email",
            "Appointment",
            appointmentId,
            appointmentId,
            title,
            message,
            priority: "High"
        );
    }

    public async Task NotifyAppointmentCancelledAsync(Guid userId, Guid appointmentId, string reason)
    {
        var title = NotificationHelper.GenerateNotificationTitle("Appointment", "Cancelled");
        var message = NotificationHelper.GenerateNotificationMessage(
            "Appointment",
            "Cancelled",
            $"Your appointment has been cancelled. Reason: {reason}"
        );

        await CreateNotificationAsync(
            userId,
            "Email",
            "Appointment",
            appointmentId,
            appointmentId,
            title,
            message,
            priority: "High"
        );
    }

    public async Task NotifyPaymentCompletedAsync(Guid userId, Guid paymentId, decimal amount, string transactionRef)
    {
        var title = NotificationHelper.GenerateNotificationTitle("Payment", "Completed");
        var message = NotificationHelper.GenerateNotificationMessage(
            "Payment",
            "Completed",
            $"Your payment of RWF {amount:N2} has been processed. Transaction: {transactionRef}"
        );

        await CreateNotificationAsync(
            userId,
            "Email",
            "Payment",
            paymentId,
            null,
            title,
            message
        );
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId, bool? isRead = null)
    {
        var query = _context.Notifications
            .Where(n => n.UserId == userId)
            .AsQueryable();

        if (isRead.HasValue)
            query = query.Where(n => n.IsRead == isRead.Value);

        return await query
            .Select(n => new NotificationDto
            {
                NotificationId = n.NotificationId,
                UserId = n.UserId,
                NotificationType = n.NotificationType,
                EntityType = n.EntityType,
                EntityId = n.EntityId,
                AppointmentId = n.AppointmentId,
                Title = n.Title,
                Message = n.Message,
                ActionUrl = n.ActionUrl,
                Priority = n.Priority,
                IsSent = n.IsSent,
                SentAt = n.SentAt,
                IsRead = n.IsRead,
                ReadAt = n.ReadAt,
                ExpiresAt = n.ExpiresAt,
                CreatedAt = n.CreatedAt
            })
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }
}
