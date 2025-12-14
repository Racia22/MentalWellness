using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;
using System.Net;
using System.Net.Mail;

namespace MentalWellness.API.Services;

public class EmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly IHostEnvironment _environment;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger, IHostEnvironment environment)
    {
        _configuration = configuration;
        _logger = logger;
        _environment = environment;
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true)
    {
        try
        {
            // In Development mode, log email to console instead of sending
            if (_environment.IsDevelopment())
            {
                _logger.LogInformation("=== EMAIL (DEVELOPMENT MODE - NOT SENT) ===");
                _logger.LogInformation("To: {To}", to);
                _logger.LogInformation("Subject: {Subject}", subject);
                _logger.LogInformation("Body:\n{Body}", body);
                _logger.LogInformation("==========================================");
                
                // Extract reset link from HTML body if present
                if (body.Contains("href="))
                {
                    var startIndex = body.IndexOf("href=\"") + 6;
                    var endIndex = body.IndexOf("\"", startIndex);
                    if (startIndex > 5 && endIndex > startIndex)
                    {
                        var resetLink = body.Substring(startIndex, endIndex - startIndex);
                        _logger.LogInformation("🔗 RESET LINK: {ResetLink}", resetLink);
                        Console.WriteLine($"\n🔗 PASSWORD RESET LINK: {resetLink}\n");
                    }
                }
                
                return true; // Return true so password reset still works
            }

            var smtpServer = _configuration["Email:SmtpServer"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var fromEmail = _configuration["Email:FromEmail"] ?? "noreply@mentalwellness.rw";
            var fromName = _configuration["Email:FromName"] ?? "Mental Wellness";
            var username = _configuration["Email:Username"];
            var password = _configuration["Email:Password"];

            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                _logger.LogWarning("Email credentials not configured. Email sending skipped.");
                return false;
            }

            using var client = new SmtpClient(smtpServer, smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(username, password)
            };

            using var message = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = isHtml
            };

            message.To.Add(to);

            await client.SendMailAsync(message);
            _logger.LogInformation("Email sent successfully to {Email}", to);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email to {Email}", to);
            return false;
        }
    }

    public async Task<bool> SendAppointmentConfirmationAsync(string to, string patientName, DateTime appointmentDate, TimeSpan appointmentTime, string doctorName)
    {
        var subject = "Appointment Confirmation - Mental Wellness";
        var body = $@"
            <h2>Appointment Confirmed</h2>
            <p>Dear {patientName},</p>
            <p>Your appointment has been confirmed:</p>
            <ul>
                <li><strong>Doctor:</strong> {doctorName}</li>
                <li><strong>Date:</strong> {appointmentDate:dd MMMM yyyy}</li>
                <li><strong>Time:</strong> {appointmentTime:hh\\:mm}</li>
            </ul>
            <p>Thank you for choosing Mental Wellness.</p>
        ";

        return await SendEmailAsync(to, subject, body);
    }

    public async Task<bool> SendAppointmentReminderAsync(string to, string patientName, DateTime appointmentDate, TimeSpan appointmentTime, string doctorName)
    {
        var subject = "Appointment Reminder - Mental Wellness";
        var body = $@"
            <h2>Appointment Reminder</h2>
            <p>Dear {patientName},</p>
            <p>This is a reminder for your upcoming appointment:</p>
            <ul>
                <li><strong>Doctor:</strong> {doctorName}</li>
                <li><strong>Date:</strong> {appointmentDate:dd MMMM yyyy}</li>
                <li><strong>Time:</strong> {appointmentTime:hh\\:mm}</li>
            </ul>
            <p>We look forward to seeing you.</p>
        ";

        return await SendEmailAsync(to, subject, body);
    }

    public async Task<bool> SendPaymentConfirmationAsync(string to, string patientName, decimal amount, string transactionReference)
    {
        var subject = "Payment Confirmation - Mental Wellness";
        var body = $@"
            <h2>Payment Confirmed</h2>
            <p>Dear {patientName},</p>
            <p>Your payment has been successfully processed:</p>
            <ul>
                <li><strong>Amount:</strong> RWF {amount:N2}</li>
                <li><strong>Transaction Reference:</strong> {transactionReference}</li>
            </ul>
            <p>Thank you for your payment.</p>
        ";

        return await SendEmailAsync(to, subject, body);
    }

    public async Task<bool> SendPasswordResetEmailAsync(string to, string fullName, string resetUrl)
    {
        var subject = "Password Reset Request - Mental Wellness";
        var body = $@"
            <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"">
                <h2 style=""color: #1E40AF;"">Password Reset Request</h2>
                <p>Dear {fullName},</p>
                <p>We received a request to reset your password for your Mental Wellness account.</p>
                <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
                <div style=""text-align: center; margin: 30px 0;"">
                    <a href=""{resetUrl}"" 
                       style=""background-color: #1E40AF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;"">
                        Reset Password
                    </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style=""color: #6B7280; word-break: break-all; font-size: 12px;"">{resetUrl}</p>
                <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
                <p>Thank you,<br>The Mental Wellness Team</p>
            </div>
        ";

        return await SendEmailAsync(to, subject, body);
    }
}
