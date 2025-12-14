using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.Auth;

public class UpdateUserProfileDto
{
    [MaxLength(255)]
    public string? FullName { get; set; }

    [EmailAddress]
    [MaxLength(255)]
    public string? Email { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(500)]
    public string? ProfileImage { get; set; }
}

