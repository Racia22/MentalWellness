namespace MentalWellness.API.DTOs.Feedback;

public class FeedbackDto
{
    public Guid FeedbackId { get; set; }
    public Guid PatientId { get; set; }
    public Guid DoctorId { get; set; }
    public Guid? AppointmentId { get; set; }
    public int Rating { get; set; }
    public string? ReviewTitle { get; set; }
    public string? ReviewText { get; set; }
    public bool IsAnonymous { get; set; }
    public bool IsApproved { get; set; }
    public string? DoctorResponse { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string DoctorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
