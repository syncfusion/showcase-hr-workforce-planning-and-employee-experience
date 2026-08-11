using HrInsights.Application;
using HrInsights.Application.Services;
using HrInsights.Infrastructure.EFCore;
using HrInsights.Infrastructure.EFCore.Persistence;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddValidation();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHrInsightsApplication();
builder.Services.AddHrInsightsOpenAi(builder.Configuration);
builder.Services.AddHrInsightsInfrastructureEfCore(builder.Configuration);
builder.Services.AddHealthChecks();

builder.Services.AddAuthentication("Bearer")
    .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, DemoAuthenticationHandler>("Bearer", _ => { });

builder.Services.AddAuthorization();

builder.Services.Configure<Microsoft.AspNetCore.Mvc.ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context => new BadRequestObjectResult(new ValidationProblemDetails(context.ModelState));
});

builder.Services.AddCors(options =>
{
    var policySection = builder.Configuration.GetSection("Cors:Policies:AllowReactApp");
    var origins = policySection.GetSection("Origins").Get<string[]>() ?? System.Array.Empty<string>();

    options.AddPolicy("AllowReactApp", policy =>
    {
        if (origins.Length > 0)
        {
            policy.WithOrigins(origins);
        }
        else
        {
            throw new InvalidOperationException(
                   "Production CORS origins are not configured.");
        }

        if (policySection.GetValue<bool>("AllowAnyHeader", true))
        {
            policy.AllowAnyHeader();
        }

        if (policySection.GetValue<bool>("AllowAnyMethod", true))
        {
            policy.AllowAnyMethod();
        }

        if (policySection.GetValue<bool>("AllowCredentials", false))
        {
            policy.AllowCredentials();
        }
    });
});

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
   var db = scope.ServiceProvider.GetRequiredService<HrInsightsDbContext>();
   await db.Database.MigrateAsync();

   var shouldSeed = builder.Configuration.GetValue("SeedDatabase", app.Environment.IsDevelopment());
   if (shouldSeed)
   {
       var seeder = scope.ServiceProvider.GetRequiredService<HrInsights.Infrastructure.Abstractions.Services.ICrmSeedDataGenerator>();
       await seeder.GenerateAsync();
   }
}

app.UseExceptionHandler();
app.UseStatusCodePages(async context =>

{

    var request = context.HttpContext.Request;

    var response = context.HttpContext.Response;


    if (response.StatusCode == 404)

    {

        if (request.Path.StartsWithSegments("/api"))

        {

            response.ContentType = "application/json";


            await response.WriteAsJsonAsync(new            {

                Status = 404,

                Message = "The requested API endpoint was not found."            });

        }

        else        {

            response.Redirect("/404.html");

        }

    }

});
app.UseCors("AllowReactApp");
app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        Status = "Healthy",
        Timestamp = DateTime.UtcNow,
        Environment = app.Environment.EnvironmentName,
        Version = "1.0.0"
    });
});
app.MapGet("/", async context =>
{
    context.Response.ContentType = "text/html";

    await context.Response.WriteAsync("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Portfolio API</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <style>

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: Segoe UI, Arial, sans-serif;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #0f172a, #1e293b);
                color: white;
            }

            .card {
                text-align: center;
                background: rgba(255,255,255,.06);
                padding: 50px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 10px 40px rgba(0,0,0,.3);
                width: 90%;
                max-width: 700px;
            }

            h1 {
                font-size: 3rem;
                margin-bottom: 15px;
            }

            .status {
                color: #22c55e;
                font-weight: bold;
                margin: 20px 0;
            }

            .description {
                opacity: .85;
                line-height: 1.7;
            }

            .footer {
                margin-top: 30px;
                opacity: .7;
                font-size: .9rem;
            }

            .btn {
                display: inline-block;
                margin-top: 25px;
                padding: 12px 20px;
                border-radius: 8px;
                text-decoration: none;
                background: #2563eb;
                color: white;
            }

        </style>
    </head>

    <body>

        <div class="card">

            <h1>Portfolio API</h1>

            <p class="status">✅ Service Online</p>

            <p class="description">
                This backend API powers the application and is not intended
                for direct consumer interaction.
            </p>

            <a href="/health" class="btn">Health Check</a>

            <div class="footer">
                Copyright © 2001 - 2026 Syncfusion® , Inc. All Rights Reserved. | Trademarks
            </div>

        </div>

    </body>
    </html>
    """);
});
app.UseAuthentication();
app.UseAuthorization();

app.MapOpenApi();

app.MapControllers();
app.Run();

public partial class Program;

static class ApiServiceCollectionExtensions
{
    public static IServiceCollection AddValidation(this IServiceCollection services)
    {
        services.AddSingleton<ProblemDetailsFactory, DefaultProblemDetailsFactory>();
        return services;
    }
}

sealed class DemoAuthenticationHandler : Microsoft.AspNetCore.Authentication.AuthenticationHandler<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions>
{
    public DemoAuthenticationHandler(
        Microsoft.Extensions.Options.IOptionsMonitor<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions> options,
        Microsoft.Extensions.Logging.ILoggerFactory logger,
        System.Text.Encodings.Web.UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<Microsoft.AspNetCore.Authentication.AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authHeader) || authHeader.Count == 0)
        {
            return Task.FromResult(Microsoft.AspNetCore.Authentication.AuthenticateResult.NoResult());
        }

        var claims = new[]
        {
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, "demo-user"),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, "demo.user@example.com"),
            new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, "crm.read")
        };

        var identity = new System.Security.Claims.ClaimsIdentity(claims, Scheme.Name);
        var principal = new System.Security.Claims.ClaimsPrincipal(identity);
        var ticket = new Microsoft.AspNetCore.Authentication.AuthenticationTicket(principal, Scheme.Name);

        return Task.FromResult(Microsoft.AspNetCore.Authentication.AuthenticateResult.Success(ticket));
    }
}
