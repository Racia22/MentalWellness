using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MentalWellness.API.Models
{
    [Table("MedicalRecords")]
    public class MedicalRecord
    {
        [Key]
        public Guid MedicalRecordId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid PatientId { get; set; }

        [Required]
        public Guid DoctorId { get; set; }

        public Guid? AppointmentId { get; set; }

        public string? SessionNotes { get; set; }

        public string? ChiefComplaint { get; set; }

        public string? Diagnosis { get; set; }

        public string? PrescriptionDetails { get; set; }

        public string? VitalSigns { get; set; } // JSON format

        public string? Attachments { get; set; } // JSON format

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("PatientId")]
        public Patient Patient { get; set; } = null!;

        [ForeignKey("DoctorId")]
        public Doctor Doctor { get; set; } = null!;

        [ForeignKey("AppointmentId")]
        public Appointment? Appointment { get; set; }

        public ICollection<TreatmentPlan> TreatmentPlans { get; set; } = new List<TreatmentPlan>();
    }
}
