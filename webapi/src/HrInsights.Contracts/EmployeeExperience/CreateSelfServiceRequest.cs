namespace HrInsights.Contracts.EmployeeExperience;

public sealed record CreateSelfServiceRequest(
    string Type,
    string Subject,
    string Details,
    string? Priority);
