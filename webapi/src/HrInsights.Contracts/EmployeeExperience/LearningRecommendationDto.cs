namespace HrInsights.Contracts.EmployeeExperience;

public sealed record LearningRecommendationDto(
    string Id,
    string? PlanId,
    string EmployeeId,
    string Title,
    string? Provider,
    string Format,              // "course" | "article" | "video" | "certification" | "mentoring" | "project"
    string? SkillTag,
    string? Reason,
    decimal? MatchScore,
    decimal? EstHours,
    string Status,              // "suggested" | "saved" | "in-progress" | "completed" | "dismissed"
    string SuggestedAt);        // ISO 8601
