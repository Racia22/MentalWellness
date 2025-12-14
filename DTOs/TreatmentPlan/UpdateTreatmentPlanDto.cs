using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.TreatmentPlan;

public class UpdateTreatmentPlanDto
{
    [MaxLength(255)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    public string? Goals { get; set; }

    public string? Tasks { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public string? Status { get; set; }

    public string? ProgressNotes { get; set; }
}
