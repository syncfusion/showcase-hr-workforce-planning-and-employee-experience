namespace HrInsights.Contracts.EmployeeExperience;

public sealed record KanbanItemDto(
    string Id,
    string SourceType,     // "self-service" | "pulse-feedback" | "recognition" | "career" | "learning" | "issue" | "delay"
    string SourceId,
    string Title,
    string Lane,           // "backlog" | "in-progress" | "in-review" | "done"
    string? AssigneeId,
    string? Priority,      // "low" | "medium" | "high" | "critical"
    string? DueDate,       // yyyy-mm-dd
    IReadOnlyList<string>? Tags,
    string UpdatedAt);     // ISO 8601
