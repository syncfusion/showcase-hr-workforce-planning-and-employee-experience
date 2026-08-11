namespace HrInsights.Contracts.WorkforcePlanning;

/// <summary>
/// Line-item staffing row for a workforce scenario.
/// </summary>
public sealed record WorkforceLineItemDto(
    string Id,
    string ScenarioId,
    string Function,
    string Region,
    string RoleFamily,
    int CurrentHeadcount,
    int PlannedHeadcount,
    int? OpenRoles,
    string? CostCenter);
