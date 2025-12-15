using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MentalWellness.API.Models
{
    [Table("MoodLogs")]
    public class MoodLog
    {
        [Key]
        public Guid MoodLogId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid PatientId { get; set; }

        [Required]
        public DateTime LogDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Range(1, 10)]
        public int MoodScore { get; set; }

        [Required]
        [MaxLength(20)]
        public string StressLevel { get; set; } = string.Empty; // Low, Moderate, High, VeryHigh

        [Required]
        [Column(TypeName = "decimal(4,2)")]
        [Range(0, 24)]
        public decimal SleepHours { get; set; }

        [Required]
        [MaxLength(20)]
        public string EnergyLevel { get; set; } = string.Empty; // Low, Moderate, High

        public string? Notes { get; set; }

        public string? Activities { get; set; } // JSON format

        public string? Triggers { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("PatientId")]
        public Patient Patient { get; set; } = null!;
    }
}
