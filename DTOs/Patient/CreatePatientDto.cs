using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.Patient;

public class CreatePatientDto
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    [Range(0, 120)]
    public int Age { get; set; }

    [Required]
    public string Category { get; set; } = string.Empty;

    [Required]
    public string Gender { get; set; } = string.Empty;

    [Required]
    public DateTime DateOfBirth { get; set; }

    public string? Address { get; set; }

    public string? EmergencyContact { get; set; }

    public string? EmergencyContactPhone { get; set; }
}
