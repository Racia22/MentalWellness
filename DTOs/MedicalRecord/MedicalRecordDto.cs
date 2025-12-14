namespace MentalWellness.API.DTOs.MedicalRecord;

public class MedicalRecordDto
{
    public Guid MedicalRecordId { get; set; }
    public Guid PatientId { get; set; }
    public Guid DoctorId { get; set; }
    public Guid? AppointmentId { get; set; }
    public string? SessionNotes { get; set; }
    public string? ChiefComplaint { get; set; }
    public string? Diagnosis { get; set; }
    public string? PrescriptionDetails { get; set; }
    public string? VitalSigns { get; set; }
    public string? Attachments { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string DoctorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
