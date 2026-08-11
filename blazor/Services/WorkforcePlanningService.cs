using System.Net.Http.Json;
using BlazorWebApp.Components.Models;

namespace BlazorWebApp.Services;

public interface IWorkforcePlanningService
{
    Task<IReadOnlyList<WorkforcePlan>> GetPlansAsync(CancellationToken ct = default);
    Task<IReadOnlyList<WorkforceScenario>> GetScenariosAsync(string? planId = null, CancellationToken ct = default);
    Task<IReadOnlyList<WorkforceLineItem>> GetLineItemsAsync(string? scenarioId = null, CancellationToken ct = default);
}

public sealed class WorkforcePlanningService : IWorkforcePlanningService
{
    private readonly HttpClient _http;

    public WorkforcePlanningService(HttpClient http)
    {
        _http = http;
    }

    public async Task<IReadOnlyList<WorkforcePlan>> GetPlansAsync(CancellationToken ct = default)
    {
        var list = await _http.GetFromJsonAsync<List<WorkforcePlan>>("api/workforce-planning/plans", ct)
            ?? new List<WorkforcePlan>();
        return list;
    }

    public async Task<IReadOnlyList<WorkforceScenario>> GetScenariosAsync(string? planId = null, CancellationToken ct = default)
    {
        var url = string.IsNullOrWhiteSpace(planId)
            ? "api/workforce-planning/scenarios"
            : $"api/workforce-planning/scenarios?planId={Uri.EscapeDataString(planId)}";
        var list = await _http.GetFromJsonAsync<List<WorkforceScenario>>(url, ct) ?? new();
        return list;
    }

    public async Task<IReadOnlyList<WorkforceLineItem>> GetLineItemsAsync(string? scenarioId = null, CancellationToken ct = default)
    {
        var url = string.IsNullOrWhiteSpace(scenarioId)
            ? "api/workforce-planning/line-items"
            : $"api/workforce-planning/line-items?scenarioId={Uri.EscapeDataString(scenarioId)}";
        var list = await _http.GetFromJsonAsync<List<WorkforceLineItem>>(url, ct) ?? new();
        return list;
    }
}
