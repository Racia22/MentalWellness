using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.Admin;

public class AdminResetPasswordDto
{
    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}

