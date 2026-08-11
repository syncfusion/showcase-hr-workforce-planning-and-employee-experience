namespace HrInsights.Contracts.WorkforcePlanning;

/// <summary>
/// Assumption parameter for a scenario.
/// </summary>
public sealed record ScenarioAssumptionDto(
    string Id,
    string ScenarioId,
    string Category,
    double Value,
    string Unit,       // "percent" | "currency" | "months" | "count"
    string? Note);
