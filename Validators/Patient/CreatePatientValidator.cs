using FluentValidation;
using MentalWellness.API.DTOs.Patient;
using MentalWellness.API.Helpers;

namespace MentalWellness.API.Validators.Patient;

public class CreatePatientValidator : AbstractValidator<CreatePatientDto>
{
    public CreatePatientValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.Age)
            .NotEmpty().WithMessage("Age is required")
            .InclusiveBetween(0, 120).WithMessage("Age must be between 0 and 120");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required")
            .Must(category => new[] { "Individual", "Couple", "Teenager" }.Contains(category))
            .WithMessage("Category must be Individual, Couple, or Teenager");

        RuleFor(x => x.Gender)
            .NotEmpty().WithMessage("Gender is required")
            .Must(gender => new[] { "Male", "Female", "Other", "Prefer not to say" }.Contains(gender))
            .WithMessage("Invalid gender value");

        RuleFor(x => x.DateOfBirth)
            .NotEmpty().WithMessage("Date of birth is required")
            .Must(dob => ValidationHelper.IsValidAge(dob, 0, 120))
            .WithMessage("Invalid date of birth or age");

        RuleFor(x => x.EmergencyContactPhone)
            .Must(phone => string.IsNullOrEmpty(phone) || ValidationHelper.IsValidRwandanPhoneNumber(phone))
            .WithMessage("Invalid emergency contact phone number format")
            .When(x => !string.IsNullOrEmpty(x.EmergencyContactPhone));
    }
}
