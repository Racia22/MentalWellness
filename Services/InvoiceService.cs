using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using MentalWellness.API.Data;
using MentalWellness.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;

namespace MentalWellness.API.Services;

public class InvoiceService
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<InvoiceService> _logger;
    private readonly string _invoicesDirectory;

    public InvoiceService(
        ApplicationDbContext context,
        IWebHostEnvironment environment,
        ILogger<InvoiceService> logger)
    {
        _context = context;
        _environment = environment;
        _logger = logger;
        
        // Set up invoices directory
        _invoicesDirectory = Path.Combine(_environment.ContentRootPath ?? Directory.GetCurrentDirectory(), "Invoices");
        if (!Directory.Exists(_invoicesDirectory))
        {
            Directory.CreateDirectory(_invoicesDirectory);
        }
        
        // Set QuestPDF license (free for non-commercial use)
        // For commercial use, you need to set a license
        QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;
    }

    public async Task<string> GenerateInvoiceAsync(Guid paymentId)
    {
        var payment = await _context.Payments
            .Include(p => p.Appointment)
                .ThenInclude(a => a.Doctor)
                    .ThenInclude(d => d.User)
            .Include(p => p.Patient)
                .ThenInclude(p => p.User)
            .FirstOrDefaultAsync(p => p.PaymentId == paymentId);

        if (payment == null)
            throw new KeyNotFoundException("Payment not found");

        if (payment.PaymentStatus != "Completed")
            throw new InvalidOperationException("Invoice can only be generated for completed payments");

        // Generate invoice number if not exists
        if (string.IsNullOrEmpty(payment.InvoiceNumber))
        {
            payment.InvoiceNumber = GenerateInvoiceNumber();
        }

        // Generate PDF
        var invoicePath = Path.Combine(_invoicesDirectory, $"{payment.InvoiceNumber}.pdf");
        
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header()
                    .Column(column =>
                    {
                        column.Item().Row(row =>
                        {
                            row.RelativeItem().Column(col =>
                            {
                                col.Item().Text("Mental Wellness System").FontSize(20).Bold().FontColor(Colors.Blue.Darken2);
                                col.Item().Text("Professional Mental Health Services").FontSize(12).FontColor(Colors.Grey.Darken1);
                                col.Item().Text("Kigali, Rwanda").FontSize(10).FontColor(Colors.Grey.Darken1);
                            });
                            row.ConstantItem(100).AlignRight().Column(col =>
                            {
                                col.Item().Text("INVOICE").FontSize(24).Bold().FontColor(Colors.Blue.Darken2);
                                col.Item().Text($"#{payment.InvoiceNumber}").FontSize(12).FontColor(Colors.Grey.Darken1);
                            });
                        });
                    });

                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(column =>
                    {
                        column.Spacing(20);

                        // Invoice Details
                        column.Item().Row(row =>
                        {
                            row.RelativeItem().Column(col =>
                            {
                                col.Item().Text("Bill To:").FontSize(12).Bold();
                                col.Item().Text(payment.Patient.User.FullName).FontSize(11);
                                col.Item().Text(payment.Patient.User.Email).FontSize(10).FontColor(Colors.Grey.Darken1);
                                col.Item().Text(payment.Patient.User.Phone).FontSize(10).FontColor(Colors.Grey.Darken1);
                            });
                            row.ConstantItem(150).Column(col =>
                            {
                                col.Item().Text("Invoice Date:").FontSize(10).FontColor(Colors.Grey.Darken1);
                                col.Item().Text(payment.PaidAt?.ToString("dd MMM yyyy") ?? payment.CreatedAt.ToString("dd MMM yyyy")).FontSize(11);
                                col.Item().PaddingTop(5).Text("Payment Date:").FontSize(10).FontColor(Colors.Grey.Darken1);
                                col.Item().Text(payment.PaidAt?.ToString("dd MMM yyyy HH:mm") ?? "N/A").FontSize(11);
                            });
                        });

                        column.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                        // Service Details
                        column.Item().Text("Service Details").FontSize(14).Bold();
                        column.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn();
                                columns.ConstantColumn(100);
                                columns.ConstantColumn(100);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CellStyle).Text("Description").FontSize(11).Bold();
                                header.Cell().Element(CellStyle).AlignRight().Text("Quantity").FontSize(11).Bold();
                                header.Cell().Element(CellStyle).AlignRight().Text("Amount").FontSize(11).Bold();
                            });

                            table.Cell().Element(CellStyle).Text($"Consultation - {payment.Appointment.AppointmentType}");
                            table.Cell().Element(CellStyle).AlignRight().Text("1");
                            table.Cell().Element(CellStyle).AlignRight().Text($"{payment.Currency} {payment.Amount:N2}");

                            table.Cell().Element(CellStyle).Text($"Appointment Date: {payment.Appointment.AppointmentDate:dd MMM yyyy}");
                            table.Cell().Element(CellStyle);
                            table.Cell().Element(CellStyle);

                            table.Cell().Element(CellStyle).Text($"Doctor: {payment.Appointment.Doctor.User.FullName}");
                            table.Cell().Element(CellStyle);
                            table.Cell().Element(CellStyle);
                        });

                        column.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                        // Payment Summary
                        column.Item().AlignRight().Column(col =>
                        {
                            col.Item().Row(row =>
                            {
                                row.ConstantItem(100).Text("Subtotal:").FontSize(11);
                                row.ConstantItem(100).AlignRight().Text($"{payment.Currency} {payment.Amount:N2}").FontSize(11);
                            });
                            col.Item().Row(row =>
                            {
                                row.ConstantItem(100).Text("Total:").FontSize(12).Bold();
                                row.ConstantItem(100).AlignRight().Text($"{payment.Currency} {payment.Amount:N2}").FontSize(12).Bold();
                            });
                        });

                        column.Item().PaddingTop(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                        // Payment Information
                        column.Item().Text("Payment Information").FontSize(14).Bold();
                        column.Item().Row(row =>
                        {
                            row.RelativeItem().Column(col =>
                            {
                                col.Item().Text($"Payment Method: {payment.PaymentMethod}").FontSize(11);
                                col.Item().Text($"Transaction Reference: {payment.TransactionReference}").FontSize(11);
                                if (!string.IsNullOrEmpty(payment.ProviderTransactionId))
                                {
                                    col.Item().Text($"Provider Transaction ID: {payment.ProviderTransactionId}").FontSize(11);
                                }
                            });
                            row.ConstantItem(100).Column(col =>
                            {
                                col.Item().AlignRight().Padding(10).Background(Colors.Green.Lighten5)
                                    .Column(c =>
                                    {
                                        c.Item().Text("PAID").FontSize(16).Bold().FontColor(Colors.Green.Darken2);
                                        c.Item().Text(payment.PaidAt?.ToString("dd MMM yyyy") ?? "").FontSize(10).FontColor(Colors.Grey.Darken1);
                                    });
                            });
                        });
                    });

                page.Footer()
                    .AlignCenter()
                    .DefaultTextStyle(TextStyle.Default.FontSize(8).FontColor(Colors.Grey.Darken1))
                    .Text("Thank you for choosing Mental Wellness System. For inquiries, contact us at support@mentalwellness.rw");
            });
        });

        document.GeneratePdf(invoicePath);

        // Update payment with invoice path
        payment.InvoicePath = invoicePath;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Invoice generated: {InvoiceNumber} for payment {PaymentId}", payment.InvoiceNumber, paymentId);

        return invoicePath;
    }

    private string GenerateInvoiceNumber()
    {
        return $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
    }

    private static IContainer CellStyle(IContainer container)
    {
        return container
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten2)
            .PaddingVertical(5)
            .PaddingHorizontal(5);
    }

    public async Task<byte[]?> GetInvoicePdfAsync(Guid paymentId)
    {
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.PaymentId == paymentId);

        if (payment == null || string.IsNullOrEmpty(payment.InvoicePath))
            return null;

        if (!File.Exists(payment.InvoicePath))
        {
            // Regenerate if file doesn't exist
            await GenerateInvoiceAsync(paymentId);
            payment = await _context.Payments.FirstOrDefaultAsync(p => p.PaymentId == paymentId);
            if (payment == null || string.IsNullOrEmpty(payment.InvoicePath))
                return null;
        }

        return await File.ReadAllBytesAsync(payment.InvoicePath);
    }
}

