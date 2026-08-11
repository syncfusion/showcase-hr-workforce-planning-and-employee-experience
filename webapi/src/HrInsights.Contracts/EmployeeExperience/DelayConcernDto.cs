namespace HrInsights.Contracts.EmployeeExperience;

public sealed record DelayConcernDto(
    string Id,
    string RaisedBy,
    string RaisedByName,
    string RelatedEntityType,    // "self-service" | "requisition" | "approval" | "payroll" | "benefits" | "other"
    string? RelatedEntityId,
    string Subject,
    string Details,
    int DaysWaiting,
    int? ExpectedSlackDays,
    string Status,               // "open" | "acknowledged" | "resolved" | "rejected"
    string? Severity,            // "low" | "medium" | "high"
    string CreatedAt);           // ISO 8601
