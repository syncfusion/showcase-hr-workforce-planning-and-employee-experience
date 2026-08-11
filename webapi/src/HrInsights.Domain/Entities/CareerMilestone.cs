using HrInsights.Domain.Common;
using HrInsights.Domain.Enums;

namespace HrInsights.Domain.Entities;

/// <summary>
/// A single discrete milestone in a career development plan.
/// </summary>
public sealed class CareerMilestone : AuditableEntity<Guid>
{
    private CareerMilestone() : base(Guid.Empty)
    {
        Title = string.Empty;
    }

    private CareerMilestone(
        Guid id,
        Guid careerPlanId,
        string title,
        DateOnly targetDate,
        MilestoneStatus status,
        string? evidenceLink)
        : base(id)
    {
        CareerPlanId = careerPlanId;
        Title = title;
        TargetDate = targetDate;
        Status = status;
        EvidenceLink = evidenceLink;
    }

    public Guid CareerPlanId { get; private set; }
    public string Title { get; private set; }
    public DateOnly TargetDate { get; private set; }
    public MilestoneStatus Status { get; private set; }
    public string? EvidenceLink { get; private set; }

    public void SetStatus(MilestoneStatus status) => Status = status;

    public static CareerMilestone Create(
        Guid careerPlanId,
        string title,
        DateOnly targetDate,
        MilestoneStatus status,
        string? evidenceLink)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
        return new CareerMilestone(
            Guid.NewGuid(),
            careerPlanId,
            title.Trim(),
            targetDate,
            status,
            evidenceLink);
    }
}
