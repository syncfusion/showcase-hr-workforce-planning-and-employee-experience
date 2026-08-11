namespace HrInsights.Contracts.EmployeeExperience;

public sealed record PulseSurveyDto(
    string Id,
    string? CampaignId,
    string Title,
    string Status,        // "draft" | "active" | "closed"
    string? Cadence,      // "one-time" | "weekly" | "monthly" | "quarterly"
    IReadOnlyList<string> QuestionRefs,
    decimal ResponseRate,
    int TotalResponses,
    string OpenAt,        // ISO 8601
    string? CloseAt,
    IReadOnlyList<ThemeSentimentDto> Themes);
