using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.Models;
using MentalWellness.API.DTOs.Doctor;
using MentalWellness.API.Helpers;

namespace MentalWellness.API.Services;

public class DoctorService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DoctorService> _logger;

    public DoctorService(ApplicationDbContext context, ILogger<DoctorService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<DoctorDto>> GetAllDoctorsAsync(bool? isApproved = null)
    {
        var query = _context.Doctors.Include(d => d.User).AsQueryable();

        if (isApproved.HasValue)
            query = query.Where(d => d.IsApproved == isApproved.Value);

        return await query
            .Select(d => d.ToDoctorDto())
            .ToListAsync();
    }

    public async Task<DoctorDto?> GetDoctorByIdAsync(Guid doctorId)
    {
        var doctor = await _context.Doctors
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.DoctorId == doctorId);

        return doctor?.ToDoctorDto();
    }

    public async Task<DoctorDto> CreateDoctorAsync(CreateDoctorDto dto)
    {
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

        return doctor.ToDoctorDto();
    }

    public async Task<DoctorDto?> UpdateDoctorAsync(Guid doctorId, UpdateDoctorDto dto)
    {
        var doctor = await _context.Doctors.FindAsync(doctorId);
        if (doctor == null)
            return null;

        if (!string.IsNullOrEmpty(dto.Specialty)) doctor.Specialty = dto.Specialty;
        if (!string.IsNullOrEmpty(dto.LicenseNumber)) doctor.LicenseNumber = dto.LicenseNumber;
        if (dto.YearsOfExperience.HasValue) doctor.YearsOfExperience = dto.YearsOfExperience.Value;
        if (dto.Bio != null) doctor.Bio = dto.Bio;
        if (dto.ConsultationFee.HasValue) doctor.ConsultationFee = dto.ConsultationFee.Value;

        doctor.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetDoctorByIdAsync(doctorId);
    }

    public async Task<bool> ApproveDoctorAsync(Guid doctorId, Guid approvedBy)
    {
        var doctor = await _context.Doctors.FindAsync(doctorId);
        if (doctor == null)
            return false;

        doctor.IsApproved = true;
        doctor.ApprovedBy = approvedBy;
        doctor.ApprovedAt = DateTime.UtcNow;
        doctor.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteDoctorAsync(Guid doctorId)
    {
        var doctor = await _context.Doctors.FindAsync(doctorId);
        if (doctor == null)
            return false;

        _context.Doctors.Remove(doctor);
        await _context.SaveChangesAsync();

        return true;
    }
}
