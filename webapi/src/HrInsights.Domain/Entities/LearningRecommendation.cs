using HrInsights.Domain.Common;
using HrInsights.Domain.Enums;

namespace HrInsights.Domain.Entities;

/// <summary>
/// A learning recommendation surfaced to an employee (course, video, article, ...).
/// </summary>
public sealed class LearningRecommendation : AuditableEntity<Guid>
{
    private LearningRecommendation() : base(Guid.Empty)
    {
        EmployeeId = string.Empty;
        Title = string.Empty;
    }

    private LearningRecommendation(
        Guid id,
        Guid? careerPlanId,
        string employeeId,
        string title,
        string? provider,
        LearningFormat format,
        string? skillTag,
        string? reason,
        decimal? matchScore,
        decimal? estHours,
        LearningRecommendationStatus status,
        DateTime suggestedAtUtc)
        : base(id)
    {
        CareerPlanId = careerPlanId;
        EmployeeId = employeeId;
        Title = title;
        Provider = provider;
        Format = format;
        SkillTag = skillTag;
        Reason = reason;
        MatchScore = matchScore;
        EstHours = estHours;
        Status = status;
        SuggestedAt = suggestedAtUtc;
    }

    public Guid? CareerPlanId { get; private set; }
    public string EmployeeId { get; private set; }
    public string Title { get; private set; }
    public string? Provider { get; private set; }
    public LearningFormat Format { get; private set; }
    public string? SkillTag { get; private set; }
    public string? Reason { get; private set; }
    public decimal? MatchScore { get; private set; }
    public decimal? EstHours { get; private set; }
    public LearningRecommendationStatus Status { get; private set; }
    public DateTime SuggestedAt { get; private set; }

    public void SetStatus(LearningRecommendationStatus status) => Status = status;

    public static LearningRecommendation Create(
        Guid? careerPlanId,
        string employeeId,
        string title,
        string? provider,
        LearningFormat format,
        string? skillTag,
        string? reason,
        decimal? matchScore,
        decimal? estHours,
        LearningRecommendationStatus status,
        DateTime suggestedAtUtc)
    {
        if (string.IsNullOrWhiteSpace(employeeId)) throw new ArgumentException("EmployeeId is required.", nameof(employeeId));
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
        return new LearningRecommendation(
            Guid.NewGuid(),
            careerPlanId,
            employeeId.Trim(),
            title.Trim(),
            provider?.Trim(),
            format,
            skillTag?.Trim(),
            reason?.Trim(),
            matchScore,
            estHours,
            status,
            DateTime.SpecifyKind(suggestedAtUtc, DateTimeKind.Utc));
    }
}
