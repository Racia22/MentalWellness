using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MentalWellness.API.DTOs.Auth;
using MentalWellness.API.Services;
using MentalWellness.API.DTOs.Common;
using MentalWellness.API.Data;
using Microsoft.AspNetCore.Cors;

namespace MentalWellness.API.Controllers;

[ApiController]
[Route("api/[controller]")]

public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AuthService authService, ApplicationDbContext context, ILogger<AuthController> logger)
    {
        _authService = authService;
        _context = context;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            _logger.LogInformation("Login request received for email: {Email}", request.Email);
            
            var response = await _authService.LoginAsync(request);
            if (response == null)
            {
                _logger.LogWarning("Login failed for email: {Email} - Invalid credentials or inactive account", request.Email);
                return Unauthorized(new ErrorResponse
                {
                    StatusCode = 401,
                    Message = "Invalid email or password, or account is inactive"
                });
            }

            _logger.LogInformation("Login successful for user: {Email}, Role: {Role}", response.Email, response.UserRole);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred during login"
            });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = string.Join(", ", errors)
                });
            }

            var user = await _authService.RegisterAsync(request);
            if (user == null)
            {
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = "Email already exists"
                });
            }

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid registration request");
            return BadRequest(new ErrorResponse
            {
                StatusCode = 400,
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred during registration"
            });
        }
    }

    [HttpPost("change-password")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var success = await _authService.ChangePasswordAsync(userId, request);
            if (!success)
            {
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = "Invalid current password"
                });
            }

            return Ok(new { Message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while changing password"
            });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = string.Join(", ", errors)
                });
            }

            await _authService.ForgotPasswordAsync(request);
            
            // Always return success to prevent email enumeration
            return Ok(new { Message = "If an account with that email exists, password reset instructions have been sent." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing forgot password request");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred processing your request"
            });
        }
    }

    [HttpPut("profile")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = string.Join(", ", errors)
                });
            }

            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new ErrorResponse { StatusCode = 401, Message = "Unauthorized" });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "User not found" });
            }

            // Update only provided fields
            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                user.FullName = request.FullName;
            }
            
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                // Check if email is already taken by another user
                var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email && u.UserId != userId);
                if (emailExists)
                {
                    return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Email is already in use" });
                }
                user.Email = request.Email;
            }
            
            if (!string.IsNullOrWhiteSpace(request.Phone))
            {
                user.Phone = request.Phone;
            }
            
            if (request.ProfileImage != null)
            {
                user.ProfileImage = request.ProfileImage;
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Return updated user without password hash
            return Ok(new
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = user.FullName,
                Phone = user.Phone,
                ProfileImage = user.ProfileImage,
                UserRole = user.UserRole,
                IsActive = user.IsActive
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user profile");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = $"An error occurred while updating profile: {ex.Message}"
            });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = string.Join(", ", errors)
                });
            }

            var success = await _authService.ResetPasswordAsync(request);
            if (!success)
            {
                return BadRequest(new ErrorResponse
                {
                    StatusCode = 400,
                    Message = "Invalid or expired reset token"
                });
            }

            return Ok(new { Message = "Password reset successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password");
            return StatusCode(500, new ErrorResponse
            {
                StatusCode = 500,
                Message = "An error occurred while resetting password"
            });
        }
    }

    [HttpGet("user/{id}")]
    public IActionResult GetUser(Guid id)
    {
        // This would typically be in a UserService
        return Ok(new { Message = "User endpoint - to be implemented" });
    }
}
