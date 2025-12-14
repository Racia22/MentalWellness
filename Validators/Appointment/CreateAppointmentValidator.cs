using FluentValidation;
using MentalWellness.API.DTOs.Appointment;

namespace MentalWellness.API.Validators.Appointment;

public class CreateAppointmentValidator : AbstractValidator<CreateAppointmentDto>
{
    public CreateAppointmentValidator()
    {
        RuleFor(x => x.PatientId)
            .NotEmpty().WithMessage("Patient ID is required");

        RuleFor(x => x.DoctorId)
            .NotEmpty().WithMessage("Doctor ID is required");

        RuleFor(x => x.AppointmentDate)
            .NotEmpty().WithMessage("Appointment date is required")
            .Must(date => date.Date >= DateTime.Today)
            .WithMessage("Appointment date cannot be in the past");

        RuleFor(x => x.AppointmentTime)
            .NotEmpty().WithMessage("Appointment time is required");

        RuleFor(x => x.Duration)
            .GreaterThan(0).WithMessage("Duration must be greater than 0")
            .LessThanOrEqualTo(480).WithMessage("Duration cannot exceed 8 hours (480 minutes)");

        RuleFor(x => x.AppointmentType)
            .NotEmpty().WithMessage("Appointment type is required")
            .Must(type => new[] { "InitialConsultation", "FollowUp", "Emergency", "Routine" }.Contains(type))
            .WithMessage("Invalid appointment type");

        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(0).WithMessage("Amount cannot be negative");
    }
}
