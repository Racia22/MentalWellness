using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.Models;
using MentalWellness.API.DTOs.Feedback;

namespace MentalWellness.API.Services;

public class FeedbackService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FeedbackService> _logger;

    public FeedbackService(ApplicationDbContext context, ILogger<FeedbackService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<FeedbackDto>> GetAllFeedbacksAsync(Guid? doctorId = null, bool? isApproved = null)
    {
        var query = _context.Feedbacks
            .Include(f => f.Patient).ThenInclude(p => p.User)
            .Include(f => f.Doctor).ThenInclude(d => d.User)
            .AsQueryable();

        if (doctorId.HasValue)
            query = query.Where(f => f.DoctorId == doctorId.Value);

        if (isApproved.HasValue)
            query = query.Where(f => f.IsApproved == isApproved.Value);

        return await query
            .Select(f => new FeedbackDto
            {
                FeedbackId = f.FeedbackId,
                PatientId = f.PatientId,
                DoctorId = f.DoctorId,
                AppointmentId = f.AppointmentId,
                Rating = f.Rating,
                ReviewTitle = f.ReviewTitle,
                ReviewText = f.ReviewText,
                IsAnonymous = f.IsAnonymous,
                IsApproved = f.IsApproved,
                DoctorResponse = f.DoctorResponse,
                PatientName = f.IsAnonymous ? "Anonymous" : f.Patient.User.FullName,
                DoctorName = f.Doctor.User.FullName,
                CreatedAt = f.CreatedAt
            })
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<FeedbackDto> CreateFeedbackAsync(CreateFeedbackDto dto)
    {
        var feedback = new Feedback
        {
            PatientId = dto.PatientId,
            DoctorId = dto.DoctorId,
            AppointmentId = dto.AppointmentId,
            Rating = dto.Rating,
            ReviewTitle = dto.ReviewTitle,
            ReviewText = dto.ReviewText,
            IsAnonymous = dto.IsAnonymous,
            IsApproved = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Feedbacks.Add(feedback);
        await _context.SaveChangesAsync();

        // Update doctor rating
        await UpdateDoctorRatingAsync(dto.DoctorId);

        var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.PatientId == dto.PatientId);
        var doctor = await _context.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.DoctorId == dto.DoctorId);

        return new FeedbackDto
        {
            FeedbackId = feedback.FeedbackId,
            PatientId = feedback.PatientId,
            DoctorId = feedback.DoctorId,
            AppointmentId = feedback.AppointmentId,
            Rating = feedback.Rating,
            ReviewTitle = feedback.ReviewTitle,
            ReviewText = feedback.ReviewText,
            IsAnonymous = feedback.IsAnonymous,
            IsApproved = feedback.IsApproved,
            PatientName = feedback.IsAnonymous ? "Anonymous" : patient?.User?.FullName ?? string.Empty,
            DoctorName = doctor?.User?.FullName ?? string.Empty,
            CreatedAt = feedback.CreatedAt
        };
    }

    public async Task<bool> ApproveFeedbackAsync(Guid feedbackId, Guid approvedBy)
    {
        var feedback = await _context.Feedbacks.FindAsync(feedbackId);
        if (feedback == null)
            return false;

        feedback.IsApproved = true;
        feedback.ApprovedBy = approvedBy;
        feedback.ApprovedAt = DateTime.UtcNow;
        feedback.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Update doctor rating
        await UpdateDoctorRatingAsync(feedback.DoctorId);

        return true;
    }

    private async Task UpdateDoctorRatingAsync(Guid doctorId)
    {
        var approvedFeedbacks = await _context.Feedbacks
            .Where(f => f.DoctorId == doctorId && f.IsApproved)
            .ToListAsync();

        if (approvedFeedbacks.Any())
        {
            var averageRating = approvedFeedbacks.Average(f => f.Rating);
            var totalReviews = approvedFeedbacks.Count;

            var doctor = await _context.Doctors.FindAsync(doctorId);
            if (doctor != null)
            {
                doctor.AverageRating = (decimal)averageRating;
                doctor.TotalReviews = totalReviews;
                doctor.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }
}
