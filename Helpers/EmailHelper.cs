namespace MentalWellness.API.Helpers;

public static class EmailHelper
{
    public static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    public static string MaskEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            return email;

        var parts = email.Split('@');
        var localPart = parts[0];
        var domain = parts[1];

        if (localPart.Length <= 2)
            return $"{localPart[0]}***@{domain}";

        var masked = $"{localPart[0]}{new string('*', localPart.Length - 2)}{localPart[^1]}@{domain}";
        return masked;
    }

    public static string GenerateEmailVerificationCode()
    {
        return new Random().Next(100000, 999999).ToString();
    }
}
