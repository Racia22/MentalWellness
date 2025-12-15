namespace MentalWellness.API.DTOs.Payment;

public class PaymentCallbackDto
{
    public string TransactionReference { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public string? ProviderTransactionId { get; set; }
    public string? ProviderResponse { get; set; }
    public string? FailureReason { get; set; }
}
