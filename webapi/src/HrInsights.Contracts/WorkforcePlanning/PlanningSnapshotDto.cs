namespace HrInsights.Contracts.WorkforcePlanning;

/// <summary>
/// Captured snapshot for a workforce plan.
/// </summary>
public sealed record PlanningSnapshotDto(
    string Id,
    string PlanId,
    string CapturedAt,     // ISO 8601 with TZ offset
    string CreatedBy,
    string SourceSystem);  // e.g. "hris", "planning-sheet"
