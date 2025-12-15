using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.MedicalRecord;

public class CreateMedicalRecordDto
{
    [Required]
    public Guid PatientId { get; set; }

    [Required]
    public Guid DoctorId { get; set; }

    public Guid? AppointmentId { get; set; }

    public string? SessionNotes { get; set; }

    public string? ChiefComplaint { get; set; }

    public string? Diagnosis { get; set; }

    public string? PrescriptionDetails { get; set; }

    public string? VitalSigns { get; set; }

    public string? Attachments { get; set; }
}
