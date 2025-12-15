using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.Models;
using MentalWellness.API.DTOs.MedicalRecord;

namespace MentalWellness.API.Services;

public class MedicalRecordService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MedicalRecordService> _logger;

    public MedicalRecordService(ApplicationDbContext context, ILogger<MedicalRecordService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<MedicalRecordDto>> GetAllMedicalRecordsAsync(Guid? patientId = null, Guid? doctorId = null)
    {
        var query = _context.MedicalRecords
            .Include(m => m.Patient).ThenInclude(p => p.User)
            .Include(m => m.Doctor).ThenInclude(d => d.User)
            .AsQueryable();

        if (patientId.HasValue)
            query = query.Where(m => m.PatientId == patientId.Value);

        if (doctorId.HasValue)
            query = query.Where(m => m.DoctorId == doctorId.Value);

        return await query
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
    }

    public async Task<MedicalRecordDto?> GetMedicalRecordByIdAsync(Guid medicalRecordId)
    {
        var record = await _context.MedicalRecords
            .Include(m => m.Patient).ThenInclude(p => p.User)
            .Include(m => m.Doctor).ThenInclude(d => d.User)
            .FirstOrDefaultAsync(m => m.MedicalRecordId == medicalRecordId);

        if (record == null)
            return null;

        return new MedicalRecordDto
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
    }

    public async Task<MedicalRecordDto> CreateMedicalRecordAsync(CreateMedicalRecordDto dto)
    {
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

        return await GetMedicalRecordByIdAsync(record.MedicalRecordId) ?? throw new Exception("Failed to retrieve created medical record");
    }
}
