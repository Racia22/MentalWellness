using MentalWellness.API.Models;
using MentalWellness.API.DTOs.Patient;
using MentalWellness.API.DTOs.Doctor;
using MentalWellness.API.DTOs.Appointment;
using MentalWellness.API.DTOs.Payment;

namespace MentalWellness.API.Helpers;

public static class MappingHelper
{
    public static PatientDto ToPatientDto(this Patient patient)
    {
        return new PatientDto
        {
            PatientId = patient.PatientId,
            UserId = patient.UserId,
            PatientIDNumber = patient.PatientIDNumber,
            Age = patient.Age,
            Category = patient.Category,
            Gender = patient.Gender,
            DateOfBirth = patient.DateOfBirth,
            Address = patient.Address,
            EmergencyContact = patient.EmergencyContact,
            EmergencyContactPhone = patient.EmergencyContactPhone,
            Email = patient.User?.Email ?? string.Empty,
            FullName = patient.User?.FullName ?? string.Empty,
            Phone = patient.User?.Phone ?? string.Empty,
            CreatedAt = patient.CreatedAt
        };
    }

    public static DoctorDto ToDoctorDto(this Doctor doctor)
    {
        return new DoctorDto
        {
            DoctorId = doctor.DoctorId,
            UserId = doctor.UserId,
            DoctorIDNumber = doctor.DoctorIDNumber,
            Specialty = doctor.Specialty,
            LicenseNumber = doctor.LicenseNumber,
            YearsOfExperience = doctor.YearsOfExperience,
            Bio = doctor.Bio,
            ConsultationFee = doctor.ConsultationFee,
            AverageRating = doctor.AverageRating,
            TotalReviews = doctor.TotalReviews,
            IsApproved = doctor.IsApproved,
            Email = doctor.User?.Email ?? string.Empty,
            FullName = doctor.User?.FullName ?? string.Empty,
            Phone = doctor.User?.Phone ?? string.Empty,
            CreatedAt = doctor.CreatedAt
        };
    }

    public static AppointmentDto ToAppointmentDto(this Appointment appointment)
    {
        return new AppointmentDto
        {
            AppointmentId = appointment.AppointmentId,
            PatientId = appointment.PatientId,
            DoctorId = appointment.DoctorId,
            AppointmentDate = appointment.AppointmentDate,
            AppointmentTime = appointment.AppointmentTime,
            Duration = appointment.Duration,
            AppointmentType = appointment.AppointmentType,
            Status = appointment.Status,
            Amount = appointment.Amount,
            IsPaid = appointment.IsPaid,
            PatientNotes = appointment.PatientNotes,
            CancellationReason = appointment.CancellationReason,
            PatientName = appointment.Patient?.User?.FullName ?? string.Empty,
            DoctorName = appointment.Doctor?.User?.FullName ?? string.Empty,
            CreatedAt = appointment.CreatedAt
        };
    }

    public static PaymentDto ToPaymentDto(this Payment payment)
    {
        return new PaymentDto
        {
            PaymentId = payment.PaymentId,
            AppointmentId = payment.AppointmentId,
            PatientId = payment.PatientId,
            TransactionReference = payment.TransactionReference,
            PaymentMethod = payment.PaymentMethod,
            PaymentProvider = payment.PaymentProvider,
            Amount = payment.Amount,
            Currency = payment.Currency,
            PaymentStatus = payment.PaymentStatus,
            PhoneNumber = payment.PhoneNumber,
            PayerName = payment.PayerName,
            PayerEmail = payment.PayerEmail,
            ProviderTransactionId = payment.ProviderTransactionId,
            PaidAt = payment.PaidAt,
            CreatedAt = payment.CreatedAt
        };
    }
}
