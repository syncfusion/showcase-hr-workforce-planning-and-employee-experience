namespace HrInsights.Contracts.EmployeeExperience;

public sealed record CreateDelayConcernRequest(
    string RelatedEntityType,
    string? RelatedEntityId,
    string Subject,
    string Details,
    int DaysWaiting,
    int? ExpectedSlackDays,
    string? Severity);
