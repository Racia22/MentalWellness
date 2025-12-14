using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MentalWellness.API.Models
{
    [Table("Doctors")]
    public class Doctor
    {
        [Key]
        public Guid DoctorId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(50)]
        public string DoctorIDNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Specialty { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LicenseNumber { get; set; } = string.Empty;

        public int YearsOfExperience { get; set; } = 0;

        public string? Bio { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ConsultationFee { get; set; } = 0;

        [Column(TypeName = "decimal(3,2)")]
        [Range(0, 5)]
        public decimal AverageRating { get; set; } = 0;

        public int TotalReviews { get; set; } = 0;

        public bool IsApproved { get; set; } = false;

        public Guid? ApprovedBy { get; set; }

        public DateTime? ApprovedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
        public ICollection<TreatmentPlan> TreatmentPlans { get; set; } = new List<TreatmentPlan>();
        public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
    }
}
