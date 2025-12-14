using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.Models;
using MentalWellness.API.DTOs.Auth;
using MentalWellness.API.Helpers;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace MentalWellness.API.Services;

public class AuthService
{
    private readonly ApplicationDbContext _context;
    private readonly JwtHelper _jwtHelper;
    private readonly EmailService _emailService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(ApplicationDbContext context, JwtHelper jwtHelper, EmailService emailService, ILogger<AuthService> logger)
    {
        _context = context;
        _jwtHelper = jwtHelper;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
    {
        // Log login attempt for debugging
        _logger.LogInformation("Login attempt for email: {Email}", request.Email);
        
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            _logger.LogWarning("Login failed: User not found for email: {Email}", request.Email);
            return null;
        }

        // Check if user is active
        if (!user.IsActive)
        {
            _logger.LogWarning("Login failed: User {Email} is inactive", request.Email);
            return null;
        }

        // Verify password
        if (!PasswordHelper.VerifyPassword(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Login failed: Invalid password for email: {Email}", request.Email);
            return null;
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = _jwtHelper.GenerateToken(user.UserId, user.Email, user.UserRole, user.FullName);
        var expirationMinutes = 60; // Default or from config

        _logger.LogInformation("Login successful for user: {Email}, Role: {Role}, UserId: {UserId}", 
            user.Email, user.UserRole, user.UserId);

        return new LoginResponseDto
        {
            Token = token,
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            UserRole = user.UserRole,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes)
        };
    }

    public async Task<User?> RegisterAsync(RegisterRequestDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return null; // Email already exists
        }

        // Validate UserRole
        var validRoles = new[] { "Patient", "Doctor", "Admin" };
        var normalizedRole = request.UserRole?.Trim();
        if (string.IsNullOrEmpty(normalizedRole) || !validRoles.Any(r => r.Equals(normalizedRole, StringComparison.OrdinalIgnoreCase)))
        {
            throw new ArgumentException($"Invalid UserRole. Must be one of: {string.Join(", ", validRoles)}");
        }
        
        // Normalize to exact case
        normalizedRole = validRoles.First(r => r.Equals(normalizedRole, StringComparison.OrdinalIgnoreCase));

        var passwordHash = PasswordHelper.HashPassword(request.Password);
        var passwordSalt = PasswordHelper.GenerateSalt();

        var user = new User
        {
            Email = request.Email.Trim(),
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            UserRole = normalizedRole, // Use normalized role
            FullName = request.FullName.Trim(),
            Phone = request.Phone.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("User created: {Email}, UserId: {UserId}, Role: {Role}", 
            user.Email, user.UserId, user.UserRole);

        // If registering as Patient, automatically create Patient profile
        if (normalizedRole == "Patient")
        {
            try
            {
                // Generate Patient ID Number
                var lastNumber = await _context.Patients
                    .Where(p => p.PatientIDNumber.StartsWith("PAT-"))
                    .Select(p => p.PatientIDNumber)
                    .ToListAsync();

                int nextNumber = 1;
                if (lastNumber.Any())
                {
                    var numbers = lastNumber
                        .Select(n => int.TryParse(n.Substring(4), out var num) ? num : 0)
                        .Where(n => n > 0);
                    nextNumber = numbers.Any() ? numbers.Max() + 1 : 1;
                }

                var patientIdNumber = $"PAT-{nextNumber:D6}";

                // Calculate age from phone number or use default (will need to be updated later)
                // For now, we'll use a default age - patient can update their profile later
                var patient = new Patient
                {
                    PatientId = Guid.NewGuid(),
                    UserId = user.UserId,
                    PatientIDNumber = patientIdNumber,
                    Age = 25, // Default age - patient should update profile
                    Category = "Individual", // Default category
                    Gender = "Prefer not to say", // Default gender
                    DateOfBirth = DateTime.UtcNow.AddYears(-25), // Default DOB based on age
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Patients.Add(patient);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("✅ Patient profile created successfully: Email={Email}, UserId={UserId}, PatientId={PatientId}, PatientIDNumber={PatientIDNumber}", 
                    user.Email, user.UserId, patient.PatientId, patient.PatientIDNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Failed to create Patient profile for user: {Email}, UserId: {UserId}", 
                    user.Email, user.UserId);
                // Don't throw - user is created, patient profile can be created later
                // But log the error for debugging
            }
        }

        return user;
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !PasswordHelper.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            return false;
        }

        user.PasswordHash = PasswordHelper.HashPassword(request.NewPassword);
        user.PasswordSalt = PasswordHelper.GenerateSalt();
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

        // Always return true to prevent email enumeration
        if (user == null)
        {
            _logger.LogWarning("Password reset requested for non-existent email: {Email}", request.Email);
            return true;
        }

        // Generate reset token
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpires = DateTime.UtcNow.AddHours(1); // Token valid for 1 hour
        await _context.SaveChangesAsync();

        // Get frontend URL from configuration or use default
        var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5175";
        var resetUrl = $"{frontendUrl}/reset-password?token={token}&email={Uri.EscapeDataString(user.Email)}";

        // Send email
        var emailSent = await _emailService.SendPasswordResetEmailAsync(user.Email, user.FullName, resetUrl);

        // Always log the reset link to console for easy testing (especially in development)
        _logger.LogInformation("🔗 Password Reset Link for {Email}: {ResetUrl}", user.Email, resetUrl);
        var separator = new string('=', 80);
        Console.WriteLine($"\n{separator}");
        Console.WriteLine($"🔗 PASSWORD RESET LINK (Copy this link to test):");
        Console.WriteLine($"{resetUrl}");
        Console.WriteLine($"Token: {token}");
        Console.WriteLine($"Email: {user.Email}");
        Console.WriteLine($"Expires: {user.PasswordResetTokenExpires}");
        Console.WriteLine($"{separator}\n");

        if (!emailSent)
        {
            _logger.LogWarning("Failed to send password reset email to {Email}. Reset link is available above.", user.Email);
            // Still return true to prevent email enumeration
        }

        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordDto request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && 
                                      u.PasswordResetToken == request.Token &&
                                      u.PasswordResetTokenExpires != null &&
                                      u.PasswordResetTokenExpires > DateTime.UtcNow &&
                                      u.IsActive);

        if (user == null)
        {
            return false;
        }

        // Update password
        user.PasswordHash = PasswordHelper.HashPassword(request.NewPassword);
        user.PasswordSalt = PasswordHelper.GenerateSalt();
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpires = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }
}
