using FluentValidation;
using MentalWellness.API.DTOs.Auth;
using MentalWellness.API.Helpers;

namespace MentalWellness.API.Validators.Auth;

public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(255).WithMessage("Email must not exceed 255 characters");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters")
            .Must(ValidationHelper.IsStrongPassword).WithMessage("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required")
            .MaximumLength(255).WithMessage("Full name must not exceed 255 characters");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required")
            .Must(ValidationHelper.IsValidRwandanPhoneNumber).WithMessage("Invalid Rwandan phone number format");

        RuleFor(x => x.UserRole)
            .NotEmpty().WithMessage("User role is required")
            .Must(role => role == "Patient" || role == "Doctor" || role == "Admin")
            .WithMessage("User role must be Patient, Doctor, or Admin");
    }
}
