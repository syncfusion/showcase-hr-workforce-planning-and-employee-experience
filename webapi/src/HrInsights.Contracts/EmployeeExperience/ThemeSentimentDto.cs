namespace HrInsights.Contracts.EmployeeExperience;

public sealed record ThemeSentimentDto(
    string Theme,
    int Sentiment,     // -100 to 100
    string Department);
