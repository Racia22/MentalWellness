using System.Text.RegularExpressions;

namespace MentalWellness.API.Helpers;

public static class ValidationHelper
{
    public static bool IsValidPhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return false;

        // Basic phone validation - accepts international formats
        var pattern = @"^\+?[1-9]\d{1,14}$";
        return Regex.IsMatch(phoneNumber, pattern);
    }

    public static bool IsValidRwandanPhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return false;

        // Rwandan phone numbers: +2507XXXXXXXX or 07XXXXXXXX
        var pattern = @"^(\+250|250|0)?7\d{8}$";
        return Regex.IsMatch(phoneNumber.Replace(" ", "").Replace("-", ""), pattern);
    }

    public static bool IsStrongPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            return false;

        // Check for at least one uppercase, one lowercase, one digit, and one special character
        var hasUpper = Regex.IsMatch(password, @"[A-Z]");
        var hasLower = Regex.IsMatch(password, @"[a-z]");
        var hasDigit = Regex.IsMatch(password, @"[0-9]");
        var hasSpecial = Regex.IsMatch(password, @"[!@#$%^&*(),.?`""""{}|<>]");

        return hasUpper && hasLower && hasDigit && hasSpecial;
    }

    public static bool IsValidGuid(string guidString)
    {
        return Guid.TryParse(guidString, out _);
    }

    public static bool IsValidDateRange(DateTime startDate, DateTime endDate)
    {
        return endDate >= startDate;
    }

    public static bool IsValidAge(DateTime dateOfBirth, int minAge = 0, int maxAge = 150)
    {
        var age = DateTime.Now.Year - dateOfBirth.Year;
        if (dateOfBirth.Date > DateTime.Now.AddYears(-age))
        {
            age--;
        }

        return age >= minAge && age <= maxAge;
    }

    public static string SanitizeInput(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        return input.Trim();
    }
}
