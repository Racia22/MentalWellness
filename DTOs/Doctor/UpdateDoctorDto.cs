using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.Doctor;

public class UpdateDoctorDto
{
    [MaxLength(255)]
    public string? Specialty { get; set; }

    [MaxLength(100)]
    public string? LicenseNumber { get; set; }

    public int? YearsOfExperience { get; set; }

    public string? Bio { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? ConsultationFee { get; set; }
}
