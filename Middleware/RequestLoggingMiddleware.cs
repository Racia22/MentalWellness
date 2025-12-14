namespace MentalWellness.API.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Log request
            _logger.LogInformation(
                "Incoming Request: {Method} {Path} from {IpAddress}",
                context.Request.Method,
                context.Request.Path,
                context.Connection.RemoteIpAddress
            );

            var startTime = DateTime.UtcNow;
            await _next(context);
            var duration = DateTime.UtcNow - startTime;

            // Log response
            _logger.LogInformation(
                "Completed Request: {Method} {Path} responded {StatusCode} in {Duration}ms",
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                duration.TotalMilliseconds
            );
        }
    }
}
