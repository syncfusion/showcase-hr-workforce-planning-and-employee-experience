namespace HrInsights.Domain.Enums;

/// <summary>
/// Aggregate status of a career development plan.
/// </summary>
public enum CareerPlanStatus
{
    Draft = 0,
    OnTrack = 1,
    AtRisk = 2,
    Completed = 3,
    Stalled = 4,
}
