namespace HrInsights.Contracts.EmployeeExperience;

public sealed record CareerMilestoneDto(
    string Id,
    string PlanId,
    string Title,
    string TargetDate,     // yyyy-mm-dd
    string Status,       // "not-started" | "in-progress" | "completed" | "blocked"
    string? EvidenceLink);
