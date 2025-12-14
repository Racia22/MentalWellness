using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.Patient;

public class UpdatePatientDto
{
    [Range(0, 120)]
    public int? Age { get; set; }

    public string? Category { get; set; }

    public string? Gender { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string? Address { get; set; }

    public string? EmergencyContact { get; set; }

    public string? EmergencyContactPhone { get; set; }
}
