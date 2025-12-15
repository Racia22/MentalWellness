using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using MentalWellness.API.Data;
using MentalWellness.API.DTOs.MoodLog;
using MentalWellness.API.DTOs.Common;
using MentalWellness.API.Models;

namespace MentalWellness.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MoodLogController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MoodLogController> _logger;

    public MoodLogController(ApplicationDbContext context, ILogger<MoodLogController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllMoodLogs([FromQuery] Guid? patientId = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            // Check if current user is a patient, doctor, or admin
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            _logger.LogInformation("GetAllMoodLogs - UserId: {UserId}, IsAdmin: {IsAdmin}, Patient: {PatientId}, Doctor: {DoctorId}, RequestedPatientId: {RequestedPatientId}",
                currentUserId, isAdmin, patient?.PatientId, doctor?.DoctorId, patientId);

            var query = _context.MoodLogs
                .Include(m => m.Patient).ThenInclude(p => p.User)
                .AsQueryable();

            // Admins can see all, or use patientId filter if provided
            if (isAdmin)
            {
                if (patientId.HasValue)
                    query = query.Where(m => m.PatientId == patientId.Value);
            }
            // Doctors can see mood logs for their patients (if patientId is provided)
            else if (doctor != null)
            {
                if (patientId.HasValue)
                {
                    // Verify that the doctor has appointments with this patient
                    // OR has medical records with this patient (in case they're viewing patient details)
                    var hasAppointment = await _context.Appointments
                        .AnyAsync(a => a.DoctorId == doctor.DoctorId && a.PatientId == patientId.Value);
                    
                    var hasMedicalRecord = await _context.MedicalRecords
                        .AnyAsync(mr => mr.DoctorId == doctor.DoctorId && mr.PatientId == patientId.Value);
                    
                    _logger.LogInformation("Doctor {DoctorId} checking access to patient {PatientId} - HasAppointment: {HasAppointment}, HasMedicalRecord: {HasMedicalRecord}",
                        doctor.DoctorId, patientId.Value, hasAppointment, hasMedicalRecord);
                    
                    // Allow access if doctor has appointments OR medical records with this patient
                    if (!hasAppointment && !hasMedicalRecord)
                    {
                        _logger.LogWarning("Doctor {DoctorId} attempted to access mood logs for patient {PatientId} without relationship",
                            doctor.DoctorId, patientId.Value);
                        return Forbid("You can only view mood logs for your own patients.");
                    }
                    
                    query = query.Where(m => m.PatientId == patientId.Value);
                }
                else
                {
                    // If no patientId provided, get all patients for this doctor
                    var doctorPatientIds = await _context.Appointments
                        .Where(a => a.DoctorId == doctor.DoctorId)
                        .Select(a => a.PatientId)
                        .Distinct()
                        .ToListAsync();
                    
                    query = query.Where(m => doctorPatientIds.Contains(m.PatientId));
                }
            }
            // Security: Patients can only see their own mood logs
            else if (patient != null)
            {
                query = query.Where(m => m.PatientId == patient.PatientId);
            }
            else
            {
                _logger.LogWarning("Unauthorized access attempt - UserId: {UserId} is not a patient, doctor, or admin", currentUserId);
                return Unauthorized();
            }

            if (startDate.HasValue)
                query = query.Where(m => m.LogDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(m => m.LogDate <= endDate.Value);

            var logs = await query
                .Select(m => new MoodLogDto
                {
                    MoodLogId = m.MoodLogId,
                    PatientId = m.PatientId,
                    LogDate = m.LogDate,
                    MoodScore = m.MoodScore,
                    StressLevel = m.StressLevel,
                    SleepHours = m.SleepHours,
                    EnergyLevel = m.EnergyLevel,
                    Notes = m.Notes,
                    Activities = m.Activities,
                    Triggers = m.Triggers,
                    PatientName = m.Patient.User.FullName,
                    CreatedAt = m.CreatedAt
                })
                .OrderByDescending(m => m.LogDate)
                .ToListAsync();

            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting mood logs");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("patient/{patientId}")]
    public async Task<IActionResult> GetMoodLogsByPatientId(Guid patientId)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                _logger.LogWarning("GetMoodLogsByPatientId - Unauthorized: No userId claim");
                return Unauthorized();
            }

            // Check if current user is a patient, doctor, or admin
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            _logger.LogInformation("GetMoodLogsByPatientId - UserId: {UserId}, IsAdmin: {IsAdmin}, Patient: {PatientId}, Doctor: {DoctorId}, RequestedPatientId: {RequestedPatientId}",
                currentUserId, isAdmin, patient?.PatientId, doctor?.DoctorId, patientId);

            var query = _context.MoodLogs
                .Include(m => m.Patient).ThenInclude(p => p.User)
                .Where(m => m.PatientId == patientId)
                .AsQueryable();

            // Admins can see all mood logs
            if (isAdmin)
            {
                // Already filtered by patientId, no additional filtering needed
            }
            // Doctors can see mood logs for their patients
            else if (doctor != null)
            {
                // Verify that the doctor has appointments or medical records with this patient
                var hasAppointment = await _context.Appointments
                    .AnyAsync(a => a.DoctorId == doctor.DoctorId && a.PatientId == patientId);
                
                var hasMedicalRecord = await _context.MedicalRecords
                    .AnyAsync(mr => mr.DoctorId == doctor.DoctorId && mr.PatientId == patientId);
                
                _logger.LogInformation("Doctor {DoctorId} checking access to patient {PatientId} - HasAppointment: {HasAppointment}, HasMedicalRecord: {HasMedicalRecord}",
                    doctor.DoctorId, patientId, hasAppointment, hasMedicalRecord);
                
                if (!hasAppointment && !hasMedicalRecord)
                {
                    _logger.LogWarning("Doctor {DoctorId} attempted to access mood logs for patient {PatientId} without relationship",
                        doctor.DoctorId, patientId);
                    return Forbid("You can only view mood logs for your own patients.");
                }
            }
            // Patients can only see their own mood logs
            else if (patient != null)
            {
                if (patient.PatientId != patientId)
                {
                    _logger.LogWarning("Patient {PatientId} attempted to access mood logs for different patient {RequestedPatientId}",
                        patient.PatientId, patientId);
                    return Forbid("You can only view your own mood logs.");
                }
            }
            else
            {
                _logger.LogWarning("Unauthorized access attempt - UserId: {UserId} is not a patient, doctor, or admin", currentUserId);
                return Unauthorized();
            }

            var logs = await query
                .Select(m => new MoodLogDto
                {
                    MoodLogId = m.MoodLogId,
                    PatientId = m.PatientId,
                    LogDate = m.LogDate,
                    MoodScore = m.MoodScore,
                    StressLevel = m.StressLevel,
                    SleepHours = m.SleepHours,
                    EnergyLevel = m.EnergyLevel,
                    Notes = m.Notes,
                    Activities = m.Activities,
                    Triggers = m.Triggers,
                    PatientName = m.Patient.User.FullName,
                    CreatedAt = m.CreatedAt
                })
                .OrderByDescending(m => m.LogDate)
                .ToListAsync();

            _logger.LogInformation("GetMoodLogsByPatientId - Returning {Count} mood logs for patient {PatientId}", logs.Count, patientId);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting mood logs for patient {PatientId}", patientId);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMoodLog(Guid id)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            var log = await _context.MoodLogs
                .Include(m => m.Patient).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(m => m.MoodLogId == id);

            if (log == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Mood log not found" });
            }

            // Security: Check if user has access to this log
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin)
            {
                if (patient != null && log.PatientId != patient.PatientId)
                {
                    return Forbid("You can only view your own mood logs.");
                }
                if (patient == null)
                {
                    return Unauthorized();
                }
            }

            var logDto = new MoodLogDto
            {
                MoodLogId = log.MoodLogId,
                PatientId = log.PatientId,
                LogDate = log.LogDate,
                MoodScore = log.MoodScore,
                StressLevel = log.StressLevel,
                SleepHours = log.SleepHours,
                EnergyLevel = log.EnergyLevel,
                Notes = log.Notes,
                Activities = log.Activities,
                Triggers = log.Triggers,
                PatientName = log.Patient.User.FullName,
                CreatedAt = log.CreatedAt
            };

            return Ok(logDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting mood log {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateMoodLog([FromBody] CreateMoodLogDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            // Only patients and admins can create mood logs
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            if (patient == null && !isAdmin)
            {
                return Forbid("Only patients can create mood logs.");
            }

            // If not admin, ensure patient is creating log with their own PatientId
            if (!isAdmin && patient != null && dto.PatientId != patient.PatientId)
            {
                return Forbid("You can only create mood logs with your own patient ID.");
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                _logger.LogWarning("Invalid model state for CreateMoodLog: {Errors}", string.Join(", ", errors));
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Invalid request data: " + string.Join(", ", errors) });
            }

            // Validate that Patient exists
            var patientExists = await _context.Patients.AnyAsync(p => p.PatientId == dto.PatientId);
            if (!patientExists)
            {
                _logger.LogWarning("Attempted to create mood log with invalid PatientId: {PatientId}", dto.PatientId);
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Invalid PatientId. Patient not found." });
            }

            var log = new MoodLog
            {
                PatientId = dto.PatientId,
                LogDate = dto.LogDate ?? DateTime.UtcNow,
                MoodScore = dto.MoodScore,
                StressLevel = dto.StressLevel,
                SleepHours = dto.SleepHours,
                EnergyLevel = dto.EnergyLevel,
                Notes = dto.Notes,
                Activities = dto.Activities,
                Triggers = dto.Triggers,
                CreatedAt = DateTime.UtcNow
            };

            _context.MoodLogs.Add(log);
            await _context.SaveChangesAsync();

            // Load the log with related data for response
            var createdLog = await _context.MoodLogs
                .Include(m => m.Patient).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(m => m.MoodLogId == log.MoodLogId);

            if (createdLog == null)
            {
                _logger.LogError("Failed to retrieve created mood log with ID: {MoodLogId}", log.MoodLogId);
                return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "Mood log was created but could not be retrieved." });
            }

            var logDto = new MoodLogDto
            {
                MoodLogId = createdLog.MoodLogId,
                PatientId = createdLog.PatientId,
                LogDate = createdLog.LogDate,
                MoodScore = createdLog.MoodScore,
                StressLevel = createdLog.StressLevel,
                SleepHours = createdLog.SleepHours,
                EnergyLevel = createdLog.EnergyLevel,
                Notes = createdLog.Notes,
                Activities = createdLog.Activities,
                Triggers = createdLog.Triggers,
                PatientName = createdLog.Patient.User.FullName,
                CreatedAt = createdLog.CreatedAt
            };

            return CreatedAtAction(nameof(GetMoodLog), new { id = log.MoodLogId }, logDto);
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError(dbEx, "Database error creating mood log. PatientId: {PatientId}", dto.PatientId);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "Database error occurred. Please check that PatientId is valid." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating mood log. PatientId: {PatientId}. Error: {Error}", 
                dto.PatientId, ex.Message);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = $"An error occurred: {ex.Message}" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMoodLog(Guid id, [FromBody] CreateMoodLogDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            var log = await _context.MoodLogs
                .Include(m => m.Patient).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(m => m.MoodLogId == id);
            
            if (log == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Mood log not found" });
            }

            // Security: Check if user has access to this log
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin)
            {
                if (patient != null && log.PatientId != patient.PatientId)
                {
                    return Forbid("You can only update your own mood logs.");
                }
                if (patient == null)
                {
                    return Unauthorized();
                }
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                _logger.LogWarning("Invalid model state for UpdateMoodLog: {Errors}", string.Join(", ", errors));
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Invalid request data: " + string.Join(", ", errors) });
            }

            if (dto.LogDate.HasValue) log.LogDate = dto.LogDate.Value;
            log.MoodScore = dto.MoodScore;
            log.StressLevel = dto.StressLevel;
            log.SleepHours = dto.SleepHours;
            log.EnergyLevel = dto.EnergyLevel;
            if (dto.Notes != null) log.Notes = dto.Notes;
            if (dto.Activities != null) log.Activities = dto.Activities;
            if (dto.Triggers != null) log.Triggers = dto.Triggers;

            await _context.SaveChangesAsync();

            // Return DTO for consistency
            var logDto = new MoodLogDto
            {
                MoodLogId = log.MoodLogId,
                PatientId = log.PatientId,
                LogDate = log.LogDate,
                MoodScore = log.MoodScore,
                StressLevel = log.StressLevel,
                SleepHours = log.SleepHours,
                EnergyLevel = log.EnergyLevel,
                Notes = log.Notes,
                Activities = log.Activities,
                Triggers = log.Triggers,
                PatientName = log.Patient.User.FullName,
                CreatedAt = log.CreatedAt
            };

            return Ok(logDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating mood log {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMoodLog(Guid id)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            var log = await _context.MoodLogs.FindAsync(id);
            if (log == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Mood log not found" });
            }

            // Security: Check if user has access to this log
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin)
            {
                if (patient != null && log.PatientId != patient.PatientId)
                {
                    return Forbid("You can only delete your own mood logs.");
                }
                if (patient == null)
                {
                    return Unauthorized();
                }
            }

            _context.MoodLogs.Remove(log);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting mood log {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }
}
