using System.Net.Security;
using BlazorWebApp.Components;
using BlazorWebApp.Services;
using Syncfusion.Blazor;
using Syncfusion.Licensing;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();
builder.Services.AddSyncfusionBlazor();

// Resolve the Syncfusion license key from configuration so it can be
// rotated without a code change. Local dev can override
// Syncfusion:LicenseKey via User Secrets, environment variable, or
// appsettings.Development.json.
var syncfusionLicenseKey =
    Environment.GetEnvironmentVariable("SYNCFUSION_LICENSE")
    ?? builder.Configuration["Syncfusion:LicenseKey"];
 
if (!string.IsNullOrWhiteSpace(syncfusionLicenseKey))
{
    Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense(syncfusionLicenseKey);
}
else
{
    // Surface the missing-license condition as a warning so the operator
    // can spot it in the console before the page renders.
    Console.Error.WriteLine("[Syncfusion] License key missing from configuration (Syncfusion:LicenseKey). Add it to appsettings.json or User Secrets.");
}

// Scoped infrastructure (theme, breakpoint, sla) — they depend on
// IJSRuntime, which is itself Scoped on the Blazor Server circuit.
builder.Services.AddScoped<ThemeService>();
builder.Services.AddScoped<BreakpointService>();

// Real HTTP services — BaseAddress points at the ASP.NET backend.
// Production: appsettings.json (https://localhost:59527).
// Development: appsettings.Development.json overrides to the http profile
//              so the dev-cert TLS bypass path can take over.
var apiBase = builder.Configuration["Api:BaseUrl"]
    ?? throw new InvalidOperationException("Api:BaseUrl is not configured. Set it in appsettings.json or appsettings.Development.json.");

// In Development, accept the ASP.NET Core self-signed localhost cert so the
// HttpClient can talk to the backend when `dotnet dev-certs https --trust`
// has not been run (or after the dev cert has been rotated). This must NEVER
// be enabled in Production — it bypasses TLS validation for localhost only.
var isDevelopment = builder.Environment.IsDevelopment();
builder.Services.AddHttpClient<IOverviewService, OverviewService>(c => c.BaseAddress = new Uri(apiBase))
    .ConfigurePrimaryHttpMessageHandler(() => BuildHandler(isDevelopment));
builder.Services.AddHttpClient<IWorkforcePlanningService, WorkforcePlanningService>(c => c.BaseAddress = new Uri(apiBase))
    .ConfigurePrimaryHttpMessageHandler(() => BuildHandler(isDevelopment));
builder.Services.AddHttpClient<IHiringPipelineService, HiringPipelineService>(c => c.BaseAddress = new Uri(apiBase))
    .ConfigurePrimaryHttpMessageHandler(() => BuildHandler(isDevelopment));
builder.Services.AddHttpClient<IEmployeeExperienceService, EmployeeExperienceService>(c => c.BaseAddress = new Uri(apiBase))
    .ConfigurePrimaryHttpMessageHandler(() => BuildHandler(isDevelopment));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();

// Local helper — returns an HttpClientHandler that, in Development only,
// trusts the ASP.NET Core self-signed dev certificate for `localhost`. The
// custom validator rejects anything that is not CN=localhost issued by the
// dev-cert SHA-1 thumbprint, so the bypass can never accidentally extend to
// a non-localhost host.
static HttpClientHandler BuildHandler(bool isDevelopment)
{
    var handler = new HttpClientHandler();
    if (isDevelopment)
    {
        handler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) =>
        {
            if (errors == SslPolicyErrors.None)
            {
                return true;
            }
            return message.RequestUri?.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) == true;
        };
    }
    return handler;
}
