// Real HTTP service for the Hiring Pipeline candidate-pipeline screen.
//
// All endpoint shapes are defined in
//   backend/src/HrInsights.Contracts/HiringPipeline/
// and implemented by
//   backend/src/HrInsights.Api/Controllers/HiringPipelineController.cs.
//
// The DTOs in `Components/Models/Hiring.cs` mirror the controller's
// wire format 1:1 via [JsonPropertyName] attributes, so
// System.Net.Http.Json deserializes the responses directly into records.

using System.Net.Http.Json;
using System.Text.Json;
using BlazorWebApp.Components.Models;

namespace BlazorWebApp.Services;

public interface IHiringPipelineService
{
    Task<PagedApplicants> FetchApplicantsAsync(ApplicantFilters? filters = null, CancellationToken ct = default);
    Task<ApplicantCounts> FetchApplicantCountsAsync(CancellationToken ct = default);
    Task MoveApplicantStageAsync(string id, string status, CancellationToken ct = default);
    Task RejectApplicantAsync(string id, CancellationToken ct = default);
}

public sealed class HiringPipelineService : IHiringPipelineService
{
    private readonly HttpClient _http;
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    public HiringPipelineService(HttpClient http)
    {
        _http = http;
    }

    public async Task<PagedApplicants> FetchApplicantsAsync(ApplicantFilters? filters = null, CancellationToken ct = default)
    {
        var qs = BuildApplicantsQueryString(filters);
        var page = await _http.GetFromJsonAsync<PagedApplicants>(
            $"api/hiring-pipeline/candidates{qs}", ct) ?? new(Array.Empty<Applicant>(), 0, 1, 0);
        return page;
    }

    public async Task<ApplicantCounts> FetchApplicantCountsAsync(CancellationToken ct = default)
    {
        var counts = await _http.GetFromJsonAsync<ApplicantCounts>(
            "api/hiring-pipeline/candidates/counts", ct)
            ?? new ApplicantCounts(0, 0, 0, 0, 0, 0, 0);
        return counts;
    }

    public async Task MoveApplicantStageAsync(string id, string status, CancellationToken ct = default)
    {
        var response = await _http.PatchAsJsonAsync(
            $"api/hiring-pipeline/candidates/{Uri.EscapeDataString(id)}/status",
            new UpdateApplicantStatusRequest(status),
            JsonOpts,
            ct);
        response.EnsureSuccessStatusCode();
    }

    public async Task RejectApplicantAsync(string id, CancellationToken ct = default)
    {
        var response = await _http.PostAsync(
            $"api/hiring-pipeline/candidates/{Uri.EscapeDataString(id)}/reject",
            content: null,
            ct);
        response.EnsureSuccessStatusCode();
    }

    private static string BuildApplicantsQueryString(ApplicantFilters? filters)
    {
        if (filters is null) return string.Empty;
        var parts = new List<string>(5);
        if (!string.IsNullOrWhiteSpace(filters.Status) && filters.Status != "all")
            parts.Add($"status={Uri.EscapeDataString(filters.Status)}");
        if (!string.IsNullOrWhiteSpace(filters.RequisitionId))
            parts.Add($"requisitionId={Uri.EscapeDataString(filters.RequisitionId)}");
        if (filters.Page > 0)
            parts.Add($"page={filters.Page}");
        if (filters.PageSize > 0)
            parts.Add($"pageSize={filters.PageSize}");
        if (!string.IsNullOrWhiteSpace(filters.Sort))
            parts.Add($"sort={Uri.EscapeDataString(filters.Sort)}");
        return parts.Count == 0 ? string.Empty : "?" + string.Join('&', parts);
    }
}
