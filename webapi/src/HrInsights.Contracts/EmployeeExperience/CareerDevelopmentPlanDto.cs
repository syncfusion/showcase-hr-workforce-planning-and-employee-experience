namespace HrInsights.Contracts.EmployeeExperience;

public sealed record CareerDevelopmentPlanDto(
    string Id,
    string EmployeeId,
    string EmployeeName,
    string ManagerId,
    string CurrentRole,
    string? TargetRole,
    string Horizon,                 // "6-months" | "12-months" | "24-months"
    string Status,                  // "draft" | "on-track" | "at-risk" | "completed" | "stalled"
    IReadOnlyList<CareerMilestoneDto> Milestones,
    string? LastReviewedAt);
