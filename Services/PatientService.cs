using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.Models;
using MentalWellness.API.DTOs.Patient;
using MentalWellness.API.Helpers;

namespace MentalWellness.API.Services;

public class PatientService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<PatientService> _logger;

    public PatientService(ApplicationDbContext context, ILogger<PatientService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<PatientDto>> GetAllPatientsAsync()
    {
        return await _context.Patients
            .Include(p => p.User)
            .Select(p => p.ToPatientDto())
            .ToListAsync();
    }

    public async Task<PatientDto?> GetPatientByIdAsync(Guid patientId)
    {
        var patient = await _context.Patients
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.PatientId == patientId);

        return patient?.ToPatientDto();
    }

    public async Task<PatientDto> CreatePatientAsync(CreatePatientDto dto)
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

        return patient.ToPatientDto();
    }

    public async Task<PatientDto?> UpdatePatientAsync(Guid patientId, UpdatePatientDto dto)
    {
        var patient = await _context.Patients.FindAsync(patientId);
        if (patient == null)
            return null;

        if (dto.Age.HasValue) patient.Age = dto.Age.Value;
        if (!string.IsNullOrEmpty(dto.Category)) patient.Category = dto.Category;
        if (!string.IsNullOrEmpty(dto.Gender)) patient.Gender = dto.Gender;
        if (dto.DateOfBirth.HasValue) patient.DateOfBirth = dto.DateOfBirth.Value;
        if (dto.Address != null) patient.Address = dto.Address;
        if (dto.EmergencyContact != null) patient.EmergencyContact = dto.EmergencyContact;
        if (dto.EmergencyContactPhone != null) patient.EmergencyContactPhone = dto.EmergencyContactPhone;

        patient.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetPatientByIdAsync(patientId);
    }

    public async Task<bool> DeletePatientAsync(Guid patientId)
    {
        var patient = await _context.Patients.FindAsync(patientId);
        if (patient == null)
            return false;

        _context.Patients.Remove(patient);
        await _context.SaveChangesAsync();

        return true;
    }
}
