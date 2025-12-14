using BCrypt.Net;

namespace MentalWellness.API.Helpers;

public class PasswordHelper
{
    public static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public static bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    public static string GenerateSalt()
    {
        return BCrypt.Net.BCrypt.GenerateSalt();
    }
}
