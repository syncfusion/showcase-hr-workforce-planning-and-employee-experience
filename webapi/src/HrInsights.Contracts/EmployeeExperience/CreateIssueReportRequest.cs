namespace HrInsights.Contracts.EmployeeExperience;

public sealed record CreateIssueReportRequest(
    string Category,
    string Subject,
    string Description,
    string? Url,
    string? Browser,
    string? Priority);
