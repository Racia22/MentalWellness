using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.TreatmentPlan;

public class CreateTreatmentPlanDto
{
    [Required]
    public Guid PatientId { get; set; }

    [Required]
    public Guid DoctorId { get; set; }

    public Guid? AppointmentId { get; set; }

    public Guid? MedicalRecordId { get; set; }

    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Goals { get; set; }

    public string? Tasks { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }
}
