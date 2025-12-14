using FluentValidation;
using MentalWellness.API.DTOs.Doctor;

namespace MentalWellness.API.Validators.Doctor;

public class CreateDoctorValidator : AbstractValidator<CreateDoctorDto>
{
    public CreateDoctorValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.Specialty)
            .NotEmpty().WithMessage("Specialty is required")
            .MaximumLength(255).WithMessage("Specialty must not exceed 255 characters");

        RuleFor(x => x.LicenseNumber)
            .NotEmpty().WithMessage("License number is required")
            .MaximumLength(100).WithMessage("License number must not exceed 100 characters");

        RuleFor(x => x.YearsOfExperience)
            .GreaterThanOrEqualTo(0).WithMessage("Years of experience cannot be negative")
            .LessThanOrEqualTo(60).WithMessage("Years of experience cannot exceed 60");

        RuleFor(x => x.ConsultationFee)
            .GreaterThanOrEqualTo(0).WithMessage("Consultation fee cannot be negative");
    }
}
