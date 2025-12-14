using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MentalWellness.API.Models
{
    [Table("Messages")]
    public class Message
    {
        [Key]
        public Guid MessageId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid SenderId { get; set; }

        [Required]
        public Guid ReceiverId { get; set; }

        public Guid? AppointmentId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string MessageBody { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime? ReadAt { get; set; }

        public Guid? ParentMessageId { get; set; }

        public string? Attachments { get; set; } // JSON format

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("SenderId")]
        public User Sender { get; set; } = null!;

        [ForeignKey("ReceiverId")]
        public User Receiver { get; set; } = null!;

        [ForeignKey("AppointmentId")]
        public Appointment? Appointment { get; set; }

        [ForeignKey("ParentMessageId")]
        public Message? ParentMessage { get; set; }

        public ICollection<Message> Replies { get; set; } = new List<Message>();
    }
}
