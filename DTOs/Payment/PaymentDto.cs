namespace MentalWellness.API.DTOs.Payment;

public class PaymentDto
{
    public Guid PaymentId { get; set; }
    public Guid AppointmentId { get; set; }
    public Guid PatientId { get; set; }
    public string TransactionReference { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentProvider { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? PayerName { get; set; }
    public string? PayerEmail { get; set; }
    public string? ProviderTransactionId { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Additional fields for display
    public string? PatientName { get; set; }
    public string? DoctorName { get; set; }
    public DateTime? AppointmentDate { get; set; }
    public string? ProviderResponse { get; set; }
    public string? FailureReason { get; set; }
    public decimal? RefundAmount { get; set; }
    public string? RefundReason { get; set; }
    public DateTime? RefundedAt { get; set; }
    public string? InvoiceNumber { get; set; }
    public bool HasInvoice => !string.IsNullOrEmpty(InvoiceNumber);
}
