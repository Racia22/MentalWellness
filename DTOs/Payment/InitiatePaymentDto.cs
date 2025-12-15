using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.Payment;

public class InitiatePaymentDto
{
    [Required]
    public Guid AppointmentId { get; set; }

    [Required]
    public string PaymentMethod { get; set; } = string.Empty; // MoMo, Airtel, BankCard, etc.

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }
}
