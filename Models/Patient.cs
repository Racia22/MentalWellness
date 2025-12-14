using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MentalWellness.API.Models
{
    [Table("Patients")]
    public class Patient
    {
        [Key]
        public Guid PatientId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string PatientIDNumber { get; set; } = string.Empty;

        [Required]
        [Range(0, 120)]
        public int Age { get; set; }

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty; // Individual, Couple, Teenager

        [Required]
        [MaxLength(20)]
        public string Gender { get; set; } = string.Empty; // Male, Female, Other, Prefer not to say

        [Required]
        public DateTime DateOfBirth { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(255)]
        public string? EmergencyContact { get; set; }

        [MaxLength(20)]
        public string? EmergencyContactPhone { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
        public ICollection<TreatmentPlan> TreatmentPlans { get; set; } = new List<TreatmentPlan>();
        public ICollection<MoodLog> MoodLogs { get; set; } = new List<MoodLog>();
        public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
    }
}
