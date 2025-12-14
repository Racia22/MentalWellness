using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.DTOs.Feedback;
using MentalWellness.API.DTOs.Common;
using MentalWellness.API.Models;

namespace MentalWellness.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedbackController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<FeedbackController> _logger;

    public FeedbackController(ApplicationDbContext context, ILogger<FeedbackController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllFeedbacks([FromQuery] Guid? doctorId = null, [FromQuery] bool? isApproved = null)
    {
        try
        {
            var query = _context.Feedbacks
                .Include(f => f.Patient).ThenInclude(p => p.User)
                .Include(f => f.Doctor).ThenInclude(d => d.User)
                .AsQueryable();

            if (doctorId.HasValue)
                query = query.Where(f => f.DoctorId == doctorId.Value);

            if (isApproved.HasValue)
                query = query.Where(f => f.IsApproved == isApproved.Value);

            var feedbacks = await query
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

            return Ok(feedbacks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting feedbacks");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetFeedback(Guid id)
    {
        try
        {
            var feedback = await _context.Feedbacks
                .Include(f => f.Patient).ThenInclude(p => p.User)
                .Include(f => f.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(f => f.FeedbackId == id);

            if (feedback == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Feedback not found" });
            }

            var feedbackDto = new FeedbackDto
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
                DoctorResponse = feedback.DoctorResponse,
                PatientName = feedback.IsAnonymous ? "Anonymous" : feedback.Patient.User.FullName,
                DoctorName = feedback.Doctor.User.FullName,
                CreatedAt = feedback.CreatedAt
            };

            return Ok(feedbackDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting feedback {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackDto dto)
    {
        try
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
            await UpdateDoctorRating(dto.DoctorId);

            return CreatedAtAction(nameof(GetFeedback), new { id = feedback.FeedbackId }, feedback);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating feedback");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost("{id}/approve")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveFeedback(Guid id)
    {
        try
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Feedback not found" });
            }

            feedback.IsApproved = true;
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim != null && Guid.TryParse(userIdClaim, out var approvedBy))
            {
                feedback.ApprovedBy = approvedBy;
                feedback.ApprovedAt = DateTime.UtcNow;
            }

            feedback.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Update doctor rating
            await UpdateDoctorRating(feedback.DoctorId);

            return Ok(new { Message = "Feedback approved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving feedback {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFeedback(Guid id, [FromBody] CreateFeedbackDto dto)
    {
        try
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Feedback not found" });
            }

            feedback.Rating = dto.Rating;
            if (!string.IsNullOrEmpty(dto.ReviewTitle)) feedback.ReviewTitle = dto.ReviewTitle;
            if (!string.IsNullOrEmpty(dto.ReviewText)) feedback.ReviewText = dto.ReviewText;
            feedback.IsAnonymous = dto.IsAnonymous;
            feedback.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Update doctor rating
            await UpdateDoctorRating(feedback.DoctorId);

            return Ok(feedback);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating feedback {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost("{id}/respond")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Doctor")]
    public async Task<IActionResult> RespondToFeedback(Guid id, [FromBody] string response)
    {
        try
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Feedback not found" });
            }

            feedback.DoctorResponse = response;
            feedback.RespondedAt = DateTime.UtcNow;
            feedback.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Response added successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error responding to feedback {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFeedback(Guid id)
    {
        try
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Feedback not found" });
            }

            var doctorId = feedback.DoctorId;

            _context.Feedbacks.Remove(feedback);
            await _context.SaveChangesAsync();

            // Update doctor rating after deletion
            await UpdateDoctorRating(doctorId);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting feedback {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    private async Task UpdateDoctorRating(Guid doctorId)
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
