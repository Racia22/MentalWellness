namespace MentalWellness.API.DTOs.Message;

public class MessageDto
{
    public Guid MessageId { get; set; }
    public Guid SenderId { get; set; }
    public Guid ReceiverId { get; set; }
    public Guid? AppointmentId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string MessageBody { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public Guid? ParentMessageId { get; set; }
    public string? Attachments { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string ReceiverName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
