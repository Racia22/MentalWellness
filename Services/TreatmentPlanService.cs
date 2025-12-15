using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.Models;
using MentalWellness.API.DTOs.TreatmentPlan;

namespace MentalWellness.API.Services;

public class TreatmentPlanService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TreatmentPlanService> _logger;

    public TreatmentPlanService(ApplicationDbContext context, ILogger<TreatmentPlanService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<TreatmentPlanDto>> GetAllTreatmentPlansAsync(Guid? patientId = null, Guid? doctorId = null, string? status = null)
    {
        var query = _context.TreatmentPlans
            .Include(t => t.Patient).ThenInclude(p => p.User)
            .Include(t => t.Doctor).ThenInclude(d => d.User)
            .AsQueryable();

        if (patientId.HasValue)
            query = query.Where(t => t.PatientId == patientId.Value);

        if (doctorId.HasValue)
            query = query.Where(t => t.DoctorId == doctorId.Value);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(t => t.Status == status);

        return await query
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
    }

    public async Task<TreatmentPlanDto?> GetTreatmentPlanByIdAsync(Guid treatmentPlanId)
    {
        var plan = await _context.TreatmentPlans
            .Include(t => t.Patient).ThenInclude(p => p.User)
            .Include(t => t.Doctor).ThenInclude(d => d.User)
            .FirstOrDefaultAsync(t => t.TreatmentPlanId == treatmentPlanId);

        if (plan == null)
            return null;

        return new TreatmentPlanDto
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
    }

    public async Task<TreatmentPlanDto> CreateTreatmentPlanAsync(CreateTreatmentPlanDto dto)
    {
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

        return await GetTreatmentPlanByIdAsync(plan.TreatmentPlanId) ?? throw new Exception("Failed to retrieve created treatment plan");
    }
}
