using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.DTOs.Message;
using MentalWellness.API.DTOs.Common;
using MentalWellness.API.Models;
using MentalWellness.API.Services;

namespace MentalWellness.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Microsoft.AspNetCore.Authorization.Authorize]
public class MessageController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MessageController> _logger;
    private readonly NotificationService _notificationService;

    public MessageController(
        ApplicationDbContext context, 
        ILogger<MessageController> logger,
        NotificationService notificationService)
    {
        _context = context;
        _logger = logger;
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllMessages([FromQuery] Guid? senderId = null, [FromQuery] Guid? receiverId = null)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            var query = _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .AsQueryable();

            // If both senderId and receiverId are provided, get conversation between them
            if (senderId.HasValue && receiverId.HasValue)
            {
                // Get messages where (sender = senderId AND receiver = receiverId) OR (sender = receiverId AND receiver = senderId)
                query = query.Where(m => 
                    (m.SenderId == senderId.Value && m.ReceiverId == receiverId.Value) ||
                    (m.SenderId == receiverId.Value && m.ReceiverId == senderId.Value)
                );
            }
            else
            {
                if (senderId.HasValue)
                    query = query.Where(m => m.SenderId == senderId.Value);

                if (receiverId.HasValue)
                    query = query.Where(m => m.ReceiverId == receiverId.Value);
            }

            // Only show messages where current user is sender or receiver
            query = query.Where(m => m.SenderId == currentUserId || m.ReceiverId == currentUserId);

            var messages = await query
                .Select(m => new MessageDto
                {
                    MessageId = m.MessageId,
                    SenderId = m.SenderId,
                    ReceiverId = m.ReceiverId,
                    AppointmentId = m.AppointmentId,
                    Subject = m.Subject,
                    MessageBody = m.MessageBody,
                    IsRead = m.IsRead,
                    ReadAt = m.ReadAt,
                    ParentMessageId = m.ParentMessageId,
                    Attachments = m.Attachments,
                    SenderName = m.Sender.FullName,
                    ReceiverName = m.Receiver.FullName,
                    CreatedAt = m.CreatedAt
                })
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return Ok(messages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting messages");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMessage(Guid id)
    {
        try
        {
            var message = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .FirstOrDefaultAsync(m => m.MessageId == id);

            if (message == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Message not found" });
            }

            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            // Mark as read if current user is receiver
            if (message.ReceiverId == currentUserId && !message.IsRead)
            {
                message.IsRead = true;
                message.ReadAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            var messageDto = new MessageDto
            {
                MessageId = message.MessageId,
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                AppointmentId = message.AppointmentId,
                Subject = message.Subject,
                MessageBody = message.MessageBody,
                IsRead = message.IsRead,
                ReadAt = message.ReadAt,
                ParentMessageId = message.ParentMessageId,
                Attachments = message.Attachments,
                SenderName = message.Sender.FullName,
                ReceiverName = message.Receiver.FullName,
                CreatedAt = message.CreatedAt
            };

            return Ok(messageDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting message {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var senderId))
            {
                return Unauthorized();
            }

            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = dto.ReceiverId,
                AppointmentId = dto.AppointmentId,
                Subject = dto.Subject,
                MessageBody = dto.MessageBody,
                ParentMessageId = dto.ParentMessageId,
                Attachments = dto.Attachments,
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Create notification for receiver
            try
            {
                _logger.LogInformation("Creating notification for message {MessageId} to receiver {ReceiverId}", 
                    message.MessageId, dto.ReceiverId);
                
                var sender = await _context.Users.FindAsync(senderId);
                var receiver = await _context.Users.FindAsync(dto.ReceiverId);
                
                if (sender == null)
                {
                    _logger.LogWarning("Sender {SenderId} not found, cannot create notification", senderId);
                }
                else if (receiver == null)
                {
                    _logger.LogWarning("Receiver {ReceiverId} not found, cannot create notification", dto.ReceiverId);
                }
                else
                {
                    _logger.LogInformation("Sender: {SenderName} ({SenderRole}), Receiver: {ReceiverName} ({ReceiverRole})", 
                        sender.FullName, sender.UserRole, receiver.FullName, receiver.UserRole);
                    
                    // Determine role-based action URL
                    string actionUrl;
                    if (receiver.UserRole == "Patient")
                    {
                        actionUrl = $"/patient/messages/{senderId}";
                    }
                    else if (receiver.UserRole == "Doctor")
                    {
                        actionUrl = $"/doctor/messages/{senderId}";
                    }
                    else
                    {
                        actionUrl = $"/admin/messages/{senderId}";
                    }

                    // Create notification based on sender role
                    string notificationMessage;
                    if (sender.UserRole == "Doctor")
                    {
                        notificationMessage = $"You have a new message from Dr. {sender.FullName}";
                    }
                    else if (sender.UserRole == "Patient")
                    {
                        notificationMessage = $"New message from patient {sender.FullName}";
                    }
                    else
                    {
                        notificationMessage = $"New message from {sender.FullName}";
                    }

                    _logger.LogInformation("Creating notification: Type=NewMessage, UserId={UserId}, Title=New Message", dto.ReceiverId);
                    
                    var notification =                     await _notificationService.CreateNotificationAsync(
                        userId: dto.ReceiverId,
                        notificationType: "InApp", // Changed from "NewMessage" to "InApp" to match database constraint
                        entityType: "Message",
                        entityId: message.MessageId,
                        appointmentId: dto.AppointmentId,
                        title: "New Message",
                        message: notificationMessage,
                        actionUrl: actionUrl,
                        priority: "Normal"
                    );
                    
                    _logger.LogInformation("✅ Notification created successfully: {NotificationId} for user {UserId}", 
                        notification.NotificationId, dto.ReceiverId);
                }
            }
            catch (Exception notifEx)
            {
                // Log but don't fail the message send
                _logger.LogError(notifEx, "❌ Failed to create notification for message {MessageId}: {Error}", 
                    message.MessageId, notifEx.Message);
                _logger.LogError(notifEx, "Stack trace: {StackTrace}", notifEx.StackTrace);
            }

            return CreatedAtAction(nameof(GetMessage), new { id = message.MessageId }, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message: {Message}", ex.Message);
            if (ex.InnerException != null)
            {
                _logger.LogError(ex.InnerException, "Inner exception: {Message}", ex.InnerException.Message);
            }
            return StatusCode(500, new ErrorResponse 
            { 
                StatusCode = 500, 
                Message = $"Error sending message: {ex.Message}" 
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMessage(Guid id, [FromBody] SendMessageDto dto)
    {
        try
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Message not found" });
            }

            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            // Only sender can update their message
            if (message.SenderId != currentUserId)
            {
                return Forbid();
            }

            if (!string.IsNullOrEmpty(dto.Subject)) message.Subject = dto.Subject;
            if (!string.IsNullOrEmpty(dto.MessageBody)) message.MessageBody = dto.MessageBody;
            if (dto.Attachments != null) message.Attachments = dto.Attachments;
            message.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating message {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMessage(Guid id)
    {
        try
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Message not found" });
            }

            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            // Only sender or receiver can delete
            if (message.SenderId != currentUserId && message.ReceiverId != currentUserId)
            {
                return Forbid();
            }

            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting message {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }
}
