namespace MentalWellness.API.DTOs.Auth;

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}
