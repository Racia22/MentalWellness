using Microsoft.EntityFrameworkCore;
using MentalWellness.API.Data;
using MentalWellness.API.Models;
using MentalWellness.API.DTOs.Payment;

namespace MentalWellness.API.Services;

public class PaymentService
{
    private readonly ApplicationDbContext _context;
    private readonly MoMoService _moMoService;
    private readonly AirtelMoneyService _airtelMoneyService;
    private readonly NotificationService _notificationService;
    private readonly InvoiceService _invoiceService;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(
        ApplicationDbContext context,
        MoMoService moMoService,
        AirtelMoneyService airtelMoneyService,
        NotificationService notificationService,
        InvoiceService invoiceService,
        ILogger<PaymentService> logger)
    {
        _context = context;
        _moMoService = moMoService;
        _airtelMoneyService = airtelMoneyService;
        _notificationService = notificationService;
        _invoiceService = invoiceService;
        _logger = logger;
    }

    public async Task<Payment> InitiatePaymentAsync(InitiatePaymentDto dto)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .FirstOrDefaultAsync(a => a.AppointmentId == dto.AppointmentId);

        if (appointment == null)
            throw new KeyNotFoundException("Appointment not found");

        // Generate transaction reference
        var transactionRef = $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            AppointmentId = dto.AppointmentId,
            PatientId = appointment.PatientId,
            TransactionReference = transactionRef,
            PaymentMethod = dto.PaymentMethod,
            Amount = appointment.Amount,
            Currency = "RWF",
            PaymentStatus = "Pending",
            PhoneNumber = dto.PhoneNumber,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Payments.Add(payment);

        // Initiate payment based on method
        try
        {
            if (dto.PaymentMethod == "MoMo")
            {
                await _moMoService.InitiatePaymentAsync(payment);
            }
            else if (dto.PaymentMethod == "Airtel")
            {
                await _airtelMoneyService.InitiatePaymentAsync(payment);
            }

            payment.PaymentStatus = "Processing";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initiating payment");
            payment.PaymentStatus = "Failed";
            payment.FailureReason = ex.Message;
        }

        await _context.SaveChangesAsync();

        return payment;
    }

    public async Task<bool> ProcessPaymentCallbackAsync(PaymentCallbackDto dto)
    {
        var payment = await _context.Payments
            .Include(p => p.Appointment)
            .ThenInclude(a => a.Patient)
            .ThenInclude(p => p.User)
            .FirstOrDefaultAsync(p => p.TransactionReference == dto.TransactionReference);

        if (payment == null)
            return false;

        payment.PaymentStatus = dto.PaymentStatus;
        payment.ProviderTransactionId = dto.ProviderTransactionId;
        payment.ProviderResponse = dto.ProviderResponse;
        payment.FailureReason = dto.FailureReason;

        if (dto.PaymentStatus == "Completed")
        {
            payment.PaidAt = DateTime.UtcNow;

            // Update appointment
            var appointment = payment.Appointment;
            if (appointment != null)
            {
                appointment.IsPaid = true;
                appointment.UpdatedAt = DateTime.UtcNow;
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

            // Send notification
            if (appointment?.Patient != null)
            {
                await _notificationService.NotifyPaymentCompletedAsync(
                    appointment.Patient.UserId,
                    payment.PaymentId,
                    payment.Amount,
                    payment.TransactionReference
                );
            }
        }

        payment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<Payment?> GetPaymentByTransactionReferenceAsync(string transactionReference)
    {
        return await _context.Payments
            .Include(p => p.Appointment)
            .Include(p => p.Patient)
            .FirstOrDefaultAsync(p => p.TransactionReference == transactionReference);
    }

    public async Task<List<PaymentDto>> GetPaymentsByPatientAsync(Guid patientId)
    {
        return await _context.Payments
            .Where(p => p.PatientId == patientId)
            .Select(p => new PaymentDto
            {
                PaymentId = p.PaymentId,
                AppointmentId = p.AppointmentId,
                PatientId = p.PatientId,
                TransactionReference = p.TransactionReference,
                PaymentMethod = p.PaymentMethod,
                PaymentProvider = p.PaymentProvider,
                Amount = p.Amount,
                Currency = p.Currency,
                PaymentStatus = p.PaymentStatus,
                PhoneNumber = p.PhoneNumber,
                PayerName = p.PayerName,
                PayerEmail = p.PayerEmail,
                ProviderTransactionId = p.ProviderTransactionId,
                PaidAt = p.PaidAt,
                CreatedAt = p.CreatedAt
            })
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }
}
