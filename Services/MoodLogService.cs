using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.Models;
using MentalWellness.API.DTOs.MoodLog;

namespace MentalWellness.API.Services;

public class MoodLogService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<MoodLogService> _logger;

    public MoodLogService(ApplicationDbContext context, ILogger<MoodLogService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<MoodLogDto>> GetAllMoodLogsAsync(Guid? patientId = null, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.MoodLogs
            .Include(m => m.Patient).ThenInclude(p => p.User)
            .AsQueryable();

        if (patientId.HasValue)
            query = query.Where(m => m.PatientId == patientId.Value);

        if (startDate.HasValue)
            query = query.Where(m => m.LogDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(m => m.LogDate <= endDate.Value);

        return await query
            .Select(m => new MoodLogDto
            {
                MoodLogId = m.MoodLogId,
                PatientId = m.PatientId,
                LogDate = m.LogDate,
                MoodScore = m.MoodScore,
                StressLevel = m.StressLevel,
                SleepHours = m.SleepHours,
                EnergyLevel = m.EnergyLevel,
                Notes = m.Notes,
                Activities = m.Activities,
                Triggers = m.Triggers,
                PatientName = m.Patient.User.FullName,
                CreatedAt = m.CreatedAt
            })
            .OrderByDescending(m => m.LogDate)
            .ToListAsync();
    }

    public async Task<MoodLogDto> CreateMoodLogAsync(CreateMoodLogDto dto)
    {
        var log = new MoodLog
        {
            PatientId = dto.PatientId,
            LogDate = dto.LogDate ?? DateTime.UtcNow,
            MoodScore = dto.MoodScore,
            StressLevel = dto.StressLevel,
            SleepHours = dto.SleepHours,
            EnergyLevel = dto.EnergyLevel,
            Notes = dto.Notes,
            Activities = dto.Activities,
            Triggers = dto.Triggers,
            CreatedAt = DateTime.UtcNow
        };

        _context.MoodLogs.Add(log);
        await _context.SaveChangesAsync();

        var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.PatientId == dto.PatientId);

        return new MoodLogDto
        {
            MoodLogId = log.MoodLogId,
            PatientId = log.PatientId,
            LogDate = log.LogDate,
            MoodScore = log.MoodScore,
            StressLevel = log.StressLevel,
            SleepHours = log.SleepHours,
            EnergyLevel = log.EnergyLevel,
            Notes = log.Notes,
            Activities = log.Activities,
            Triggers = log.Triggers,
            PatientName = patient?.User?.FullName ?? string.Empty,
            CreatedAt = log.CreatedAt
        };
    }

    public async Task<Dictionary<string, object>> GetMoodTrendsAsync(Guid patientId, int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days);
        var logs = await _context.MoodLogs
            .Where(m => m.PatientId == patientId && m.LogDate >= startDate)
            .OrderBy(m => m.LogDate)
            .ToListAsync();

        var averageMood = logs.Any() ? logs.Average(m => m.MoodScore) : 0;
        var averageSleep = logs.Any() ? logs.Average(m => (double)m.SleepHours) : 0;
        var stressLevelCounts = logs.GroupBy(m => m.StressLevel)
            .ToDictionary(g => g.Key, g => g.Count());

        return new Dictionary<string, object>
        {
            { "AverageMoodScore", Math.Round(averageMood, 2) },
            { "AverageSleepHours", Math.Round(averageSleep, 2) },
            { "StressLevelDistribution", stressLevelCounts },
            { "TotalLogs", logs.Count },
            { "DaysAnalyzed", days }
        };
    }
}
