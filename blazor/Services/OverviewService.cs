using System.Net.Http.Json;
using BlazorWebApp.Components.Models;

namespace BlazorWebApp.Services;

public interface IOverviewService
{
    Task<OverviewResponse> GetAsync(CancellationToken ct = default);

    /// <summary>
    /// Calls POST /api/overview/employee/{employeeId}/generate-insight to
    /// regenerate the AI insight for the given employee via the backend's
    /// LLM-backed <c>InsightGenerationService</c>. Returns the new insight
    /// on success, or <c>null</c> when AI is disabled / not configured
    /// (HTTP 503 from the backend). Throws on transport errors.
    /// </summary>
    Task<AiInsight?> GenerateInsightAsync(string employeeId, CancellationToken ct = default);
}

public sealed class OverviewService : IOverviewService
{
    private readonly HttpClient _http;

    public OverviewService(HttpClient http)
    {
        _http = http;
    }

    public async Task<OverviewResponse> GetAsync(CancellationToken ct = default)
    {
        var response = await _http.GetAsync("api/overview", ct);
        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<OverviewResponse>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Empty response from /api/overview");
        return payload;
    }

    public async Task<AiInsight?> GenerateInsightAsync(string employeeId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(employeeId))
        {
            throw new ArgumentException("Employee ID is required.", nameof(employeeId));
        }

        var url = $"api/overview/employee/{Uri.EscapeDataString(employeeId)}/generate-insight";
        var response = await _http.PostAsync(url, content: null, cancellationToken: ct);

        // The backend returns 503 when the AI service is disabled/unconfigured.
        // Mirror the React client's behavior: surface "unavailable" as a null
        // result so the UI can keep showing the cached/seeded insight without
        // throwing.
        if (response.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<AiInsight>(cancellationToken: ct);
    }
}
