using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.Feedback;

public class CreateFeedbackDto
{
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
}
