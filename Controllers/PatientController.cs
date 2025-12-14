using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.DTOs.Patient;
using MentalWellness.API.DTOs.Common;
using MentalWellness.API.Models;

namespace MentalWellness.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PatientController> _logger;

    public PatientController(ApplicationDbContext context, ILogger<PatientController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPatients()
    {
        try
        {
            var patients = await _context.Patients
                .Include(p => p.User)
                .Select(p => new PatientDto
                {
                    PatientId = p.PatientId,
                    UserId = p.UserId,
                    PatientIDNumber = p.PatientIDNumber,
                    Age = p.Age,
                    Category = p.Category,
                    Gender = p.Gender,
                    DateOfBirth = p.DateOfBirth,
                    Address = p.Address,
                    EmergencyContact = p.EmergencyContact,
                    EmergencyContactPhone = p.EmergencyContactPhone,
                    Email = p.User.Email,
                    FullName = p.User.FullName,
                    Phone = p.User.Phone,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();
            
            return Ok(patients);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all patients");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("by-user/{userId}")]
    public async Task<IActionResult> GetPatientByUserId(Guid userId)
    {
        try
        {
            var patient = await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patient == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Patient profile not found" });
            }

            var patientDto = new PatientDto
            {
                PatientId = patient.PatientId,
                UserId = patient.UserId,
                PatientIDNumber = patient.PatientIDNumber,
                Age = patient.Age,
                Category = patient.Category,
                Gender = patient.Gender,
                DateOfBirth = patient.DateOfBirth,
                Address = patient.Address,
                EmergencyContact = patient.EmergencyContact,
                EmergencyContactPhone = patient.EmergencyContactPhone,
                Email = patient.User.Email,
                FullName = patient.User.FullName,
                Phone = patient.User.Phone,
                CreatedAt = patient.CreatedAt
            };

            return Ok(patientDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting patient by userId {UserId}", userId);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPatient(Guid id)
    {
        try
        {
            var patient = await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.PatientId == id);

            if (patient == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Patient not found" });
            }

            var patientDto = new PatientDto
            {
                PatientId = patient.PatientId,
                UserId = patient.UserId,
                PatientIDNumber = patient.PatientIDNumber,
                Age = patient.Age,
                Category = patient.Category,
                Gender = patient.Gender,
                DateOfBirth = patient.DateOfBirth,
                Address = patient.Address,
                EmergencyContact = patient.EmergencyContact,
                EmergencyContactPhone = patient.EmergencyContactPhone,
                Email = patient.User.Email,
                FullName = patient.User.FullName,
                Phone = patient.User.Phone,
                CreatedAt = patient.CreatedAt
            };

            return Ok(patientDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting patient {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreatePatient([FromBody] CreatePatientDto dto)
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

            var patient = new Patient
            {
                UserId = dto.UserId,
                PatientIDNumber = patientIdNumber,
                Age = dto.Age,
                Category = dto.Category,
                Gender = dto.Gender,
                DateOfBirth = dto.DateOfBirth,
                Address = dto.Address,
                EmergencyContact = dto.EmergencyContact,
                EmergencyContactPhone = dto.EmergencyContactPhone,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPatient), new { id = patient.PatientId }, patient);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating patient");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePatient(Guid id, [FromBody] UpdatePatientDto dto)
    {
        try
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Patient not found" });
            }

            if (dto.Age.HasValue) patient.Age = dto.Age.Value;
            if (!string.IsNullOrEmpty(dto.Category)) patient.Category = dto.Category;
            if (!string.IsNullOrEmpty(dto.Gender)) patient.Gender = dto.Gender;
            if (dto.DateOfBirth.HasValue) patient.DateOfBirth = dto.DateOfBirth.Value;
            if (dto.Address != null) patient.Address = dto.Address;
            if (dto.EmergencyContact != null) patient.EmergencyContact = dto.EmergencyContact;
            if (dto.EmergencyContactPhone != null) patient.EmergencyContactPhone = dto.EmergencyContactPhone;

            patient.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(patient);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating patient {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePatient(Guid id)
    {
        try
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Patient not found" });
            }

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting patient {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }
}
