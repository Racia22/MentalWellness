using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Models;

namespace MentalWellness.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<TreatmentPlan> TreatmentPlans { get; set; }
        public DbSet<MoodLog> MoodLogs { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.UserRole);
                entity.HasIndex(e => e.IsActive);

                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(500);
                entity.Property(e => e.PasswordSalt).IsRequired().HasMaxLength(500);
                entity.Property(e => e.UserRole).IsRequired().HasMaxLength(50);
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
                entity.Property(e => e.ProfileImage).HasMaxLength(500);
                entity.Property(e => e.IsActive).HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Patient Configuration
            modelBuilder.Entity<Patient>(entity =>
            {
                entity.HasKey(e => e.PatientId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.PatientIDNumber).IsUnique();
                entity.HasIndex(e => e.Category);

                entity.Property(e => e.PatientIDNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Age).IsRequired();
                entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Gender).IsRequired().HasMaxLength(20);
                entity.Property(e => e.DateOfBirth).HasColumnType("DATE").IsRequired();
                entity.Property(e => e.Address).HasMaxLength(500);
                entity.Property(e => e.EmergencyContact).HasMaxLength(255);
                entity.Property(e => e.EmergencyContactPhone).HasMaxLength(20);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.User)
                    .WithOne(u => u.Patient)
                    .HasForeignKey<Patient>(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Doctor Configuration
            modelBuilder.Entity<Doctor>(entity =>
            {
                entity.HasKey(e => e.DoctorId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.DoctorIDNumber).IsUnique();
                entity.HasIndex(e => e.LicenseNumber).IsUnique();
                entity.HasIndex(e => e.Specialty);
                entity.HasIndex(e => e.IsApproved);
                entity.HasIndex(e => e.AverageRating);

                entity.Property(e => e.DoctorIDNumber).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Specialty).IsRequired().HasMaxLength(255);
                entity.Property(e => e.LicenseNumber).IsRequired().HasMaxLength(100);
                entity.Property(e => e.YearsOfExperience).HasDefaultValue(0);
                entity.Property(e => e.ConsultationFee).HasColumnType("decimal(18,2)").HasDefaultValue(0);
                entity.Property(e => e.AverageRating).HasColumnType("decimal(3,2)").HasDefaultValue(0);
                entity.Property(e => e.TotalReviews).HasDefaultValue(0);
                entity.Property(e => e.IsApproved).HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.User)
                    .WithOne(u => u.Doctor)
                    .HasForeignKey<Doctor>(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Appointment Configuration
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.HasKey(e => e.AppointmentId);
                entity.HasIndex(e => e.PatientId);
                entity.HasIndex(e => e.DoctorId);
                entity.HasIndex(e => e.AppointmentDate);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.IsPaid);
                entity.HasIndex(e => new { e.AppointmentDate, e.AppointmentTime });

                entity.Property(e => e.AppointmentDate).HasColumnType("DATE").IsRequired();
                entity.Property(e => e.AppointmentTime).HasColumnType("TIME").IsRequired();
                entity.Property(e => e.Duration).HasDefaultValue(60);
                entity.Property(e => e.AppointmentType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50).HasDefaultValue("Scheduled");
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)").HasDefaultValue(0);
                entity.Property(e => e.IsPaid).HasDefaultValue(false);
                entity.Property(e => e.CancellationReason).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Patient)
                    .WithMany(p => p.Appointments)
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Doctor)
                    .WithMany(d => d.Appointments)
                    .HasForeignKey(e => e.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Payment Configuration
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.PaymentId);
                entity.HasIndex(e => e.AppointmentId);
                entity.HasIndex(e => e.PatientId);
                entity.HasIndex(e => e.TransactionReference).IsUnique();
                entity.HasIndex(e => e.PaymentStatus);
                entity.HasIndex(e => e.PaymentMethod);
                
                // Prevent multiple active payments per appointment
                // Only one payment with status Pending, Processing, or Completed per appointment
                entity.HasIndex(e => new { e.AppointmentId, e.PaymentStatus })
                    .HasFilter("[PaymentStatus] IN ('Pending', 'Processing', 'Completed')")
                    .IsUnique();

                entity.Property(e => e.TransactionReference).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PaymentMethod).IsRequired().HasMaxLength(50);
                entity.Property(e => e.PaymentProvider).HasMaxLength(100);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)").IsRequired();
                entity.Property(e => e.Currency).HasMaxLength(10).HasDefaultValue("RWF");
                entity.Property(e => e.PaymentStatus).IsRequired().HasMaxLength(50).HasDefaultValue("Pending");
                entity.Property(e => e.PhoneNumber).HasMaxLength(20);
                entity.Property(e => e.PayerName).HasMaxLength(255);
                entity.Property(e => e.PayerEmail).HasMaxLength(255);
                entity.Property(e => e.ProviderTransactionId).HasMaxLength(255);
                entity.Property(e => e.FailureReason).HasMaxLength(500);
                entity.Property(e => e.RefundAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.RefundReason).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Appointment)
                    .WithOne(a => a.Payment)
                    .HasForeignKey<Payment>(e => e.AppointmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Patient)
                    .WithMany(p => p.Payments)
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // MedicalRecord Configuration
            modelBuilder.Entity<MedicalRecord>(entity =>
            {
                entity.HasKey(e => e.MedicalRecordId);
                entity.HasIndex(e => e.PatientId);
                entity.HasIndex(e => e.DoctorId);
                entity.HasIndex(e => e.AppointmentId);
                entity.HasIndex(e => e.CreatedAt);

                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Patient)
                    .WithMany(p => p.MedicalRecords)
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Doctor)
                    .WithMany(d => d.MedicalRecords)
                    .HasForeignKey(e => e.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Appointment)
                    .WithMany(a => a.MedicalRecords)
                    .HasForeignKey(e => e.AppointmentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // TreatmentPlan Configuration
            modelBuilder.Entity<TreatmentPlan>(entity =>
            {
                entity.HasKey(e => e.TreatmentPlanId);
                entity.HasIndex(e => e.PatientId);
                entity.HasIndex(e => e.DoctorId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.StartDate);

                entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
                entity.Property(e => e.StartDate).HasColumnType("DATE").IsRequired();
                entity.Property(e => e.EndDate).HasColumnType("DATE");
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50).HasDefaultValue("Active");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Patient)
                    .WithMany(p => p.TreatmentPlans)
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Doctor)
                    .WithMany(d => d.TreatmentPlans)
                    .HasForeignKey(e => e.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Appointment)
                    .WithMany(a => a.TreatmentPlans)
                    .HasForeignKey(e => e.AppointmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.MedicalRecord)
                    .WithMany(m => m.TreatmentPlans)
                    .HasForeignKey(e => e.MedicalRecordId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // MoodLog Configuration
            modelBuilder.Entity<MoodLog>(entity =>
            {
                entity.HasKey(e => e.MoodLogId);
                entity.HasIndex(e => e.PatientId);
                entity.HasIndex(e => e.LogDate);
                entity.HasIndex(e => e.MoodScore);
                entity.HasIndex(e => e.StressLevel);

                entity.Property(e => e.LogDate).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.MoodScore).IsRequired();
                entity.Property(e => e.StressLevel).IsRequired().HasMaxLength(20);
                entity.Property(e => e.SleepHours).HasColumnType("decimal(4,2)").IsRequired();
                entity.Property(e => e.EnergyLevel).IsRequired().HasMaxLength(20);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Patient)
                    .WithMany(p => p.MoodLogs)
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Feedback Configuration
            modelBuilder.Entity<Feedback>(entity =>
            {
                entity.HasKey(e => e.FeedbackId);
                entity.HasIndex(e => e.PatientId);
                entity.HasIndex(e => e.DoctorId);
                entity.HasIndex(e => e.Rating);
                entity.HasIndex(e => e.IsApproved);
                entity.HasIndex(e => e.CreatedAt);

                entity.Property(e => e.Rating).IsRequired();
                entity.Property(e => e.ReviewTitle).HasMaxLength(255);
                entity.Property(e => e.IsAnonymous).HasDefaultValue(false);
                entity.Property(e => e.IsApproved).HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Patient)
                    .WithMany(p => p.Feedbacks)
                    .HasForeignKey(e => e.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Doctor)
                    .WithMany(d => d.Feedbacks)
                    .HasForeignKey(e => e.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Appointment)
                    .WithMany(a => a.Feedbacks)
                    .HasForeignKey(e => e.AppointmentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Message Configuration
            modelBuilder.Entity<Message>(entity =>
            {
                entity.HasKey(e => e.MessageId);
                entity.HasIndex(e => e.SenderId);
                entity.HasIndex(e => e.ReceiverId);
                entity.HasIndex(e => e.IsRead);
                entity.HasIndex(e => e.CreatedAt);

                entity.Property(e => e.Subject).IsRequired().HasMaxLength(255);
                entity.Property(e => e.MessageBody).IsRequired();
                entity.Property(e => e.IsRead).HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Sender)
                    .WithMany(u => u.SentMessages)
                    .HasForeignKey(e => e.SenderId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Receiver)
                    .WithMany(u => u.ReceivedMessages)
                    .HasForeignKey(e => e.ReceiverId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Appointment)
                    .WithMany(a => a.Messages)
                    .HasForeignKey(e => e.AppointmentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ParentMessage)
                    .WithMany(m => m.Replies)
                    .HasForeignKey(e => e.ParentMessageId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Notification Configuration
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.NotificationId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.EntityType);
                entity.HasIndex(e => e.IsRead);
                entity.HasIndex(e => e.IsSent);
                entity.HasIndex(e => e.Priority);
                entity.HasIndex(e => e.CreatedAt);

                entity.Property(e => e.NotificationType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.EntityType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Message).IsRequired();
                entity.Property(e => e.ActionUrl).HasMaxLength(500);
                entity.Property(e => e.Priority).IsRequired().HasMaxLength(20).HasDefaultValue("Normal");
                entity.Property(e => e.IsSent).HasDefaultValue(false);
                entity.Property(e => e.IsRead).HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.User)
                    .WithMany(u => u.Notifications)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Appointment)
                    .WithMany(a => a.Notifications)
                    .HasForeignKey(e => e.AppointmentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // AuditLog Configuration
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(e => e.AuditLogId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Action);
                entity.HasIndex(e => e.EntityName);
                entity.HasIndex(e => e.CreatedAt);

                entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
                entity.Property(e => e.EntityName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.EntityId).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.IpAddress).HasMaxLength(50);
                entity.Property(e => e.UserAgent).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.User)
                    .WithMany(u => u.AuditLogs)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
