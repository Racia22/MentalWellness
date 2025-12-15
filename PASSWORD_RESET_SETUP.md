# Password Reset Setup Guide

## What Was Fixed

The password reset functionality has been fully implemented. Previously, the frontend showed a success message without actually sending emails.

## Implementation Details

### Backend Changes

1. **User Model** - Added password reset token fields:
   - `PasswordResetToken` (string, nullable)
   - `PasswordResetTokenExpires` (DateTime, nullable)

2. **DTOs Created**:
   - `ForgotPasswordDto.cs` - For forgot password requests
   - `ResetPasswordDto.cs` - For password reset requests

3. **AuthService** - Added methods:
   - `ForgotPasswordAsync()` - Generates reset token and sends email
   - `ResetPasswordAsync()` - Validates token and resets password

4. **EmailService** - Added method:
   - `SendPasswordResetEmailAsync()` - Sends password reset email with link

5. **AuthController** - Added endpoints:
   - `POST /api/auth/forgot-password` - Initiates password reset
   - `POST /api/auth/reset-password` - Completes password reset

### Frontend Changes

1. **ForgotPasswordPage** - Now actually calls the API
2. **ResetPasswordPage** - New page for resetting password via email link
3. **authService.js** - Added `forgotPassword()` and `resetPassword()` methods
4. **Routes** - Added `/reset-password` route

## Configuration Required

### Email Settings (appsettings.json)

You MUST configure email credentials for password reset emails to work:

```json
{
  "Email": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": "587",
    "FromEmail": "noreply@mentalwellness.rw",
    "FromName": "Mental Wellness",
    "Username": "your-email@gmail.com",  // ⚠️ REQUIRED
    "Password": "your-app-password"      // ⚠️ REQUIRED
  }
}
```

**For Gmail:**
- Use an App Password (not your regular password)
- Enable 2-factor authentication
- Generate App Password: https://myaccount.google.com/apppasswords

### Frontend URL (Optional)

Set environment variable for the reset link URL:
```bash
# Windows
set FRONTEND_URL=http://localhost:5175

# Linux/Mac
export FRONTEND_URL=http://localhost:5175
```

Default is `http://localhost:5175` if not set.

## Database Migration

After adding the new fields to the User model, you need to create and run a migration:

```bash
dotnet ef migrations add AddPasswordResetFields
dotnet ef database update
```

Or if using automatic migrations (if configured), the changes will be applied on startup.

## How It Works

1. **User requests password reset**:
   - Enters email on `/forgot-password` page
   - Frontend calls `POST /api/auth/forgot-password`
   - Backend generates secure token, stores it with expiration (1 hour)
   - Email sent with reset link: `http://localhost:5175/reset-password?token=XXX&email=YYY`

2. **User resets password**:
   - Clicks link in email
   - Lands on `/reset-password` page with token and email in URL
   - Enters new password
   - Frontend calls `POST /api/auth/reset-password`
   - Backend validates token, updates password, clears token
   - User redirected to login

## Security Features

- Reset tokens expire after 1 hour
- Tokens are cryptographically secure (32 random bytes)
- Email enumeration prevention (always returns success)
- Password validation (min 8 characters)
- Token is single-use (cleared after reset)

## Testing

1. Go to `/forgot-password`
2. Enter a registered email
3. Check email for reset link
4. Click link or copy token to `/reset-password`
5. Enter new password
6. Login with new password

## Troubleshooting

### Emails not sending?
- Check email credentials in `appsettings.json`
- Check application logs for email errors
- Verify SMTP settings are correct
- For Gmail, ensure App Password is used (not regular password)

### Token expired?
- Request a new password reset
- Tokens expire after 1 hour for security

### Reset link not working?
- Ensure `FRONTEND_URL` environment variable is set correctly
- Check that the frontend is running on the configured port
- Verify token and email are in the URL query parameters

