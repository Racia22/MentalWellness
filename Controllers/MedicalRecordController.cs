using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using MentalWellness.API.Data;
using MentalWellness.API.DTOs.MedicalRecord;
using MentalWellness.API.DTOs.Common;
using MentalWellness.API.Models;

namespace MentalWellness.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MedicalRecordController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MedicalRecordController> _logger;

    public MedicalRecordController(ApplicationDbContext context, ILogger<MedicalRecordController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllMedicalRecords([FromQuery] Guid? patientId = null, [FromQuery] Guid? doctorId = null)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            // Check if current user is a patient or doctor
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            var query = _context.MedicalRecords
                .Include(m => m.Patient).ThenInclude(p => p.User)
                .Include(m => m.Doctor).ThenInclude(d => d.User)
                .AsQueryable();

            // Security: Patients can only see their own records
            if (patient != null && !isAdmin)
            {
                query = query.Where(m => m.PatientId == patient.PatientId);
            }
            // Security: Doctors can only see records they created
            else if (doctor != null && !isAdmin)
            {
                query = query.Where(m => m.DoctorId == doctor.DoctorId);
            }
            // Admins can see all, or use filters if provided
            else if (isAdmin)
            {
                if (patientId.HasValue)
                    query = query.Where(m => m.PatientId == patientId.Value);

                if (doctorId.HasValue)
                    query = query.Where(m => m.DoctorId == doctorId.Value);
            }
            else
            {
                return Unauthorized();
            }

            var records = await query
                .Select(m => new MedicalRecordDto
                {
                    MedicalRecordId = m.MedicalRecordId,
                    PatientId = m.PatientId,
                    DoctorId = m.DoctorId,
                    AppointmentId = m.AppointmentId,
                    SessionNotes = m.SessionNotes,
                    ChiefComplaint = m.ChiefComplaint,
                    Diagnosis = m.Diagnosis,
                    PrescriptionDetails = m.PrescriptionDetails,
                    VitalSigns = m.VitalSigns,
                    Attachments = m.Attachments,
                    PatientName = m.Patient.User.FullName,
                    DoctorName = m.Doctor.User.FullName,
                    CreatedAt = m.CreatedAt
                })
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return Ok(records);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting medical records");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMedicalRecord(Guid id)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            var record = await _context.MedicalRecords
                .Include(m => m.Patient).ThenInclude(p => p.User)
                .Include(m => m.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(m => m.MedicalRecordId == id);

            if (record == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Medical record not found" });
            }

            // Security: Check if user has access to this record
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin)
            {
                if (patient != null && record.PatientId != patient.PatientId)
                {
                    return Forbid("You can only view your own medical records.");
                }
                if (doctor != null && record.DoctorId != doctor.DoctorId)
                {
                    return Forbid("You can only view records you created.");
                }
                if (patient == null && doctor == null)
                {
                    return Unauthorized();
                }
            }

            var recordDto = new MedicalRecordDto
            {
                MedicalRecordId = record.MedicalRecordId,
                PatientId = record.PatientId,
                DoctorId = record.DoctorId,
                AppointmentId = record.AppointmentId,
                SessionNotes = record.SessionNotes,
                ChiefComplaint = record.ChiefComplaint,
                Diagnosis = record.Diagnosis,
                PrescriptionDetails = record.PrescriptionDetails,
                VitalSigns = record.VitalSigns,
                Attachments = record.Attachments,
                PatientName = record.Patient.User.FullName,
                DoctorName = record.Doctor.User.FullName,
                CreatedAt = record.CreatedAt
            };

            return Ok(recordDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting medical record {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateMedicalRecord([FromBody] CreateMedicalRecordDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            // Only doctors and admins can create medical records
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            if (doctor == null && !isAdmin)
            {
                return Forbid("Only doctors can create medical records.");
            }

            // If not admin, ensure doctor is creating record with their own DoctorId
            if (!isAdmin && doctor != null && dto.DoctorId != doctor.DoctorId)
            {
                return Forbid("You can only create medical records with your own doctor ID.");
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                _logger.LogWarning("Invalid model state for CreateMedicalRecord: {Errors}", string.Join(", ", errors));
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Invalid request data: " + string.Join(", ", errors) });
            }

            // Validate that Patient exists
            var patientExists = await _context.Patients.AnyAsync(p => p.PatientId == dto.PatientId);
            if (!patientExists)
            {
                _logger.LogWarning("Attempted to create medical record with invalid PatientId: {PatientId}", dto.PatientId);
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Invalid PatientId. Patient not found." });
            }

            // Validate that Doctor exists
            var doctorExists = await _context.Doctors.AnyAsync(d => d.DoctorId == dto.DoctorId);
            if (!doctorExists)
            {
                _logger.LogWarning("Attempted to create medical record with invalid DoctorId: {DoctorId}", dto.DoctorId);
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Invalid DoctorId. Doctor not found." });
            }

            // Validate AppointmentId if provided
            if (dto.AppointmentId.HasValue)
            {
                var appointmentExists = await _context.Appointments.AnyAsync(a => a.AppointmentId == dto.AppointmentId.Value);
                if (!appointmentExists)
                {
                    _logger.LogWarning("Attempted to create medical record with invalid AppointmentId: {AppointmentId}", dto.AppointmentId);
                    return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Invalid AppointmentId. Appointment not found." });
                }
            }

            var record = new MedicalRecord
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                AppointmentId = dto.AppointmentId,
                SessionNotes = dto.SessionNotes,
                ChiefComplaint = dto.ChiefComplaint,
                Diagnosis = dto.Diagnosis,
                PrescriptionDetails = dto.PrescriptionDetails,
                VitalSigns = dto.VitalSigns,
                Attachments = dto.Attachments,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.MedicalRecords.Add(record);
            await _context.SaveChangesAsync();

            // Load the record with related data for response
            var createdRecord = await _context.MedicalRecords
                .Include(m => m.Patient).ThenInclude(p => p.User)
                .Include(m => m.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(m => m.MedicalRecordId == record.MedicalRecordId);

            var recordDto = new MedicalRecordDto
            {
                MedicalRecordId = createdRecord.MedicalRecordId,
                PatientId = createdRecord.PatientId,
                DoctorId = createdRecord.DoctorId,
                AppointmentId = createdRecord.AppointmentId,
                SessionNotes = createdRecord.SessionNotes,
                ChiefComplaint = createdRecord.ChiefComplaint,
                Diagnosis = createdRecord.Diagnosis,
                PrescriptionDetails = createdRecord.PrescriptionDetails,
                VitalSigns = createdRecord.VitalSigns,
                Attachments = createdRecord.Attachments,
                PatientName = createdRecord.Patient.User.FullName,
                DoctorName = createdRecord.Doctor.User.FullName,
                CreatedAt = createdRecord.CreatedAt
            };

            return CreatedAtAction(nameof(GetMedicalRecord), new { id = record.MedicalRecordId }, recordDto);
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError(dbEx, "Database error creating medical record. PatientId: {PatientId}, DoctorId: {DoctorId}", dto.PatientId, dto.DoctorId);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "Database error occurred. Please check that PatientId and DoctorId are valid." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating medical record. PatientId: {PatientId}, DoctorId: {DoctorId}. Error: {Error}", 
                dto.PatientId, dto.DoctorId, ex.Message);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = $"An error occurred: {ex.Message}" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMedicalRecord(Guid id, [FromBody] CreateMedicalRecordDto dto)
    {
        try
        {
            var record = await _context.MedicalRecords.FindAsync(id);
            if (record == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Medical record not found" });
            }

            record.SessionNotes = dto.SessionNotes;
            record.ChiefComplaint = dto.ChiefComplaint;
            record.Diagnosis = dto.Diagnosis;
            record.PrescriptionDetails = dto.PrescriptionDetails;
            record.VitalSigns = dto.VitalSigns;
            record.Attachments = dto.Attachments;
            record.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(record);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating medical record {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedicalRecord(Guid id)
    {
        try
        {
            var record = await _context.MedicalRecords.FindAsync(id);
            if (record == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Medical record not found" });
            }

            _context.MedicalRecords.Remove(record);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting medical record {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }
}
