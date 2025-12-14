namespace MentalWellness.API.DTOs.MoodLog;

public class MoodLogDto
{
    public Guid MoodLogId { get; set; }
    public Guid PatientId { get; set; }
    public DateTime LogDate { get; set; }
    public int MoodScore { get; set; }
    public string StressLevel { get; set; } = string.Empty;
    public decimal SleepHours { get; set; }
    public string EnergyLevel { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? Activities { get; set; }
    public string? Triggers { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
