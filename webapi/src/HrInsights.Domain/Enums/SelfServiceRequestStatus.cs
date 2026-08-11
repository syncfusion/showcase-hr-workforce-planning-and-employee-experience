namespace HrInsights.Domain.Enums;

/// <summary>
/// Lifecycle state of a self-service HR request (address change, equipment, etc).
/// </summary>
public enum SelfServiceRequestStatus
{
    Submitted = 0,
    InReview = 1,
    InProgress = 2,
    Resolved = 3,
    Rejected = 4,
}
