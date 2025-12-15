using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MentalWellness.API.Models
{
    [Table("Notifications")]
    public class Notification
    {
        [Key]
        public Guid NotificationId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string NotificationType { get; set; } = string.Empty; // Email, SMS, InApp, Push

        [Required]
        [MaxLength(50)]
        public string EntityType { get; set; } = string.Empty; // Appointment, Payment, MedicalRecord, etc.

        public Guid? EntityId { get; set; }

        public Guid? AppointmentId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ActionUrl { get; set; }

        [Required]
        [MaxLength(20)]
        public string Priority { get; set; } = "Normal"; // Low, Normal, High, Urgent

        public bool IsSent { get; set; } = false;

        public DateTime? SentAt { get; set; }

        public bool IsRead { get; set; } = false;

        public DateTime? ReadAt { get; set; }

        public DateTime? ExpiresAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        [ForeignKey("AppointmentId")]
        public Appointment? Appointment { get; set; }
    }
}
