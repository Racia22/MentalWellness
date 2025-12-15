using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using MentalWellness.API.Data;
using MentalWellness.API.DTOs.TreatmentPlan;
using MentalWellness.API.DTOs.Common;
using MentalWellness.API.Models;

namespace MentalWellness.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TreatmentPlanController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TreatmentPlanController> _logger;

    public TreatmentPlanController(ApplicationDbContext context, ILogger<TreatmentPlanController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTreatmentPlans([FromQuery] Guid? patientId = null, [FromQuery] Guid? doctorId = null, [FromQuery] string? status = null)
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

            var query = _context.TreatmentPlans
                .Include(t => t.Patient).ThenInclude(p => p.User)
                .Include(t => t.Doctor).ThenInclude(d => d.User)
                .AsQueryable();

            // Security: Patients can only see their own treatment plans
            if (patient != null && !isAdmin)
            {
                query = query.Where(t => t.PatientId == patient.PatientId);
            }
            // Security: Doctors can only see plans they created
            else if (doctor != null && !isAdmin)
            {
                query = query.Where(t => t.DoctorId == doctor.DoctorId);
            }
            // Admins can see all, or use filters if provided
            else if (isAdmin)
            {
                if (patientId.HasValue)
                    query = query.Where(t => t.PatientId == patientId.Value);

                if (doctorId.HasValue)
                    query = query.Where(t => t.DoctorId == doctorId.Value);
            }
            else
            {
                return Unauthorized();
            }

            if (!string.IsNullOrEmpty(status))
                query = query.Where(t => t.Status == status);

            var plans = await query
                .Select(t => new TreatmentPlanDto
                {
                    TreatmentPlanId = t.TreatmentPlanId,
                    PatientId = t.PatientId,
                    DoctorId = t.DoctorId,
                    AppointmentId = t.AppointmentId,
                    MedicalRecordId = t.MedicalRecordId,
                    Title = t.Title,
                    Description = t.Description,
                    Goals = t.Goals,
                    Tasks = t.Tasks,
                    StartDate = t.StartDate,
                    EndDate = t.EndDate,
                    Status = t.Status,
                    ProgressNotes = t.ProgressNotes,
                    PatientName = t.Patient.User.FullName,
                    DoctorName = t.Doctor.User.FullName,
                    CreatedAt = t.CreatedAt
                })
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(plans);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting treatment plans");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTreatmentPlan(Guid id)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            var plan = await _context.TreatmentPlans
                .Include(t => t.Patient).ThenInclude(p => p.User)
                .Include(t => t.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(t => t.TreatmentPlanId == id);

            if (plan == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Treatment plan not found" });
            }

            // Security: Check if user has access to this plan
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin)
            {
                if (patient != null && plan.PatientId != patient.PatientId)
                {
                    return Forbid("You can only view your own treatment plans.");
                }
                if (doctor != null && plan.DoctorId != doctor.DoctorId)
                {
                    return Forbid("You can only view treatment plans you created.");
                }
                if (patient == null && doctor == null)
                {
                    return Unauthorized();
                }
            }

            var planDto = new TreatmentPlanDto
            {
                TreatmentPlanId = plan.TreatmentPlanId,
                PatientId = plan.PatientId,
                DoctorId = plan.DoctorId,
                AppointmentId = plan.AppointmentId,
                MedicalRecordId = plan.MedicalRecordId,
                Title = plan.Title,
                Description = plan.Description,
                Goals = plan.Goals,
                Tasks = plan.Tasks,
                StartDate = plan.StartDate,
                EndDate = plan.EndDate,
                Status = plan.Status,
                ProgressNotes = plan.ProgressNotes,
                PatientName = plan.Patient.User.FullName,
                DoctorName = plan.Doctor.User.FullName,
                CreatedAt = plan.CreatedAt
            };

            return Ok(planDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting treatment plan {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateTreatmentPlan([FromBody] CreateTreatmentPlanDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            // Only doctors and admins can create treatment plans
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            if (doctor == null && !isAdmin)
            {
                return Forbid("Only doctors can create treatment plans.");
            }

            // If not admin, ensure doctor is creating plan with their own DoctorId
            if (!isAdmin && doctor != null && dto.DoctorId != doctor.DoctorId)
            {
                return Forbid("You can only create treatment plans with your own doctor ID.");
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                _logger.LogWarning("Invalid model state for CreateTreatmentPlan: {Errors}", string.Join(", ", errors));
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Invalid request data: " + string.Join(", ", errors) });
            }

            // Validate that Patient exists
            var patientExists = await _context.Patients.AnyAsync(p => p.PatientId == dto.PatientId);
            if (!patientExists)
            {
                _logger.LogWarning("Attempted to create treatment plan with invalid PatientId: {PatientId}", dto.PatientId);
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Invalid PatientId. Patient not found." });
            }

            // Validate that Doctor exists
            var doctorExists = await _context.Doctors.AnyAsync(d => d.DoctorId == dto.DoctorId);
            if (!doctorExists)
            {
                _logger.LogWarning("Attempted to create treatment plan with invalid DoctorId: {DoctorId}", dto.DoctorId);
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Invalid DoctorId. Doctor not found." });
            }

            // Validate AppointmentId if provided
            if (dto.AppointmentId.HasValue)
            {
                var appointmentExists = await _context.Appointments.AnyAsync(a => a.AppointmentId == dto.AppointmentId.Value);
                if (!appointmentExists)
                {
                    _logger.LogWarning("Attempted to create treatment plan with invalid AppointmentId: {AppointmentId}", dto.AppointmentId);
                    return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Invalid AppointmentId. Appointment not found." });
                }
            }

            // Validate MedicalRecordId if provided
            if (dto.MedicalRecordId.HasValue)
            {
                var medicalRecordExists = await _context.MedicalRecords.AnyAsync(m => m.MedicalRecordId == dto.MedicalRecordId.Value);
                if (!medicalRecordExists)
                {
                    _logger.LogWarning("Attempted to create treatment plan with invalid MedicalRecordId: {MedicalRecordId}", dto.MedicalRecordId);
                    return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Invalid MedicalRecordId. Medical record not found." });
                }
            }

            var plan = new TreatmentPlan
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                AppointmentId = dto.AppointmentId,
                MedicalRecordId = dto.MedicalRecordId,
                Title = dto.Title,
                Description = dto.Description,
                Goals = dto.Goals,
                Tasks = dto.Tasks,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TreatmentPlans.Add(plan);
            await _context.SaveChangesAsync();

            // Load the plan with related data for response
            var createdPlan = await _context.TreatmentPlans
                .Include(t => t.Patient).ThenInclude(p => p.User)
                .Include(t => t.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(t => t.TreatmentPlanId == plan.TreatmentPlanId);

            if (createdPlan == null)
            {
                _logger.LogError("Failed to retrieve created treatment plan with ID: {TreatmentPlanId}", plan.TreatmentPlanId);
                return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "Treatment plan was created but could not be retrieved." });
            }

            var planDto = new TreatmentPlanDto
            {
                TreatmentPlanId = createdPlan.TreatmentPlanId,
                PatientId = createdPlan.PatientId,
                DoctorId = createdPlan.DoctorId,
                AppointmentId = createdPlan.AppointmentId,
                MedicalRecordId = createdPlan.MedicalRecordId,
                Title = createdPlan.Title,
                Description = createdPlan.Description,
                Goals = createdPlan.Goals,
                Tasks = createdPlan.Tasks,
                StartDate = createdPlan.StartDate,
                EndDate = createdPlan.EndDate,
                Status = createdPlan.Status,
                ProgressNotes = createdPlan.ProgressNotes,
                PatientName = createdPlan.Patient.User.FullName,
                DoctorName = createdPlan.Doctor.User.FullName,
                CreatedAt = createdPlan.CreatedAt
            };

            return CreatedAtAction(nameof(GetTreatmentPlan), new { id = plan.TreatmentPlanId }, planDto);
        }
        catch (DbUpdateException dbEx)
        {
            _logger.LogError(dbEx, "Database error creating treatment plan. PatientId: {PatientId}, DoctorId: {DoctorId}", dto.PatientId, dto.DoctorId);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "Database error occurred. Please check that PatientId and DoctorId are valid." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating treatment plan. PatientId: {PatientId}, DoctorId: {DoctorId}. Error: {Error}", 
                dto.PatientId, dto.DoctorId, ex.Message);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = $"An error occurred: {ex.Message}" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTreatmentPlan(Guid id, [FromBody] UpdateTreatmentPlanDto dto)
    {
        try
        {
            var plan = await _context.TreatmentPlans.FindAsync(id);
            if (plan == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Treatment plan not found" });
            }

            if (!string.IsNullOrEmpty(dto.Title)) plan.Title = dto.Title;
            if (dto.Description != null) plan.Description = dto.Description;
            if (dto.Goals != null) plan.Goals = dto.Goals;
            if (dto.Tasks != null) plan.Tasks = dto.Tasks;
            if (dto.StartDate.HasValue) plan.StartDate = dto.StartDate.Value;
            if (dto.EndDate.HasValue) plan.EndDate = dto.EndDate;
            if (!string.IsNullOrEmpty(dto.Status)) plan.Status = dto.Status;
            if (dto.ProgressNotes != null) plan.ProgressNotes = dto.ProgressNotes;

            plan.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(plan);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating treatment plan {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTreatmentPlan(Guid id)
    {
        try
        {
            var plan = await _context.TreatmentPlans.FindAsync(id);
            if (plan == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Treatment plan not found" });
            }

            _context.TreatmentPlans.Remove(plan);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting treatment plan {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }
}
