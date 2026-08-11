namespace HrInsights.Contracts.WorkforcePlanning;

/// <summary>
/// Scenario definition linked to a workforce plan.
/// </summary>
public sealed record WorkforceScenarioDto(
    string Id,
    string PlanId,
    string Name,
    string Type,           // "baseline" | "growth" | "constrained" | "risk"
    int HeadcountTarget,
    int? HiringTarget,
    double? AttritionRate,
    decimal BudgetImpact,
    string? Confidence);   // "low" | "medium" | "high"
