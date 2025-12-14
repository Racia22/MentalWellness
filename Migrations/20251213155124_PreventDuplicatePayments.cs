using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MentalWellness.API.Migrations
{
    /// <inheritdoc />
    public partial class PreventDuplicatePayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create a unique filtered index to prevent multiple active payments per appointment
            // This ensures only one payment with status Pending, Processing, or Completed per appointment
            migrationBuilder.CreateIndex(
                name: "IX_Payments_AppointmentId_PaymentStatus",
                table: "Payments",
                columns: new[] { "AppointmentId", "PaymentStatus" },
                unique: true,
                filter: "[PaymentStatus] IN ('Pending', 'Processing', 'Completed')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Payments_AppointmentId_PaymentStatus",
                table: "Payments");
        }
    }
}
