using System.Net;
using System.Text.Json;
using MentalWellness.API.DTOs.Common;

namespace MentalWellness.API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            // Build a comprehensive error message - NEVER return generic "An error occurred"
            string errorMessage = $"Error: {exception.GetType().Name}";
            string? errorDetails = null;
            
            // Always include exception message if available
            if (!string.IsNullOrWhiteSpace(exception.Message))
            {
                errorMessage = exception.Message;
            }
            
            // For exceptions without messages, use type name
            if (errorMessage == $"Error: {exception.GetType().Name}")
            {
                var exceptionTypeName = exception.GetType().Name.Replace("Exception", "");
                errorMessage = $"{exceptionTypeName} occurred";
            }
            
            // Include stack trace in development
            if (_env.IsDevelopment())
            {
                if (string.IsNullOrWhiteSpace(errorDetails))
                {
                    errorDetails = exception.StackTrace;
                }
                
                // Add inner exception details
                if (exception.InnerException != null)
                {
                    errorDetails = $"{errorDetails}\n\nInner Exception: {exception.InnerException.GetType().Name}\n{exception.InnerException.Message}\n{exception.InnerException.StackTrace}";
                }
            }
            
            var response = new ErrorResponse
            {
                StatusCode = context.Response.StatusCode,
                Message = errorMessage,
                Details = errorDetails
            };

            // Handle specific exception types
            response = exception switch
            {
                UnauthorizedAccessException => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.Unauthorized,
                    Message = string.IsNullOrWhiteSpace(exception.Message) ? "Unauthorized access" : exception.Message,
                    Details = _env.IsDevelopment() ? exception.StackTrace : null
                },
                KeyNotFoundException => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.NotFound,
                    Message = string.IsNullOrWhiteSpace(exception.Message) ? "Resource not found" : exception.Message,
                    Details = _env.IsDevelopment() ? exception.StackTrace : null
                },
                ArgumentException => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.BadRequest,
                    Message = string.IsNullOrWhiteSpace(exception.Message) ? "Invalid argument provided" : exception.Message,
                    Details = _env.IsDevelopment() ? exception.StackTrace : null
                },
                Microsoft.EntityFrameworkCore.DbUpdateException dbEx => new ErrorResponse
                {
                    StatusCode = (int)HttpStatusCode.InternalServerError,
                    Message = dbEx.InnerException?.Message ?? dbEx.Message ?? "Database error occurred",
                    Details = _env.IsDevelopment() ? (dbEx.InnerException?.StackTrace ?? dbEx.StackTrace) : null
                },
                _ => response
            };
            
            // Final check: Ensure message is never generic or empty
            if (string.IsNullOrWhiteSpace(response.Message) || response.Message == "An error occurred")
            {
                response.Message = $"{exception.GetType().Name}: {(exception.InnerException?.Message ?? exception.Message ?? "An unexpected error occurred")}";
            }

            context.Response.StatusCode = response.StatusCode;
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var json = JsonSerializer.Serialize(response, options);
            return context.Response.WriteAsync(json);
        }
    }
}
