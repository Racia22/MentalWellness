using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MentalWellness.API.Models
{
    [Table("AuditLogs")]
    public class AuditLog
    {
        [Key]
        public Guid AuditLogId { get; set; } = Guid.NewGuid();

        public Guid? UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Action { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string EntityName { get; set; } = string.Empty;

        [Required]
        public Guid EntityId { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public string? OldValues { get; set; } // JSON format

        public string? NewValues { get; set; } // JSON format

        [MaxLength(50)]
        public string? IpAddress { get; set; }

        [MaxLength(500)]
        public string? UserAgent { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
