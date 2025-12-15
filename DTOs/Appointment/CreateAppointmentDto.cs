using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using MentalWellness.API.Helpers;

namespace MentalWellness.API.DTOs.Appointment;

public class CreateAppointmentDto
{
    [Required]
    public Guid PatientId { get; set; }

    [Required]
    public Guid DoctorId { get; set; }

    [Required]
    public DateTime AppointmentDate { get; set; }

    [Required]
    [JsonConverter(typeof(TimeSpanJsonConverter))]
    public TimeSpan AppointmentTime { get; set; }

    [Range(1, int.MaxValue)]
    public int Duration { get; set; } = 60;

    [Required]
    public string AppointmentType { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Amount { get; set; } = 0;

    public string? PatientNotes { get; set; }
}
