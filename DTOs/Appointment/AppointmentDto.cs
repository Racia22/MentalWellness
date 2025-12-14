using System.Text.Json.Serialization;
using MentalWellness.API.Helpers;

namespace MentalWellness.API.DTOs.Appointment;

public class AppointmentDto
{
    public Guid AppointmentId { get; set; }
    public Guid PatientId { get; set; }
    public Guid DoctorId { get; set; }
    public DateTime AppointmentDate { get; set; }
    
    [JsonConverter(typeof(TimeSpanJsonConverter))]
    public TimeSpan AppointmentTime { get; set; }
    public int Duration { get; set; }
    public string AppointmentType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsPaid { get; set; }
    public string? PatientNotes { get; set; }
    public string? CancellationReason { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string DoctorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
