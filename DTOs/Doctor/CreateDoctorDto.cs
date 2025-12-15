using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.Doctor;

public class CreateDoctorDto
{
    [Required]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(255)]
    public string Specialty { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LicenseNumber { get; set; } = string.Empty;

    public int YearsOfExperience { get; set; } = 0;

    public string? Bio { get; set; }

    [Range(0, double.MaxValue)]
    public decimal ConsultationFee { get; set; } = 0;
}
