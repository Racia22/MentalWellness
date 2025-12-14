using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.Appointment;

public class UpdateAppointmentDto
{
    public DateTime? AppointmentDate { get; set; }

    public TimeSpan? AppointmentTime { get; set; }

    [Range(1, int.MaxValue)]
    public int? Duration { get; set; }

    public string? AppointmentType { get; set; }

    public string? Status { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? Amount { get; set; }

    public string? PatientNotes { get; set; }

    public string? CancellationReason { get; set; }
}
