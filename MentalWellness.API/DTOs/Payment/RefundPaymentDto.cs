using System.ComponentModel.DataAnnotations;

namespace MentalWellness.API.DTOs.Payment;

public class RefundPaymentDto
{
    [Required]
    public decimal? RefundAmount { get; set; }

    [Required]
    [MaxLength(500)]
    public string RefundReason { get; set; } = string.Empty;
}

