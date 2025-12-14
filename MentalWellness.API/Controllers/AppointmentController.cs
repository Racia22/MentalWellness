using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.DTOs.Appointment;
using MentalWellness.API.DTOs.Common;
using MentalWellness.API.Models;
using MentalWellness.API.Services;

namespace MentalWellness.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AppointmentController> _logger;
    private readonly NotificationService _notificationService;

    public AppointmentController(
        ApplicationDbContext context, 
        ILogger<AppointmentController> logger,
        NotificationService notificationService)
    {
        _context = context;
        _logger = logger;
        _notificationService = notificationService;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAllAppointments([FromQuery] Guid? patientId = null, [FromQuery] Guid? doctorId = null, [FromQuery] Guid? doctorUserId = null, [FromQuery] string? status = null)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            // Check user role for security
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            var query = _context.Appointments
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .AsQueryable();

            // SECURITY: Patients can only see their own appointments
            if (patient != null && !isAdmin)
            {
                // Force filter by patient's PatientId
                query = query.Where(a => a.PatientId == patient.PatientId);
                _logger.LogInformation("Patient {PatientId} accessing appointments - filtering to own appointments only", patient.PatientId);
            }
            // SECURITY: Doctors can only see their own appointments
            else if (doctor != null && !isAdmin)
            {
                // Force filter by doctor's DoctorId
                query = query.Where(a => a.DoctorId == doctor.DoctorId);
                _logger.LogInformation("Doctor {DoctorId} accessing appointments - filtering to own appointments only", doctor.DoctorId);
            }
            // Admin can see all, but respect query parameters
            else if (isAdmin)
            {
                if (patientId.HasValue)
                    query = query.Where(a => a.PatientId == patientId.Value);
            }
            else
            {
                // Unauthorized user
                return Unauthorized();
            }

            // Additional filters (only if admin or if explicitly provided and matches user's role)
            if (doctorId.HasValue && (isAdmin || (doctor != null && doctor.DoctorId == doctorId.Value)))
            {
                query = query.Where(a => a.DoctorId == doctorId.Value);
            }
            else if (doctorUserId.HasValue && (isAdmin || (doctor != null && doctor.UserId == doctorUserId.Value)))
            {
                // Filter by Doctor's UserId (resolve DoctorId from UserId)
                var targetDoctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == doctorUserId.Value);
                if (targetDoctor != null)
                {
                    query = query.Where(a => a.DoctorId == targetDoctor.DoctorId);
                }
                else
                {
                    return Ok(new List<AppointmentDto>());
                }
            }

            if (!string.IsNullOrEmpty(status))
                query = query.Where(a => a.Status == status);

            var appointments = await query
                .Select(a => new AppointmentDto
                {
                    AppointmentId = a.AppointmentId,
                    PatientId = a.PatientId,
                    DoctorId = a.DoctorId,
                    AppointmentDate = a.AppointmentDate,
                    AppointmentTime = a.AppointmentTime,
                    Duration = a.Duration,
                    AppointmentType = a.AppointmentType,
                    Status = a.Status,
                    Amount = a.Amount,
                    IsPaid = a.IsPaid,
                    PatientNotes = a.PatientNotes,
                    CancellationReason = a.CancellationReason,
                    PatientName = a.Patient.User.FullName,
                    DoctorName = a.Doctor.User.FullName,
                    CreatedAt = a.CreatedAt
                })
                .OrderByDescending(a => a.AppointmentDate)
                .ThenByDescending(a => a.AppointmentTime)
                .ToListAsync();

            return Ok(appointments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting appointments");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAppointment(Guid id)
    {
        try
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            if (appointment == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Appointment not found" });
            }

            var appointmentDto = new AppointmentDto
            {
                AppointmentId = appointment.AppointmentId,
                PatientId = appointment.PatientId,
                DoctorId = appointment.DoctorId,
                AppointmentDate = appointment.AppointmentDate,
                AppointmentTime = appointment.AppointmentTime,
                Duration = appointment.Duration,
                AppointmentType = appointment.AppointmentType,
                Status = appointment.Status,
                Amount = appointment.Amount,
                IsPaid = appointment.IsPaid,
                PatientNotes = appointment.PatientNotes,
                CancellationReason = appointment.CancellationReason,
                PatientName = appointment.Patient.User.FullName,
                DoctorName = appointment.Doctor.User.FullName,
                CreatedAt = appointment.CreatedAt
            };

            return Ok(appointmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting appointment {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentDto dto)
    {
        try
        {
            _logger.LogInformation("=== CreateAppointment START ===");
            _logger.LogInformation("Request received - PatientId: {PatientId}, DoctorId: {DoctorId}, Date: {Date}, Time: {Time}, Type: {Type}", 
                dto.PatientId, dto.DoctorId, dto.AppointmentDate, dto.AppointmentTime, dto.AppointmentType);

            // Check model state for validation errors
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value?.Errors.Count > 0)
                    .SelectMany(x => x.Value!.Errors)
                    .Select(x => x.ErrorMessage)
                    .ToList();
                
                _logger.LogWarning("Model validation failed: {Errors}", string.Join(", ", errors));
                return BadRequest(new ErrorResponse 
                { 
                    StatusCode = 400, 
                    Message = "Validation failed: " + string.Join("; ", errors)
                });
            }

            // Validate TimeSpan is valid
            if (dto.AppointmentTime == TimeSpan.Zero && dto.AppointmentTime.TotalDays >= 1)
            {
                _logger.LogWarning("Invalid appointment time: {Time}", dto.AppointmentTime);
                return BadRequest(new ErrorResponse 
                { 
                    StatusCode = 400, 
                    Message = "Invalid appointment time format. Expected format: HH:MM:SS (e.g., 08:30:00)" 
                });
            }

            // STEP 1: Find Patient record from UserId (frontend sends UserId as PatientId)
            _logger.LogInformation("Step 1: Looking for Patient record with UserId: {UserId}", dto.PatientId);
            
            var patient = await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == dto.PatientId);
            
            if (patient == null)
            {
                // Also check if it's actually a PatientId (just in case)
                patient = await _context.Patients
                    .Include(p => p.User)
                    .FirstOrDefaultAsync(p => p.PatientId == dto.PatientId);
            }
            
            if (patient == null)
            {
                _logger.LogWarning("Patient record NOT FOUND for UserId/PatientId: {Id}", dto.PatientId);
                
                // Check if user exists but doesn't have a patient profile
                var userExists = await _context.Users.AnyAsync(u => u.UserId == dto.PatientId && u.UserRole == "Patient");
                if (userExists)
                {
                    _logger.LogWarning("User exists but Patient profile is missing for UserId: {UserId}", dto.PatientId);
                    return BadRequest(new ErrorResponse 
                    { 
                        StatusCode = 400, 
                        Message = "Patient profile not found. Please complete your patient profile first." 
                    });
                }
                else
                {
                    _logger.LogWarning("User does not exist for UserId: {UserId}", dto.PatientId);
                    return BadRequest(new ErrorResponse 
                    { 
                        StatusCode = 400, 
                        Message = "Invalid patient ID. Please log in again." 
                    });
                }
            }

            _logger.LogInformation("Step 1 SUCCESS: Found Patient - PatientId: {PatientId}, UserId: {UserId}, Name: {Name}", 
                patient.PatientId, patient.UserId, patient.User?.FullName ?? "Unknown");

            // STEP 2: Validate Doctor exists and is approved
            _logger.LogInformation("Step 2: Looking for Doctor with DoctorId: {DoctorId}", dto.DoctorId);
            
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.DoctorId == dto.DoctorId);
            
            if (doctor == null)
            {
                _logger.LogWarning("Doctor NOT FOUND for DoctorId: {DoctorId}", dto.DoctorId);
                return BadRequest(new ErrorResponse 
                { 
                    StatusCode = 400, 
                    Message = "Doctor not found. Please select a valid doctor." 
                });
            }

            _logger.LogInformation("Step 2 SUCCESS: Found Doctor - DoctorId: {DoctorId}, Name: {Name}, Approved: {Approved}", 
                doctor.DoctorId, doctor.User?.FullName ?? "Unknown", doctor.IsApproved);

            if (!doctor.IsApproved)
            {
                _logger.LogWarning("Attempted to book appointment with UNAPPROVED doctor - DoctorId: {DoctorId}", dto.DoctorId);
                return BadRequest(new ErrorResponse 
                { 
                    StatusCode = 400, 
                    Message = "Cannot book appointment with this doctor. The doctor has not been approved yet. Please wait for the doctor to be approved." 
                });
            }

            // STEP 3: Validate appointment date is not in the past
            _logger.LogInformation("Step 3: Validating appointment date: {Date} (UTC Now: {UtcNow})", 
                dto.AppointmentDate, DateTime.UtcNow);
            
            if (dto.AppointmentDate.Date < DateTime.UtcNow.Date)
            {
                _logger.LogWarning("Attempted to book appointment in the PAST: {Date}", dto.AppointmentDate);
                return BadRequest(new ErrorResponse 
                { 
                    StatusCode = 400, 
                    Message = $"Appointment date cannot be in the past. Selected date: {dto.AppointmentDate:yyyy-MM-dd}, Today: {DateTime.UtcNow:yyyy-MM-dd}" 
                });
            }

            // STEP 4: Validate appointment time is within valid range
            if (dto.AppointmentTime.TotalHours < 0 || dto.AppointmentTime.TotalHours >= 24)
            {
                _logger.LogWarning("Invalid appointment time range: {Time}", dto.AppointmentTime);
                return BadRequest(new ErrorResponse 
                { 
                    StatusCode = 400, 
                    Message = $"Invalid appointment time: {dto.AppointmentTime}. Time must be between 00:00:00 and 23:59:59." 
                });
            }

            // Use doctor's consultation fee if amount not specified
            var amount = dto.Amount > 0 ? dto.Amount : doctor.ConsultationFee;
            _logger.LogInformation("Step 4: Using amount: {Amount} (from doctor fee: {Fee})", amount, doctor.ConsultationFee);

            // STEP 5: Create Appointment entity
            _logger.LogInformation("Step 5: Creating Appointment entity...");
            
            var appointment = new Appointment
            {
                PatientId = patient.PatientId, // CRITICAL: Use Patient.PatientId (not UserId)
                DoctorId = dto.DoctorId,
                AppointmentDate = dto.AppointmentDate.Date,
                AppointmentTime = dto.AppointmentTime,
                Duration = dto.Duration > 0 ? dto.Duration : 60,
                AppointmentType = dto.AppointmentType,
                Status = "Scheduled",
                Amount = amount,
                IsPaid = false,
                PatientNotes = dto.PatientNotes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _logger.LogInformation("Appointment entity created - PatientId: {PatientId}, DoctorId: {DoctorId}, Date: {Date}, Time: {Time}, Duration: {Duration}", 
                appointment.PatientId, appointment.DoctorId, appointment.AppointmentDate, 
                appointment.AppointmentTime, appointment.Duration);

            // STEP 6: Save to database
            _logger.LogInformation("Step 6: Adding appointment to database context...");
            _context.Appointments.Add(appointment);
            
            try
            {
                _logger.LogInformation("Saving changes to database...");
                await _context.SaveChangesAsync();
                _logger.LogInformation("✅ Appointment saved successfully - AppointmentId: {AppointmentId}", appointment.AppointmentId);
            }
            catch (DbUpdateException dbEx)
            {
                var errorDetails = dbEx.Message;
                var innerError = dbEx.InnerException?.Message ?? "No inner exception";
                
                _logger.LogError(dbEx, "❌ DATABASE ERROR while saving appointment");
                _logger.LogError("Exception Type: {Type}", dbEx.GetType().Name);
                _logger.LogError("Exception Message: {Message}", dbEx.Message);
                _logger.LogError("Inner Exception: {Inner}", innerError);
                _logger.LogError("Stack Trace: {StackTrace}", dbEx.StackTrace);
                
                // Check for specific database errors
                if (innerError.Contains("FOREIGN KEY") || innerError.Contains("constraint"))
                {
                    return StatusCode(500, new ErrorResponse 
                    { 
                        StatusCode = 500, 
                        Message = "Database constraint error. Please ensure the patient and doctor records are valid." 
                    });
                }
                
                if (innerError.Contains("PRIMARY KEY") || innerError.Contains("duplicate"))
                {
                    return StatusCode(500, new ErrorResponse 
                    { 
                        StatusCode = 500, 
                        Message = "A duplicate appointment may already exist." 
                    });
                }
                
                return StatusCode(500, new ErrorResponse 
                { 
                    StatusCode = 500, 
                    Message = $"Database error while saving appointment: {innerError}" 
                });
            }
            catch (Exception saveEx)
            {
                _logger.LogError(saveEx, "❌ UNEXPECTED ERROR while saving appointment");
                _logger.LogError("Exception Type: {Type}", saveEx.GetType().Name);
                _logger.LogError("Exception Message: {Message}", saveEx.Message);
                _logger.LogError("Stack Trace: {StackTrace}", saveEx.StackTrace);
                
                return StatusCode(500, new ErrorResponse 
                { 
                    StatusCode = 500, 
                    Message = $"Error saving appointment: {saveEx.Message}" 
                });
            }

            // STEP 7: Reload appointment with related data for response
            _logger.LogInformation("Step 7: Reloading appointment with related data...");
            
            var createdAppointment = await _context.Appointments
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(a => a.AppointmentId == appointment.AppointmentId);

            if (createdAppointment == null)
            {
                _logger.LogError("❌ CRITICAL: Appointment was saved but could not be reloaded - AppointmentId: {AppointmentId}", appointment.AppointmentId);
                return StatusCode(500, new ErrorResponse 
                { 
                    StatusCode = 500, 
                    Message = "Appointment was created but could not be retrieved. Please contact support with Appointment ID: " + appointment.AppointmentId 
                });
            }

            if (createdAppointment.Patient?.User == null)
            {
                _logger.LogError("❌ CRITICAL: Patient or Patient.User is null for AppointmentId: {AppointmentId}", appointment.AppointmentId);
                return StatusCode(500, new ErrorResponse 
                { 
                    StatusCode = 500, 
                    Message = "Error loading patient information for the appointment." 
                });
            }

            if (createdAppointment.Doctor?.User == null)
            {
                _logger.LogError("❌ CRITICAL: Doctor or Doctor.User is null for AppointmentId: {AppointmentId}", appointment.AppointmentId);
                return StatusCode(500, new ErrorResponse 
                { 
                    StatusCode = 500, 
                    Message = "Error loading doctor information for the appointment." 
                });
            }

            // STEP 8: Create response DTO
            _logger.LogInformation("Step 8: Creating response DTO...");
            
            var appointmentDto = new AppointmentDto
            {
                AppointmentId = createdAppointment.AppointmentId,
                PatientId = createdAppointment.PatientId,
                DoctorId = createdAppointment.DoctorId,
                AppointmentDate = createdAppointment.AppointmentDate,
                AppointmentTime = createdAppointment.AppointmentTime,
                Duration = createdAppointment.Duration,
                AppointmentType = createdAppointment.AppointmentType,
                Status = createdAppointment.Status,
                Amount = createdAppointment.Amount,
                IsPaid = createdAppointment.IsPaid,
                PatientNotes = createdAppointment.PatientNotes,
                CancellationReason = createdAppointment.CancellationReason,
                PatientName = createdAppointment.Patient.User.FullName,
                DoctorName = createdAppointment.Doctor.User.FullName,
                CreatedAt = createdAppointment.CreatedAt
            };

            // Create notification for doctor (AppointmentRequest)
            try
            {
                if (doctor.UserId != Guid.Empty)
                {
                    _logger.LogInformation("Creating notification for doctor {DoctorUserId} about appointment {AppointmentId}", 
                        doctor.UserId, createdAppointment.AppointmentId);
                    
                    var notification = await _notificationService.CreateNotificationAsync(
                        userId: doctor.UserId,
                        notificationType: "InApp",
                        entityType: "Appointment",
                        entityId: createdAppointment.AppointmentId,
                        appointmentId: createdAppointment.AppointmentId,
                        title: "New Appointment Request",
                        message: $"New appointment request from {createdAppointment.Patient.User.FullName}",
                        actionUrl: $"/doctor/appointments/{createdAppointment.AppointmentId}",
                        priority: "High"
                    );
                    
                    _logger.LogInformation("✅ Notification created successfully: {NotificationId} for user {UserId}", 
                        notification.NotificationId, doctor.UserId);
                }
                else
                {
                    _logger.LogWarning("Doctor UserId is empty, cannot create notification for appointment {AppointmentId}", 
                        createdAppointment.AppointmentId);
                }
            }
            catch (Exception notifEx)
            {
                _logger.LogError(notifEx, "❌ Failed to create notification for appointment {AppointmentId}", createdAppointment.AppointmentId);
            }

            _logger.LogInformation("✅✅✅ CreateAppointment SUCCESS - AppointmentId: {AppointmentId}, Patient: {Patient}, Doctor: {Doctor}", 
                appointmentDto.AppointmentId, appointmentDto.PatientName, appointmentDto.DoctorName);
            _logger.LogInformation("=== CreateAppointment END ===");
            
            // Return 201 Created with the appointment DTO
            return StatusCode(201, appointmentDto);
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError(dbEx, "Database error creating appointment: {Message}", dbEx.Message);
            
            string errorMessage = "Database error occurred while creating appointment";
            
            if (dbEx.InnerException != null)
            {
                _logger.LogError(dbEx.InnerException, "Inner exception: {Message}", dbEx.InnerException.Message);
                errorMessage += $": {dbEx.InnerException.Message}";
            }
            
            return StatusCode(500, new ErrorResponse 
            { 
                StatusCode = 500, 
                Message = errorMessage 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating appointment: {Message}", ex.Message);
            _logger.LogError("Stack trace: {StackTrace}", ex.StackTrace);
            
            string errorMessage = $"Error creating appointment: {ex.Message}";
            
            if (ex.InnerException != null)
            {
                _logger.LogError(ex.InnerException, "Inner exception: {Message}", ex.InnerException.Message);
                errorMessage += $" | Inner: {ex.InnerException.Message}";
            }
            
            return StatusCode(500, new ErrorResponse 
            { 
                StatusCode = 500, 
                Message = errorMessage 
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAppointment(Guid id, [FromBody] UpdateAppointmentDto dto)
    {
        try
        {
            _logger.LogInformation("UpdateAppointment called for AppointmentId: {Id}, Status: {Status}", id, dto.Status);
            
            var appointment = await _context.Appointments
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);
                
            if (appointment == null)
            {
                _logger.LogWarning("Appointment not found: {Id}", id);
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Appointment not found" });
            }

            if (dto.AppointmentDate.HasValue) appointment.AppointmentDate = dto.AppointmentDate.Value.Date;
            if (dto.AppointmentTime.HasValue) appointment.AppointmentTime = dto.AppointmentTime.Value;
            if (dto.Duration.HasValue) appointment.Duration = dto.Duration.Value;
            if (!string.IsNullOrEmpty(dto.AppointmentType)) appointment.AppointmentType = dto.AppointmentType;
            if (!string.IsNullOrEmpty(dto.Status))
            {
                // Validate status is one of the allowed values
                var allowedStatuses = new[] { "Scheduled", "Ongoing", "Completed", "Cancelled", "NoShow" };
                if (allowedStatuses.Contains(dto.Status))
                {
                    appointment.Status = dto.Status;
                }
                else
                {
                    _logger.LogWarning("Invalid status value: {Status}", dto.Status);
                    return BadRequest(new ErrorResponse 
                    { 
                        StatusCode = 400, 
                        Message = $"Invalid status. Allowed values: {string.Join(", ", allowedStatuses)}" 
                    });
                }
            }
            if (dto.Amount.HasValue) appointment.Amount = dto.Amount.Value;
            if (dto.PatientNotes != null) appointment.PatientNotes = dto.PatientNotes;
            if (dto.CancellationReason != null) appointment.CancellationReason = dto.CancellationReason;

            appointment.UpdatedAt = DateTime.UtcNow;

            // Track if status changed to Approved/Scheduled (which indicates approval)
            var statusChangedToApproved = !string.IsNullOrEmpty(dto.Status) && 
                                          (dto.Status == "Scheduled" || dto.Status == "Approved") &&
                                          appointment.Status != dto.Status;

            await _context.SaveChangesAsync();
            
            // Create notification if appointment was approved
            if (statusChangedToApproved && appointment.Patient?.User != null && appointment.Doctor?.User != null)
            {
                try
                {
                    await _notificationService.CreateNotificationAsync(
                        userId: appointment.Patient.UserId,
                        notificationType: "InApp",
                        entityType: "Appointment",
                        entityId: appointment.AppointmentId,
                        appointmentId: appointment.AppointmentId,
                        title: "Appointment Approved",
                        message: $"Your appointment with Dr. {appointment.Doctor.User.FullName} has been approved",
                        actionUrl: $"/patient/appointments/{appointment.AppointmentId}",
                        priority: "High"
                    );
                }
                catch (Exception notifEx)
                {
                    _logger.LogWarning(notifEx, "Failed to create approval notification for appointment {AppointmentId}", appointment.AppointmentId);
                }
            }
            
            _logger.LogInformation("Appointment updated successfully - AppointmentId: {Id}, New Status: {Status}", id, appointment.Status);

            // Return AppointmentDto with patient and doctor names
            var appointmentDto = new AppointmentDto
            {
                AppointmentId = appointment.AppointmentId,
                PatientId = appointment.PatientId,
                DoctorId = appointment.DoctorId,
                AppointmentDate = appointment.AppointmentDate,
                AppointmentTime = appointment.AppointmentTime,
                Duration = appointment.Duration,
                AppointmentType = appointment.AppointmentType,
                Status = appointment.Status,
                Amount = appointment.Amount,
                IsPaid = appointment.IsPaid,
                PatientNotes = appointment.PatientNotes,
                CancellationReason = appointment.CancellationReason,
                PatientName = appointment.Patient?.User?.FullName ?? "Unknown",
                DoctorName = appointment.Doctor?.User?.FullName ?? "Unknown",
                CreatedAt = appointment.CreatedAt
            };

            return Ok(appointmentDto);
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError(dbEx, "Database error updating appointment {Id}: {Message}", id, dbEx.Message);
            
            string errorMessage = "Database error occurred while updating appointment";
            if (dbEx.InnerException != null)
            {
                _logger.LogError(dbEx.InnerException, "Inner exception: {Message}", dbEx.InnerException.Message);
                errorMessage += $": {dbEx.InnerException.Message}";
            }
            
            return StatusCode(500, new ErrorResponse 
            { 
                StatusCode = 500, 
                Message = errorMessage 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating appointment {Id}: {Message}", id, ex.Message);
            _logger.LogError("Stack trace: {StackTrace}", ex.StackTrace);
            
            string errorMessage = $"Error updating appointment: {ex.Message}";
            if (ex.InnerException != null)
            {
                _logger.LogError(ex.InnerException, "Inner exception: {Message}", ex.InnerException.Message);
                errorMessage += $" | Inner: {ex.InnerException.Message}";
            }
            
            return StatusCode(500, new ErrorResponse 
            { 
                StatusCode = 500, 
                Message = errorMessage 
            });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAppointment(Guid id)
    {
        try
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Appointment not found" });
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting appointment {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelAppointment(Guid id, [FromBody] string? reason = null)
    {
        try
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Appointment not found" });
            }

            appointment.Status = "Cancelled";
            appointment.CancellationReason = reason;
            appointment.UpdatedAt = DateTime.UtcNow;

            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim != null && Guid.TryParse(userIdClaim, out var cancelledBy))
            {
                appointment.CancelledBy = cancelledBy;
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Appointment cancelled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling appointment {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("{id}/can-start-consultation")]
    [Authorize]
    public async Task<IActionResult> CanStartConsultation(Guid id)
    {
        try
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(a => a.AppointmentId == id);

            if (appointment == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Appointment not found" });
            }

            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            // Check authorization
            bool canAccess = false;
            if (isAdmin)
            {
                canAccess = true;
            }
            else if (patient != null && appointment.PatientId == patient.PatientId)
            {
                canAccess = true;
            }
            else if (doctor != null && appointment.DoctorId == doctor.DoctorId)
            {
                canAccess = true;
            }

            if (!canAccess)
            {
                return Forbid("You don't have access to this appointment");
            }

            // Check if payment is required and completed
            var canStart = true;
            var reason = "";

            if (!appointment.IsPaid)
            {
                canStart = false;
                reason = "Payment is required before starting the consultation. Please complete the payment first.";
            }
            else if (appointment.Status != "Scheduled" && appointment.Status != "Ongoing")
            {
                canStart = false;
                reason = $"Consultation cannot be started. Appointment status is: {appointment.Status}";
            }

            return Ok(new
            {
                CanStart = canStart,
                Reason = reason,
                IsPaid = appointment.IsPaid,
                Status = appointment.Status,
                AppointmentDate = appointment.AppointmentDate,
                AppointmentTime = appointment.AppointmentTime
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking consultation access for appointment {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }
}
