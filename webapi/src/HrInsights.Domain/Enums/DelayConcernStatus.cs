namespace HrInsights.Domain.Enums;

/// <summary>
/// Status of an employee-raised "this is taking too long" concern.
/// </summary>
public enum DelayConcernStatus
{
    Open = 0,
    Acknowledged = 1,
    Resolved = 2,
    Rejected = 3,
}
