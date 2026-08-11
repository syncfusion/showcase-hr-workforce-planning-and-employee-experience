namespace HrInsights.Domain.Enums;

/// <summary>
/// Status of a learning recommendation for an employee.
/// </summary>
public enum LearningRecommendationStatus
{
    Suggested = 0,
    Saved = 1,
    InProgress = 2,
    Completed = 3,
    Dismissed = 4,
}
