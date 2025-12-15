using MentalWellness.API.Data;
using MentalWellness.API.Middleware;
using Microsoft.EntityFrameworkCore;

namespace MentalWellness.API.Extensions;

public static class ApplicationBuilderExtensions
{
    public static IApplicationBuilder UseCustomExceptionHandler(this IApplicationBuilder app)
    {
        app.UseMiddleware<ExceptionMiddleware>();
        return app;
    }

    public static IApplicationBuilder UseCustomRequestLogging(this IApplicationBuilder app)
    {
        app.UseMiddleware<RequestLoggingMiddleware>();
        return app;
    }

    public static async Task<IApplicationBuilder> UseDatabaseMigrationAsync(this IApplicationBuilder app)
    {
        using (var scope = app.ApplicationServices.CreateScope())
        {
            var services = scope.ServiceProvider;
            try
            {
                var context = services.GetRequiredService<ApplicationDbContext>();

                // Check if database can be connected
                if (await context.Database.CanConnectAsync())
                {
                    // Check if migrations table exists
                    var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
                    if (pendingMigrations.Any())
                    {
                        try
                        {
                            await context.Database.MigrateAsync();
                            Console.WriteLine("✓ Database migrations applied successfully!");
                        }
                        catch (Exception migrationEx)
                        {
                            var logger = services.GetRequiredService<ILogger<Program>>();
                            logger.LogWarning(migrationEx, "Migration failed, but database may already be up to date. Continuing...");
                            Console.WriteLine("⚠ Migration skipped - database may already be configured.");
                        }
                    }
                    else
                    {
                        Console.WriteLine("✓ Database is up to date.");
                    }
                }
                else
                {
                    Console.WriteLine("⚠ Could not connect to database. Please check your connection string.");
                }
            }
            catch (Exception ex)
            {
                var logger = services.GetRequiredService<ILogger<Program>>();
                logger.LogError(ex, "An error occurred while checking the database.");
                Console.WriteLine("⚠ Database check failed, but application will continue.");
            }
        }

        return app;
    }

    public static IApplicationBuilder UseSwaggerDocumentation(this IApplicationBuilder app, IWebHostEnvironment env)
    {
        // Always enable Swagger in development, optionally in production
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mental Wellness API V1");
            c.RoutePrefix = "swagger"; // Access at /swagger
            c.DisplayRequestDuration();
            c.EnableDeepLinking();
            c.EnableFilter();
            c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List);
        });

        return app;
    }
}
