using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.Message;

public class SendMessageDto
{
    [Required]
    public Guid ReceiverId { get; set; }

    public Guid? AppointmentId { get; set; }

    [MaxLength(255)]
    public string Subject { get; set; } = "Message";

    [Required]
    public string MessageBody { get; set; } = string.Empty;

    public Guid? ParentMessageId { get; set; }

    public string? Attachments { get; set; }
}
