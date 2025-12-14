namespace MentalWellness.API.DTOs.Patient;

public class PatientDto
{
    public Guid PatientId { get; set; }
    public Guid UserId { get; set; }
    public string PatientIDNumber { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
