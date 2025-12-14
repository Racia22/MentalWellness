using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.Models;
using MentalWellness.API.DTOs.Appointment;
using MentalWellness.API.Helpers;

namespace MentalWellness.API.Services;

public class AppointmentService
{
    private readonly ApplicationDbContext _context;
    private readonly NotificationService _notificationService;
    private readonly ILogger<AppointmentService> _logger;

    public AppointmentService(
        ApplicationDbContext context,
        NotificationService notificationService,
        ILogger<AppointmentService> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<List<AppointmentDto>> GetAllAppointmentsAsync(Guid? patientId = null, Guid? doctorId = null, string? status = null)
    {
        var query = _context.Appointments
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Doctor).ThenInclude(d => d.User)
            .AsQueryable();

        if (patientId.HasValue)
            query = query.Where(a => a.PatientId == patientId.Value);

        if (doctorId.HasValue)
            query = query.Where(a => a.DoctorId == doctorId.Value);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(a => a.Status == status);

        return await query
            .Select(a => a.ToAppointmentDto())
            .OrderByDescending(a => a.AppointmentDate)
            .ThenByDescending(a => a.AppointmentTime)
            .ToListAsync();
    }

    public async Task<AppointmentDto?> GetAppointmentByIdAsync(Guid appointmentId)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Doctor).ThenInclude(d => d.User)
            .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);

        return appointment?.ToAppointmentDto();
    }

    public async Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentDto dto)
    {
        var appointment = new Appointment
        {
            PatientId = dto.PatientId,
            DoctorId = dto.DoctorId,
            AppointmentDate = dto.AppointmentDate.Date,
            AppointmentTime = dto.AppointmentTime,
            Duration = dto.Duration,
            AppointmentType = dto.AppointmentType,
            Status = "Scheduled",
            Amount = dto.Amount,
            IsPaid = false,
            PatientNotes = dto.PatientNotes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        // Send notification
        var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.PatientId == dto.PatientId);
        var doctor = await _context.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.DoctorId == dto.DoctorId);

        if (patient != null && doctor != null)
        {
            await _notificationService.NotifyAppointmentCreatedAsync(
                patient.UserId,
                appointment.AppointmentId,
                appointment.AppointmentDate,
                appointment.AppointmentTime,
                doctor.User.FullName
            );
        }

        return appointment.ToAppointmentDto();
    }

    public async Task<bool> CheckAvailabilityAsync(Guid doctorId, DateTime appointmentDate, TimeSpan appointmentTime, int duration)
    {
        var endTime = appointmentTime.Add(TimeSpan.FromMinutes(duration));

        var conflicting = await _context.Appointments
            .Where(a => a.DoctorId == doctorId &&
                       a.AppointmentDate == appointmentDate.Date &&
                       a.Status != "Cancelled" &&
                       a.Status != "NoShow" &&
                       ((a.AppointmentTime <= appointmentTime && a.AppointmentTime.Add(TimeSpan.FromMinutes(a.Duration)) > appointmentTime) ||
                        (a.AppointmentTime < endTime && a.AppointmentTime >= appointmentTime)))
            .AnyAsync();

        return !conflicting;
    }

    public async Task<bool> CancelAppointmentAsync(Guid appointmentId, string? reason, Guid? cancelledBy = null)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);

        if (appointment == null)
            return false;

        appointment.Status = "Cancelled";
        appointment.CancellationReason = reason;
        appointment.CancelledBy = cancelledBy;
        appointment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Send notification
        if (appointment.Patient != null)
        {
            await _notificationService.NotifyAppointmentCancelledAsync(
                appointment.Patient.UserId,
                appointmentId,
                reason ?? "No reason provided"
            );
        }

        return true;
    }
}
