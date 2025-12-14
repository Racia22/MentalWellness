using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.Models;
using MentalWellness.API.DTOs.Message;

namespace MentalWellness.API.Services;

public class MessageService
{
    private readonly ApplicationDbContext _context;
    private readonly NotificationService _notificationService;
    private readonly ILogger<MessageService> _logger;

    public MessageService(
        ApplicationDbContext context,
        NotificationService notificationService,
        ILogger<MessageService> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<List<MessageDto>> GetUserMessagesAsync(Guid userId)
    {
        return await _context.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
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
    }

    public async Task<MessageDto> SendMessageAsync(Guid senderId, SendMessageDto dto)
    {
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

        // Send notification
        await _notificationService.CreateNotificationAsync(
            dto.ReceiverId,
            "InApp",
            "Message",
            message.MessageId,
            dto.AppointmentId,
            "New Message",
            $"You have received a new message: {dto.Subject}",
            priority: "Normal"
        );

        var sender = await _context.Users.FindAsync(senderId);
        var receiver = await _context.Users.FindAsync(dto.ReceiverId);

        return new MessageDto
        {
            MessageId = message.MessageId,
            SenderId = message.SenderId,
            ReceiverId = message.ReceiverId,
            AppointmentId = message.AppointmentId,
            Subject = message.Subject,
            MessageBody = message.MessageBody,
            IsRead = message.IsRead,
            ParentMessageId = message.ParentMessageId,
            Attachments = message.Attachments,
            SenderName = sender?.FullName ?? string.Empty,
            ReceiverName = receiver?.FullName ?? string.Empty,
            CreatedAt = message.CreatedAt
        };
    }

    public async Task<bool> MarkAsReadAsync(Guid messageId, Guid userId)
    {
        var message = await _context.Messages
            .FirstOrDefaultAsync(m => m.MessageId == messageId && m.ReceiverId == userId);

        if (message == null || message.IsRead)
            return false;

        message.IsRead = true;
        message.ReadAt = DateTime.UtcNow;
        message.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }
}
