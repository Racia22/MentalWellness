using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.DTOs.Common;
using MentalWellness.API.DTOs.Admin;
using MentalWellness.API.DTOs.Message;
using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AdminController> _logger;

    public AdminController(ApplicationDbContext context, ILogger<AdminController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("dashboard/stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        try
        {
            var today = DateTime.UtcNow.Date;
            var stats = new
            {
                TotalUsers = await _context.Users.CountAsync(),
                TotalPatients = await _context.Patients.CountAsync(),
                TotalDoctors = await _context.Doctors.CountAsync(),
                PendingDoctors = await _context.Doctors.CountAsync(d => !d.IsApproved),
                TotalAppointments = await _context.Appointments.CountAsync(),
                TodaysAppointments = await _context.Appointments.CountAsync(a => a.AppointmentDate.Date == today),
                UpcomingAppointments = await _context.Appointments.CountAsync(a => a.AppointmentDate >= DateTime.UtcNow.Date && a.Status == "Scheduled"),
                TotalPayments = await _context.Payments.CountAsync(),
                TotalRevenue = await _context.Payments.Where(p => p.PaymentStatus == "Completed").SumAsync(p => (decimal?)p.Amount) ?? 0,
                TotalMedicalRecords = await _context.MedicalRecords.CountAsync(),
                TotalTreatmentPlans = await _context.TreatmentPlans.CountAsync(),
                ActiveTreatmentPlans = await _context.TreatmentPlans.CountAsync(t => t.Status == "Active"),
                TotalFeedbacks = await _context.Feedbacks.CountAsync(),
                PendingFeedbacks = await _context.Feedbacks.CountAsync(f => !f.IsApproved)
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard stats");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers([FromQuery] string? role = null, [FromQuery] bool? isActive = null)
    {
        try
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(role))
                query = query.Where(u => u.UserRole == role);

            if (isActive.HasValue)
                query = query.Where(u => u.IsActive == isActive.Value);

            var users = await query
                .Select(u => new
                {
                    u.UserId,
                    u.Email,
                    u.FullName,
                    u.Phone,
                    u.UserRole,
                    u.IsActive,
                    u.CreatedAt,
                    u.LastLoginAt
                })
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost("users/{id}/activate")]
    public async Task<IActionResult> ActivateUser(Guid id)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "User not found" });
            }

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "User activated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating user {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost("users/{id}/deactivate")]
    public async Task<IActionResult> DeactivateUser(Guid id)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "User not found" });
            }

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "User deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating user {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("doctors")]
    public async Task<IActionResult> GetAllDoctorUsers([FromQuery] bool? isApproved = null)
    {
        try
        {
            _logger.LogInformation("GetAllDoctorUsers called with isApproved={IsApproved}", isApproved);
            
            // Get all users with role "Doctor"
            var doctorUsers = await _context.Users
                .Where(u => u.UserRole == "Doctor")
                .ToListAsync();

            _logger.LogInformation("Found {Count} users with Doctor role", doctorUsers.Count);

            // Get all existing Doctor records
            var doctorRecords = await _context.Doctors
                .Include(d => d.User)
                .ToListAsync();

            _logger.LogInformation("Found {Count} Doctor records", doctorRecords.Count);

            // Create a list that includes both users with and without Doctor records
            var result = new List<DTOs.Admin.DoctorUserDto>();

            foreach (var user in doctorUsers)
            {
                var doctorRecord = doctorRecords.FirstOrDefault(d => d.UserId == user.UserId);
                
                if (doctorRecord != null)
                {
                    // User has a Doctor record
                    if (isApproved.HasValue && doctorRecord.IsApproved != isApproved.Value)
                        continue;

                    result.Add(new DTOs.Admin.DoctorUserDto
                    {
                        DoctorId = doctorRecord.DoctorId,
                        UserId = user.UserId,
                        DoctorIDNumber = doctorRecord.DoctorIDNumber,
                        Specialty = doctorRecord.Specialty,
                        LicenseNumber = doctorRecord.LicenseNumber,
                        YearsOfExperience = doctorRecord.YearsOfExperience,
                        Bio = doctorRecord.Bio,
                        ConsultationFee = doctorRecord.ConsultationFee,
                        AverageRating = doctorRecord.AverageRating,
                        TotalReviews = doctorRecord.TotalReviews,
                        IsApproved = doctorRecord.IsApproved,
                        Email = user.Email,
                        FullName = user.FullName,
                        Phone = user.Phone,
                        CreatedAt = doctorRecord.CreatedAt,
                        HasProfile = true
                    });
                }
                else
                {
                    // User doesn't have a Doctor record yet - show as pending profile creation
                    if (isApproved.HasValue && isApproved.Value)
                        continue; // Skip approved filter for users without profiles

                    result.Add(new DTOs.Admin.DoctorUserDto
                    {
                        DoctorId = null,
                        UserId = user.UserId,
                        DoctorIDNumber = "N/A",
                        Specialty = "Profile not completed",
                        LicenseNumber = "N/A",
                        YearsOfExperience = 0,
                        Bio = null,
                        ConsultationFee = 0,
                        AverageRating = 0,
                        TotalReviews = 0,
                        IsApproved = false,
                        Email = user.Email,
                        FullName = user.FullName,
                        Phone = user.Phone,
                        CreatedAt = user.CreatedAt,
                        HasProfile = false
                    });
                }
            }

            _logger.LogInformation("Returning {Count} doctor users", result.Count);
            if (result.Count > 0)
            {
                _logger.LogInformation("Sample doctor: UserId={UserId}, DoctorId={DoctorId}, IsApproved={IsApproved}, FullName={FullName}", 
                    result[0].UserId, result[0].DoctorId, result[0].IsApproved, result[0].FullName);
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting doctor users");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost("users/{id}/reset-password")]
    public async Task<IActionResult> ResetUserPassword(Guid id, [FromBody] AdminResetPasswordDto dto)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "User not found" });
            }

            // Hash the new password
            var passwordHash = MentalWellness.API.Helpers.PasswordHelper.HashPassword(dto.NewPassword);
            user.PasswordHash = passwordHash;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Password reset successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password for user {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("messages")]
    public async Task<IActionResult> GetAllMessages([FromQuery] Guid? senderId = null, [FromQuery] Guid? receiverId = null)
    {
        try
        {
            var query = _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .AsQueryable();

            // Apply filters if provided
            if (senderId.HasValue)
                query = query.Where(m => m.SenderId == senderId.Value);

            if (receiverId.HasValue)
                query = query.Where(m => m.ReceiverId == receiverId.Value);

            var messages = await query
                .Select(m => new MessageDto
                {
                    MessageId = m.MessageId,
                    SenderId = m.SenderId,
                    ReceiverId = m.ReceiverId,
                    AppointmentId = m.AppointmentId,
                    Subject = m.Subject,
                    MessageBody = m.MessageBody,
                    IsRead = m.IsRead,
                    ReadAt = m.ReadAt,
                    ParentMessageId = m.ParentMessageId,
                    Attachments = m.Attachments,
                    SenderName = m.Sender.FullName,
                    ReceiverName = m.Receiver.FullName,
                    CreatedAt = m.CreatedAt
                })
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return Ok(messages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all messages");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }
}
