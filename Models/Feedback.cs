using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MentalWellness.API.Models
{
    [Table("Feedback")]
    public class Feedback
    {
        [Key]
        public Guid FeedbackId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid PatientId { get; set; }

        [Required]
        public Guid DoctorId { get; set; }

        public Guid? AppointmentId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(255)]
        public string? ReviewTitle { get; set; }

        public string? ReviewText { get; set; }

        public bool IsAnonymous { get; set; } = false;

        public bool IsApproved { get; set; } = false;

        public Guid? ApprovedBy { get; set; }

        public DateTime? ApprovedAt { get; set; }

        public string? DoctorResponse { get; set; }

        public DateTime? RespondedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("PatientId")]
        public Patient Patient { get; set; } = null!;

        [ForeignKey("DoctorId")]
        public Doctor Doctor { get; set; } = null!;

        [ForeignKey("AppointmentId")]
        public Appointment? Appointment { get; set; }
    }
}
