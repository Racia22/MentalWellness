using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.DTOs.Doctor;
using MentalWellness.API.DTOs.Common;
using MentalWellness.API.Models;
using MentalWellness.API.Services;

namespace MentalWellness.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctorController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly NotificationService _notificationService;
    private readonly ILogger<DoctorController> _logger;

    public DoctorController(
        ApplicationDbContext context, 
        NotificationService notificationService,
        ILogger<DoctorController> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllDoctors([FromQuery] bool? isApproved = null)
    {
        try
        {
            _logger.LogInformation("GetAllDoctors called with isApproved={IsApproved}", isApproved);
            
            var query = _context.Doctors.Include(d => d.User).AsQueryable();

            if (isApproved.HasValue)
            {
                _logger.LogInformation("Filtering doctors where IsApproved={IsApproved}", isApproved.Value);
                query = query.Where(d => d.IsApproved == isApproved.Value);
            }

            var doctors = await query
                .Select(d => new DoctorDto
                {
                    DoctorId = d.DoctorId,
                    UserId = d.UserId,
                    DoctorIDNumber = d.DoctorIDNumber,
                    Specialty = d.Specialty,
                    LicenseNumber = d.LicenseNumber,
                    YearsOfExperience = d.YearsOfExperience,
                    Bio = d.Bio,
                    ConsultationFee = d.ConsultationFee,
                    AverageRating = d.AverageRating,
                    TotalReviews = d.TotalReviews,
                    IsApproved = d.IsApproved,
                    Email = d.User.Email,
                    FullName = d.User.FullName,
                    Phone = d.User.Phone,
                    CreatedAt = d.CreatedAt
                })
                .ToListAsync();

            _logger.LogInformation("Found {Count} doctors", doctors.Count);
            return Ok(doctors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all doctors");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("by-user/{userId}")]
    public async Task<IActionResult> GetDoctorByUserId(Guid userId)
    {
        try
        {
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.UserId == userId);

            if (doctor == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Doctor profile not found" });
            }

            var doctorDto = new DoctorDto
            {
                DoctorId = doctor.DoctorId,
                UserId = doctor.UserId,
                DoctorIDNumber = doctor.DoctorIDNumber,
                Specialty = doctor.Specialty,
                LicenseNumber = doctor.LicenseNumber,
                YearsOfExperience = doctor.YearsOfExperience,
                Bio = doctor.Bio,
                ConsultationFee = doctor.ConsultationFee,
                AverageRating = doctor.AverageRating,
                TotalReviews = doctor.TotalReviews,
                IsApproved = doctor.IsApproved,
                Email = doctor.User.Email,
                FullName = doctor.User.FullName,
                Phone = doctor.User.Phone,
                CreatedAt = doctor.CreatedAt
            };

            return Ok(doctorDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting doctor by userId {UserId}", userId);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDoctor(Guid id)
    {
        try
        {
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.DoctorId == id);

            if (doctor == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Doctor not found" });
            }

            var doctorDto = new DoctorDto
            {
                DoctorId = doctor.DoctorId,
                UserId = doctor.UserId,
                DoctorIDNumber = doctor.DoctorIDNumber,
                Specialty = doctor.Specialty,
                LicenseNumber = doctor.LicenseNumber,
                YearsOfExperience = doctor.YearsOfExperience,
                Bio = doctor.Bio,
                ConsultationFee = doctor.ConsultationFee,
                AverageRating = doctor.AverageRating,
                TotalReviews = doctor.TotalReviews,
                IsApproved = doctor.IsApproved,
                Email = doctor.User.Email,
                FullName = doctor.User.FullName,
                Phone = doctor.User.Phone,
                CreatedAt = doctor.CreatedAt
            };

            return Ok(doctorDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting doctor {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateDoctor([FromBody] CreateDoctorDto dto)
    {
        try
        {
            _logger.LogInformation("CreateDoctor called with UserId={UserId}, Specialty={Specialty}", dto.UserId, dto.Specialty);

            // Check if doctor already exists for this user
            var existingDoctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == dto.UserId);
            if (existingDoctor != null)
            {
                _logger.LogWarning("Doctor already exists for UserId={UserId}, DoctorId={DoctorId}", dto.UserId, existingDoctor.DoctorId);
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Doctor profile already exists for this user. Please update instead." });
            }

            // Validate user exists
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null)
            {
                _logger.LogWarning("User not found: UserId={UserId}", dto.UserId);
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "User not found" });
            }

            // Generate Doctor ID Number
            var lastNumber = await _context.Doctors
                .Where(d => d.DoctorIDNumber.StartsWith("DOC-"))
                .Select(d => d.DoctorIDNumber)
                .ToListAsync();

            int nextNumber = 1;
            if (lastNumber.Any())
            {
                var numbers = lastNumber
                    .Select(n => int.TryParse(n.Substring(4), out var num) ? num : 0)
                    .Where(n => n > 0);
                nextNumber = numbers.Any() ? numbers.Max() + 1 : 1;
            }

            var doctorIdNumber = $"DOC-{nextNumber:D6}";

            var doctor = new Doctor
            {
                UserId = dto.UserId,
                DoctorIDNumber = doctorIdNumber,
                Specialty = dto.Specialty,
                LicenseNumber = dto.LicenseNumber,
                YearsOfExperience = dto.YearsOfExperience,
                Bio = dto.Bio,
                ConsultationFee = dto.ConsultationFee,
                IsApproved = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            // Notify all admins about new doctor registration
            try
            {
                var admins = await _context.Users
                    .Where(u => u.UserRole == "Admin" && u.IsActive)
                    .ToListAsync();

                foreach (var admin in admins)
                {
                    await _notificationService.CreateNotificationAsync(
                        userId: admin.UserId,
                        notificationType: "DoctorApprovalPending",
                        entityType: "Doctor",
                        entityId: doctor.DoctorId,
                        appointmentId: null,
                        title: "Doctor Approval Required",
                        message: $"New doctor registration pending approval: {user.FullName}",
                        actionUrl: "/admin/doctors/pending",
                        priority: "High"
                    );
                }
            }
            catch (Exception notifEx)
            {
                _logger.LogWarning(notifEx, "Failed to create admin notifications for doctor {DoctorId}", doctor.DoctorId);
            }

            _logger.LogInformation("Doctor created successfully: DoctorId={DoctorId}, DoctorIDNumber={DoctorIDNumber}", doctor.DoctorId, doctor.DoctorIDNumber);

            return CreatedAtAction(nameof(GetDoctor), new { id = doctor.DoctorId }, doctor);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating doctor: {Message}", ex.Message);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = $"An error occurred: {ex.Message}" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDoctor(Guid id, [FromBody] UpdateDoctorDto dto)
    {
        try
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Doctor not found" });
            }

            if (!string.IsNullOrEmpty(dto.Specialty)) doctor.Specialty = dto.Specialty;
            if (!string.IsNullOrEmpty(dto.LicenseNumber)) doctor.LicenseNumber = dto.LicenseNumber;
            if (dto.YearsOfExperience.HasValue) doctor.YearsOfExperience = dto.YearsOfExperience.Value;
            if (dto.Bio != null) doctor.Bio = dto.Bio;
            if (dto.ConsultationFee.HasValue) doctor.ConsultationFee = dto.ConsultationFee.Value;

            doctor.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(doctor);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating doctor {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDoctor(Guid id)
    {
        try
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Doctor not found" });
            }

            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting doctor {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost("{id}/approve")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveDoctor(Guid id)
    {
        try
        {
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.DoctorId == id);
                
            if (doctor == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Doctor not found" });
            }

            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim != null && Guid.TryParse(userIdClaim, out var approvedBy))
            {
                doctor.ApprovedBy = approvedBy;
                doctor.ApprovedAt = DateTime.UtcNow;
            }

            doctor.IsApproved = true;
            doctor.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Notify doctor about approval
            try
            {
                if (doctor.UserId != Guid.Empty)
                {
                    await _notificationService.CreateNotificationAsync(
                        userId: doctor.UserId,
                        notificationType: "InApp",
                        entityType: "Doctor",
                        entityId: doctor.DoctorId,
                        appointmentId: null,
                        title: "Account Approved",
                        message: "Your doctor account has been approved",
                        actionUrl: "/doctor/dashboard",
                        priority: "High"
                    );
                }
            }
            catch (Exception notifEx)
            {
                _logger.LogWarning(notifEx, "Failed to create approval notification for doctor {DoctorId}", doctor.DoctorId);
            }

            return Ok(new { Message = "Doctor approved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving doctor {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }
}
