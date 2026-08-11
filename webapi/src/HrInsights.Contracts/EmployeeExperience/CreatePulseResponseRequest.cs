namespace HrInsights.Contracts.EmployeeExperience;

public sealed record CreatePulseResponseRequest(
    string PulseSurveyId,
    decimal Sentiment,
    string? Comment);
