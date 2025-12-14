using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.DTOs.Notification;
using MentalWellness.API.DTOs.Common;
using MentalWellness.API.Models;
using MentalWellness.API.Services;

namespace MentalWellness.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class NotificationController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly NotificationService _notificationService;
    private readonly ILogger<NotificationController> _logger;

    public NotificationController(
        ApplicationDbContext context, 
        NotificationService notificationService,
        ILogger<NotificationController> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllNotifications([FromQuery] bool? isRead = null)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var notifications = await _notificationService.GetUserNotificationsAsync(userId, isRead);
            return Ok(notifications);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notifications");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetNotification(Guid id)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == id && n.UserId == userId);

            if (notification == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Notification not found" });
            }

            // Mark as read
            if (!notification.IsRead)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            var notificationDto = new NotificationDto
            {
                NotificationId = notification.NotificationId,
                UserId = notification.UserId,
                NotificationType = notification.NotificationType,
                EntityType = notification.EntityType,
                EntityId = notification.EntityId,
                AppointmentId = notification.AppointmentId,
                Title = notification.Title,
                Message = notification.Message,
                ActionUrl = notification.ActionUrl,
                Priority = notification.Priority,
                IsSent = notification.IsSent,
                SentAt = notification.SentAt,
                IsRead = notification.IsRead,
                ReadAt = notification.ReadAt,
                ExpiresAt = notification.ExpiresAt,
                CreatedAt = notification.CreatedAt
            };

            return Ok(notificationDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notification {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == id && n.UserId == userId);

            if (notification == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Notification not found" });
            }

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Notification marked as read" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification as read {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost("mark-all-read")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = $"{notifications.Count} notifications marked as read" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking all notifications as read");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(new { UnreadCount = count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting unread count");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }
}
