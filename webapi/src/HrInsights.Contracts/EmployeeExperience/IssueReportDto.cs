namespace HrInsights.Contracts.EmployeeExperience;

public sealed record IssueReportDto(
    string Id,
    string ReportedBy,
    string ReportedByName,
    string Category,        // "system-rendering" | "data-quality" | "access" | "performance" | "integration" | "other"
    string Subject,
    string Description,
    string? Url,
    string? Browser,
    IReadOnlyList<string>? Attachments,
    string Status,          // "submitted" | "acknowledged" | "in-progress" | "resolved" | "wont-fix"
    string? Priority,       // "low" | "medium" | "high" | "critical"
    string? AssignedTo,
    string CreatedAt,       // ISO 8601
    string? ResolvedAt);
