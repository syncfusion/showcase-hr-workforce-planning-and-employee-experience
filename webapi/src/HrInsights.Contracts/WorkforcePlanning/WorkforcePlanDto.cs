namespace HrInsights.Contracts.WorkforcePlanning;

/// <summary>
/// Workforce plan definition.
/// </summary>
public sealed record WorkforcePlanDto(
    string Id,
    string Name,
    string Status,         // "draft" | "active" | "archived"
    string PlanningPeriodStart,   // yyyy-mm-dd
    string PlanningPeriodEnd,     // yyyy-mm-dd
    string OwnerId,
    string Currency,       // ISO 4217
    string? LatestSnapshotAt);    // ISO 8601 with TZ offset
