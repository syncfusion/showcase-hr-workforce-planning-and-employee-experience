namespace HrInsights.Contracts.EmployeeExperience;

public sealed record SelfServiceRequestDto(
    string Id,
    string EmployeeId,
    string EmployeeName,
    string Type,        // "address-change" | "benefits" | "payroll" | "equipment" | "leave-request" | "other"
    string Subject,
    string Details,
    string Status,      // "submitted" | "in-review" | "in-progress" | "resolved" | "rejected"
    string? Priority,   // "low" | "medium" | "high"
    string? AssignedTo,
    string CreatedAt,   // ISO 8601
    string? UpdatedAt,
    IReadOnlyList<string>? Attachments);
