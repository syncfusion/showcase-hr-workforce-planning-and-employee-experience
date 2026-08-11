namespace HrInsights.Contracts.EmployeeExperience;

public sealed record PulseResponseDto(
    string Id,
    string PulseSurveyId,
    string? EmployeeId,
    string? Department,
    decimal Sentiment,
    string SubmittedAt,   // ISO 8601
    string? Comment);
