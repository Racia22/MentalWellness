using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.MoodLog;

public class CreateMoodLogDto
{
    [Required]
    public Guid PatientId { get; set; }

    public DateTime? LogDate { get; set; }

    [Required]
    [Range(1, 10)]
    public int MoodScore { get; set; }

    [Required]
    public string StressLevel { get; set; } = string.Empty;

    [Required]
    [Range(0, 24)]
    public decimal SleepHours { get; set; }

    [Required]
    public string EnergyLevel { get; set; } = string.Empty;

    public string? Notes { get; set; }

    public string? Activities { get; set; }

    public string? Triggers { get; set; }
}
