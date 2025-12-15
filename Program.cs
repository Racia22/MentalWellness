using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using MentalWellness.API.Data;
using MentalWellness.API.Middleware;
using MentalWellness.API.Services;
using MentalWellness.API.Helpers;
using MentalWellness.API.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.Converters.Add(new MentalWellness.API.Helpers.TimeSpanJsonConverter());
    });

// Database Configuration
builder.Services.AddDatabase(builder.Configuration);

// JWT Authentication Configuration
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"];

if (!string.IsNullOrEmpty(secretKey))
{
    var key = Encoding.UTF8.GetBytes(secretKey);
    
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
}

// CORS Configuration
builder.Services.AddCorsPolicy(builder.Configuration);

// AutoMapper Configuration (if you decide to use it)
// builder.Services.AddAutoMapper(typeof(Program));

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);

// Register Services
builder.Services.AddApplicationServices();

// HttpClient for external API calls
builder.Services.AddHttpClient();

// Swagger/OpenAPI Configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerDocumentation();

var app = builder.Build();

// CORS must be first to handle preflight requests
app.UseCors("AllowAll");

// Custom Middleware
app.UseCustomExceptionHandler();
app.UseCustomRequestLogging();

// Only use HTTPS redirection in production or when HTTPS is available
if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

// Swagger Documentation (must be before UseAuthentication)
app.UseSwaggerDocumentation(app.Environment);

app.UseAuthentication();
app.UseAuthorization();

// Root endpoint that redirects to Swagger
app.MapGet("/", () => TypedResults.Redirect("/swagger")).ExcludeFromDescription();

app.MapControllers();

// Database Migration
await app.UseDatabaseMigrationAsync();

Console.WriteLine("\n🚀 Mental Wellness API is running...");
Console.WriteLine("📚 Swagger UI: http://localhost:5245 or https://localhost:7245");
Console.WriteLine("🔐 API Endpoint: http://localhost:5245/api\n");

app.Run();
