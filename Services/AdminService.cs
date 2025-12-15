using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;

namespace MentalWellness.API.Services;

public class AdminService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AdminService> _logger;

    public AdminService(ApplicationDbContext context, ILogger<AdminService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Dictionary<string, object>> GetDashboardStatsAsync()
    {
        return new Dictionary<string, object>
        {
            { "TotalUsers", await _context.Users.CountAsync() },
            { "TotalPatients", await _context.Patients.CountAsync() },
            { "TotalDoctors", await _context.Doctors.CountAsync() },
            { "PendingDoctors", await _context.Doctors.CountAsync(d => !d.IsApproved) },
            { "TotalAppointments", await _context.Appointments.CountAsync() },
            { "UpcomingAppointments", await _context.Appointments.CountAsync(a => a.AppointmentDate >= DateTime.UtcNow.Date && a.Status == "Scheduled") },
            { "TotalPayments", await _context.Payments.CountAsync() },
            { "TotalRevenue", await _context.Payments.Where(p => p.PaymentStatus == "Completed").SumAsync(p => (double)p.Amount) },
            { "TotalMedicalRecords", await _context.MedicalRecords.CountAsync() },
            { "TotalTreatmentPlans", await _context.TreatmentPlans.CountAsync() },
            { "ActiveTreatmentPlans", await _context.TreatmentPlans.CountAsync(t => t.Status == "Active") },
            { "TotalFeedbacks", await _context.Feedbacks.CountAsync() },
            { "PendingFeedbacks", await _context.Feedbacks.CountAsync(f => !f.IsApproved) }
        };
    }

    public async Task<List<object>> GetUsersAsync(string? role = null, bool? isActive = null)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrEmpty(role))
            query = query.Where(u => u.UserRole == role);

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        return await query
            .Select(u => new
            {
                u.UserId,
                u.Email,
                u.FullName,
                u.Phone,
                u.UserRole,
                u.IsActive,
                u.CreatedAt,
                u.LastLoginAt
            })
            .Cast<object>()
            .ToListAsync();
    }

    public async Task<bool> ActivateUserAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return false;

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeactivateUserAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return false;

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }
}
