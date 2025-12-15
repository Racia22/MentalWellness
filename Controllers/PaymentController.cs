using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using MentalWellness.API.Data;
using MentalWellness.API.DTOs.Payment;
using MentalWellness.API.DTOs.Common;
using MentalWellness.API.Models;
using MentalWellness.API.Services;

namespace MentalWellness.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly InvoiceService _invoiceService;
    private readonly NotificationService _notificationService;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(
        ApplicationDbContext context, 
        InvoiceService invoiceService,
        NotificationService notificationService,
        ILogger<PaymentController> logger)
    {
        _context = context;
        _invoiceService = invoiceService;
        _notificationService = notificationService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPayments([FromQuery] Guid? appointmentId = null, [FromQuery] Guid? patientId = null, [FromQuery] string? status = null)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            // Check if current user is a patient, doctor, or admin
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            // Build query using joins to avoid relationship materialization issues
            var query = from payment in _context.Payments
                       join appointment in _context.Appointments on payment.AppointmentId equals appointment.AppointmentId
                       join patientEntity in _context.Patients on payment.PatientId equals patientEntity.PatientId
                       join patientUser in _context.Users on patientEntity.UserId equals patientUser.UserId
                       join doctorEntity in _context.Doctors on appointment.DoctorId equals doctorEntity.DoctorId
                       join doctorUser in _context.Users on doctorEntity.UserId equals doctorUser.UserId
                       select new { payment, appointment, patientEntity, patientUser, doctorEntity, doctorUser };

            // Security: Patients can only see their own payments
            if (patient != null && !isAdmin)
            {
                query = query.Where(x => x.patientEntity.PatientId == patient.PatientId);
            }
            // Doctors can see payments for their appointments
            else if (doctor != null && !isAdmin)
            {
                query = query.Where(x => x.doctorEntity.DoctorId == doctor.DoctorId);
            }
            // Admins can see all, or use filters if provided
            else if (isAdmin)
            {
                if (appointmentId.HasValue)
                    query = query.Where(x => x.payment.AppointmentId == appointmentId.Value);

                if (patientId.HasValue)
                    query = query.Where(x => x.payment.PatientId == patientId.Value);
            }
            else
            {
                return Unauthorized();
            }

            if (!string.IsNullOrEmpty(status))
                query = query.Where(x => x.payment.PaymentStatus == status);

            // Project directly to DTOs to avoid relationship issues
            var payments = await query
                .OrderByDescending(x => x.payment.CreatedAt)
                .Select(x => new PaymentDto
                {
                    PaymentId = x.payment.PaymentId,
                    AppointmentId = x.payment.AppointmentId,
                    PatientId = x.payment.PatientId,
                    TransactionReference = x.payment.TransactionReference,
                    PaymentMethod = x.payment.PaymentMethod,
                    PaymentProvider = x.payment.PaymentProvider,
                    Amount = x.payment.Amount,
                    Currency = x.payment.Currency ?? "RWF",
                    PaymentStatus = x.payment.PaymentStatus,
                    PhoneNumber = x.payment.PhoneNumber,
                    PayerName = x.payment.PayerName ?? x.patientUser.FullName,
                    PayerEmail = x.payment.PayerEmail ?? x.patientUser.Email,
                    ProviderTransactionId = x.payment.ProviderTransactionId,
                    PaidAt = x.payment.PaidAt,
                    CreatedAt = x.payment.CreatedAt,
                    PatientName = x.patientUser.FullName,
                    DoctorName = x.doctorUser.FullName,
                    AppointmentDate = x.appointment.AppointmentDate,
                    ProviderResponse = x.payment.ProviderResponse,
                    FailureReason = x.payment.FailureReason,
                    RefundAmount = x.payment.RefundAmount,
                    RefundReason = x.payment.RefundReason,
                    RefundedAt = x.payment.RefundedAt,
                    InvoiceNumber = x.payment.InvoiceNumber
                })
                .ToListAsync();

            return Ok(payments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payments: {Message}", ex.Message);
            _logger.LogError(ex, "Stack trace: {StackTrace}", ex.StackTrace);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = $"An error occurred: {ex.Message}" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPayment(Guid id)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            // Use join to avoid relationship materialization issues
            var paymentData = await (from payment in _context.Payments
                                   join appointment in _context.Appointments on payment.AppointmentId equals appointment.AppointmentId
                                   join patientEntity in _context.Patients on payment.PatientId equals patientEntity.PatientId
                                   join patientUser in _context.Users on patientEntity.UserId equals patientUser.UserId
                                   join doctorEntity in _context.Doctors on appointment.DoctorId equals doctorEntity.DoctorId
                                   join doctorUser in _context.Users on doctorEntity.UserId equals doctorUser.UserId
                                   where payment.PaymentId == id
                                   select new { payment, appointment, patientEntity, patientUser, doctorEntity, doctorUser })
                                   .FirstOrDefaultAsync();

            if (paymentData == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Payment not found" });
            }

            // Security: Check if user has access to this payment
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin)
            {
                if (patient != null && paymentData.patientEntity.PatientId != patient.PatientId)
                {
                    return Forbid("You can only view your own payments.");
                }
                if (doctor != null && paymentData.doctorEntity.DoctorId != doctor.DoctorId)
                {
                    return Forbid("You can only view payments for your appointments.");
                }
                if (patient == null && doctor == null)
                {
                    return Unauthorized();
                }
            }

            var paymentDto = new PaymentDto
            {
                PaymentId = paymentData.payment.PaymentId,
                AppointmentId = paymentData.payment.AppointmentId,
                PatientId = paymentData.payment.PatientId,
                TransactionReference = paymentData.payment.TransactionReference,
                PaymentMethod = paymentData.payment.PaymentMethod,
                PaymentProvider = paymentData.payment.PaymentProvider,
                Amount = paymentData.payment.Amount,
                Currency = paymentData.payment.Currency,
                PaymentStatus = paymentData.payment.PaymentStatus,
                PhoneNumber = paymentData.payment.PhoneNumber,
                PayerName = paymentData.payment.PayerName ?? paymentData.patientUser.FullName,
                PayerEmail = paymentData.payment.PayerEmail ?? paymentData.patientUser.Email,
                ProviderTransactionId = paymentData.payment.ProviderTransactionId,
                PaidAt = paymentData.payment.PaidAt,
                CreatedAt = paymentData.payment.CreatedAt,
                PatientName = paymentData.patientUser.FullName,
                DoctorName = paymentData.doctorUser.FullName,
                AppointmentDate = paymentData.appointment.AppointmentDate,
                ProviderResponse = paymentData.payment.ProviderResponse,
                FailureReason = paymentData.payment.FailureReason,
                RefundAmount = paymentData.payment.RefundAmount,
                RefundReason = paymentData.payment.RefundReason,
                RefundedAt = paymentData.payment.RefundedAt,
                InvoiceNumber = paymentData.payment.InvoiceNumber
            };

            return Ok(paymentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost("initiate")]
    public async Task<IActionResult> InitiatePayment([FromBody] InitiatePaymentDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            var appointment = await _context.Appointments
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(a => a.AppointmentId == dto.AppointmentId);

            if (appointment == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Appointment not found" });
            }

            if (appointment.Patient == null || appointment.Patient.User == null)
            {
                _logger.LogError("Appointment {AppointmentId} has no patient or patient user", dto.AppointmentId);
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Appointment patient information is missing" });
            }

            // Security: Only the patient who owns the appointment can pay
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            if (patient == null || patient.PatientId != appointment.PatientId)
            {
                return Forbid("You can only pay for your own appointments.");
            }

            // Check if appointment is approved (Status must be "Scheduled" or "Ongoing")
            if (appointment.Status != "Scheduled" && appointment.Status != "Ongoing")
            {
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Payment can only be made for approved appointments" });
            }

            // Check if already paid
            if (appointment.IsPaid)
            {
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "This appointment has already been paid" });
            }

            // Check if payment already exists (any status)
            var existingPayment = await _context.Payments
                .FirstOrDefaultAsync(p => p.AppointmentId == dto.AppointmentId);
            
            if (existingPayment != null)
            {
                // If payment is completed, return error
                if (existingPayment.PaymentStatus == "Completed")
                {
                    return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Payment already completed for this appointment" });
                }
                
                // If payment is pending or processing, return the existing payment for retry
                if (existingPayment.PaymentStatus == "Pending" || existingPayment.PaymentStatus == "Processing")
                {
                    _logger.LogInformation("Returning existing pending payment {PaymentId} for appointment {AppointmentId}", 
                        existingPayment.PaymentId, dto.AppointmentId);
                    
                    return Ok(new { 
                        PaymentId = existingPayment.PaymentId, 
                        TransactionReference = existingPayment.TransactionReference,
                        Amount = existingPayment.Amount,
                        Currency = existingPayment.Currency,
                        PaymentStatus = existingPayment.PaymentStatus,
                        Message = "A payment is already in progress for this appointment. Please complete or cancel the existing payment first."
                    });
                }
                
                // If payment failed or was cancelled, allow reusing it (will be handled below)
            }

            // If we reach here, either no payment exists or existing payment is Failed/Cancelled
            // Check if we should reuse a failed payment or create a new one
            Payment payment;
            
            if (existingPayment != null && (existingPayment.PaymentStatus == "Failed" || existingPayment.PaymentStatus == "Cancelled"))
            {
                // Reuse failed/cancelled payment - update it instead of creating new
                _logger.LogInformation("Reusing failed payment {PaymentId} for appointment {AppointmentId}", 
                    existingPayment.PaymentId, dto.AppointmentId);
                
                payment = existingPayment;
                payment.PaymentStatus = "Pending";
                payment.PaymentMethod = dto.PaymentMethod;
                payment.PhoneNumber = dto.PhoneNumber;
                payment.UpdatedAt = DateTime.UtcNow;
                // Keep existing transaction reference for tracking
            }
            else
            {
                // Validate payment method - only online methods allowed
                var allowedMethods = new[] { "MoMo", "Airtel", "BankCard", "BankTransfer" };
                if (!allowedMethods.Contains(dto.PaymentMethod))
                {
                    return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Only online payment methods are allowed. Cash payments are not accepted." });
                }

                // Generate transaction reference
                var transactionRef = $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

                payment = new Payment
                {
                    AppointmentId = dto.AppointmentId,
                    PatientId = appointment.PatientId,
                    TransactionReference = transactionRef,
                    PaymentMethod = dto.PaymentMethod,
                    Amount = appointment.Amount,
                    Currency = "RWF",
                    PaymentStatus = "Pending",
                    PhoneNumber = dto.PhoneNumber,
                    PayerName = appointment.Patient.User?.FullName ?? "Unknown",
                    PayerEmail = appointment.Patient.User?.Email ?? "",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Payments.Add(payment);
            }
            
            await _context.SaveChangesAsync();

            _logger.LogInformation("Payment initiated: {PaymentId} for appointment {AppointmentId} by patient {PatientId}", 
                payment.PaymentId, dto.AppointmentId, appointment.PatientId);

            return Ok(new { 
                PaymentId = payment.PaymentId, 
                TransactionReference = payment.TransactionReference,
                Amount = payment.Amount,
                Currency = payment.Currency
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initiating payment: {Message}", ex.Message);
            _logger.LogError(ex, "Stack trace: {StackTrace}", ex.StackTrace);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = $"An error occurred: {ex.Message}" });
        }
    }

    [HttpPost("callback")]
    public async Task<IActionResult> PaymentCallback([FromBody] PaymentCallbackDto dto)
    {
        try
        {
            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.TransactionReference == dto.TransactionReference);

            if (payment == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Payment not found" });
            }

            payment.PaymentStatus = dto.PaymentStatus;
            payment.ProviderTransactionId = dto.ProviderTransactionId;
            payment.ProviderResponse = dto.ProviderResponse;
            payment.FailureReason = dto.FailureReason;

            if (dto.PaymentStatus == "Completed")
            {
                payment.PaidAt = DateTime.UtcNow;
                
                // Update appointment payment status
                var appointment = await _context.Appointments
                    .Include(a => a.Patient).ThenInclude(p => p.User)
                    .Include(a => a.Doctor).ThenInclude(d => d.User)
                    .FirstOrDefaultAsync(a => a.AppointmentId == payment.AppointmentId);
                    
                if (appointment != null)
                {
                    appointment.IsPaid = true;
                }

                // Generate invoice
                try
                {
                    await _invoiceService.GenerateInvoiceAsync(payment.PaymentId);
                    _logger.LogInformation("Invoice generated for payment {PaymentId}", payment.PaymentId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error generating invoice for payment {PaymentId}", payment.PaymentId);
                    // Don't fail the payment if invoice generation fails
                }

                // Create notifications for patient and doctor
                try
                {
                    if (appointment?.Patient?.User != null)
                    {
                        // Patient notification
                        await _notificationService.CreateNotificationAsync(
                            userId: appointment.Patient.UserId,
                            notificationType: "InApp",
                            entityType: "Payment",
                            entityId: payment.PaymentId,
                            appointmentId: payment.AppointmentId,
                            title: "Payment Successful",
                            message: $"Your payment of {payment.Amount:N2} {payment.Currency} was successful",
                            actionUrl: $"/patient/payments/invoice/{payment.PaymentId}",
                            priority: "High"
                        );
                    }

                    if (appointment?.Doctor?.User != null)
                    {
                        // Doctor notification
                        await _notificationService.CreateNotificationAsync(
                            userId: appointment.Doctor.UserId,
                            notificationType: "PaymentReceived",
                            entityType: "Payment",
                            entityId: payment.PaymentId,
                            appointmentId: payment.AppointmentId,
                            title: "Payment Received",
                            message: $"Payment received from {appointment.Patient?.User?.FullName ?? "Patient"}",
                            actionUrl: $"/doctor/payments/invoice/{payment.PaymentId}",
                            priority: "High"
                        );
                    }
                }
                catch (Exception notifEx)
                {
                    _logger.LogWarning(notifEx, "Failed to create payment notifications for payment {PaymentId}", payment.PaymentId);
                }
            }

            payment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Payment callback processed" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing payment callback");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("doctor/{doctorId}")]
    [Authorize(Roles = "Doctor,Admin")]
    public async Task<IActionResult> GetPaymentsByDoctor(Guid doctorId, [FromQuery] string? status = null, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.DoctorId == doctorId);
            if (doctor == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Doctor not found" });
            }

            // Security: Doctors can only see their own payments, admins can see any doctor's
            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin && doctor.UserId != currentUserId)
            {
                return Forbid("You can only view your own payments.");
            }

            // Use join to avoid relationship materialization issues
            var query = from payment in _context.Payments
                       join appointment in _context.Appointments on payment.AppointmentId equals appointment.AppointmentId
                       join patientEntity in _context.Patients on payment.PatientId equals patientEntity.PatientId
                       join patientUser in _context.Users on patientEntity.UserId equals patientUser.UserId
                       where appointment.DoctorId == doctorId
                       select new { payment, appointment, patientEntity, patientUser };

            if (!string.IsNullOrEmpty(status))
                query = query.Where(x => x.payment.PaymentStatus == status);

            if (startDate.HasValue)
                query = query.Where(x => x.payment.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(x => x.payment.CreatedAt <= endDate.Value.AddDays(1));

            var payments = await query
                .OrderByDescending(x => x.payment.CreatedAt)
                .Select(x => new PaymentDto
                {
                    PaymentId = x.payment.PaymentId,
                    AppointmentId = x.payment.AppointmentId,
                    PatientId = x.payment.PatientId,
                    TransactionReference = x.payment.TransactionReference,
                    PaymentMethod = x.payment.PaymentMethod,
                    PaymentProvider = x.payment.PaymentProvider,
                    Amount = x.payment.Amount,
                    Currency = x.payment.Currency ?? "RWF",
                    PaymentStatus = x.payment.PaymentStatus,
                    PhoneNumber = x.payment.PhoneNumber,
                    PayerName = x.payment.PayerName ?? x.patientUser.FullName,
                    PayerEmail = x.payment.PayerEmail ?? x.patientUser.Email,
                    ProviderTransactionId = x.payment.ProviderTransactionId,
                    PaidAt = x.payment.PaidAt,
                    CreatedAt = x.payment.CreatedAt,
                    PatientName = x.patientUser.FullName,
                    AppointmentDate = x.appointment.AppointmentDate,
                    InvoiceNumber = x.payment.InvoiceNumber
                })
                .ToListAsync();

            return Ok(payments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payments for doctor {DoctorId}", doctorId);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpPost("{id}/refund")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ProcessRefund(Guid id, [FromBody] RefundPaymentDto dto)
    {
        try
        {
            var payment = await _context.Payments
                .Include(p => p.Appointment)
                .FirstOrDefaultAsync(p => p.PaymentId == id);

            if (payment == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Payment not found" });
            }

            if (payment.PaymentStatus != "Completed")
            {
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Only completed payments can be refunded" });
            }

            payment.PaymentStatus = "Refunded";
            payment.RefundAmount = dto.RefundAmount ?? payment.Amount;
            payment.RefundReason = dto.RefundReason;
            payment.RefundedAt = DateTime.UtcNow;
            payment.UpdatedAt = DateTime.UtcNow;

            // Update appointment payment status
            if (payment.Appointment != null)
            {
                payment.Appointment.IsPaid = false;
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Refund processed successfully", RefundAmount = payment.RefundAmount });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing refund for payment {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("stats")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPaymentStats([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var query = _context.Payments.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(p => p.CreatedAt >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(p => p.CreatedAt <= endDate.Value.AddDays(1));

            var stats = new
            {
                TotalRevenue = await query.Where(p => p.PaymentStatus == "Completed").SumAsync(p => (decimal?)p.Amount) ?? 0,
                PendingPayments = await query.CountAsync(p => p.PaymentStatus == "Pending" || p.PaymentStatus == "Processing"),
                CompletedPayments = await query.CountAsync(p => p.PaymentStatus == "Completed"),
                FailedPayments = await query.CountAsync(p => p.PaymentStatus == "Failed"),
                RefundedPayments = await query.CountAsync(p => p.PaymentStatus == "Refunded"),
                TotalPayments = await query.CountAsync()
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment stats");
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }

    [HttpGet("{id}/invoice")]
    public async Task<IActionResult> DownloadInvoice(Guid id)
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var currentUserId))
            {
                return Unauthorized();
            }

            var payment = await _context.Payments
                .Include(p => p.Appointment)
                .Include(p => p.Patient)
                .FirstOrDefaultAsync(p => p.PaymentId == id);

            if (payment == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Payment not found" });
            }

            // Security: Check if user has access to this payment
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == currentUserId);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == currentUserId);
            var isAdmin = User.IsInRole("Admin");

            if (!isAdmin)
            {
                if (patient != null && payment.PatientId != patient.PatientId)
                {
                    return Forbid("You can only download invoices for your own payments.");
                }
                if (doctor != null && payment.Appointment != null)
                {
                    var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.AppointmentId == payment.AppointmentId);
                    if (appointment == null || appointment.DoctorId != doctor.DoctorId)
                    {
                        return Forbid("You can only download invoices for your appointments.");
                    }
                }
                if (patient == null && doctor == null)
                {
                    return Unauthorized();
                }
            }

            // Only allow download for completed payments
            if (payment.PaymentStatus != "Completed")
            {
                return BadRequest(new ErrorResponse { StatusCode = 400, Message = "Invoice is only available for completed payments" });
            }

            // Generate invoice if it doesn't exist
            if (string.IsNullOrEmpty(payment.InvoiceNumber))
            {
                try
                {
                    await _invoiceService.GenerateInvoiceAsync(payment.PaymentId);
                    // Reload payment to get updated invoice number
                    payment = await _context.Payments.FirstOrDefaultAsync(p => p.PaymentId == id);
                    if (payment == null)
                    {
                        return NotFound(new ErrorResponse { StatusCode = 404, Message = "Payment not found" });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error generating invoice for payment {PaymentId}", id);
                    return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "Error generating invoice" });
                }
            }

            var invoiceBytes = await _invoiceService.GetInvoicePdfAsync(payment.PaymentId);
            if (invoiceBytes == null)
            {
                return NotFound(new ErrorResponse { StatusCode = 404, Message = "Invoice not found" });
            }

            var fileName = $"Invoice_{payment.InvoiceNumber}.pdf";
            return File(invoiceBytes, "application/pdf", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading invoice for payment {Id}", id);
            return StatusCode(500, new ErrorResponse { StatusCode = 500, Message = "An error occurred" });
        }
    }
}
