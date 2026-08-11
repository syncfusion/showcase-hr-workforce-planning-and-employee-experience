using HrInsights.Domain.Common;
using HrInsights.Domain.Enums;

namespace HrInsights.Domain.Entities;

/// <summary>
/// A career development plan for an employee, owned by a manager.
/// </summary>
public sealed class CareerDevelopmentPlan : AuditableEntity<Guid>
{
    private List<CareerMilestone> _milestones = new();

    private CareerDevelopmentPlan() : base(Guid.Empty)
    {
        EmployeeId = string.Empty;
        EmployeeName = string.Empty;
        ManagerId = string.Empty;
        CurrentRole = string.Empty;
    }

    private CareerDevelopmentPlan(
        Guid id,
        string employeeId,
        string employeeName,
        string managerId,
        string currentRole,
        string? targetRole,
        CareerHorizon horizon,
        CareerPlanStatus status,
        DateTime? lastReviewedAtUtc)
        : base(id)
    {
        EmployeeId = employeeId;
        EmployeeName = employeeName;
        ManagerId = managerId;
        CurrentRole = currentRole;
        TargetRole = targetRole;
        Horizon = horizon;
        Status = status;
        LastReviewedAt = lastReviewedAtUtc;
    }

    public string EmployeeId { get; private set; }
    public string EmployeeName { get; private set; }
    public string ManagerId { get; private set; }
    public string CurrentRole { get; private set; }
    public string? TargetRole { get; private set; }
    public CareerHorizon Horizon { get; private set; }
    public CareerPlanStatus Status { get; private set; }
    public DateTime? LastReviewedAt { get; private set; }

    public List<CareerMilestone> Milestones
    {
        get => _milestones;
        private set => _milestones = value ?? new List<CareerMilestone>();
    }

    public void SetMilestones(IEnumerable<CareerMilestone> milestones)
        => _milestones = new List<CareerMilestone>(milestones ?? Array.Empty<CareerMilestone>());

    public void RecalculateStatus(DateTime reviewedAtUtc)
    {
        var statuses = _milestones.Select(m => m.Status).ToList();
        if (statuses.Count == 0)
        {
            Status = CareerPlanStatus.Draft;
        }
        else if (statuses.All(s => s == MilestoneStatus.Completed))
        {
            Status = CareerPlanStatus.Completed;
        }
        else if (statuses.Any(s => s == MilestoneStatus.Blocked))
        {
            Status = CareerPlanStatus.Stalled;
        }
        else if (statuses.Any(s => s == MilestoneStatus.InProgress))
        {
            Status = CareerPlanStatus.OnTrack;
        }
        LastReviewedAt = DateTime.SpecifyKind(reviewedAtUtc, DateTimeKind.Utc);
    }

    public static CareerDevelopmentPlan Create(
        string employeeId,
        string employeeName,
        string managerId,
        string currentRole,
        string? targetRole,
        CareerHorizon horizon,
        CareerPlanStatus status,
        IEnumerable<CareerMilestone> milestones,
        DateTime? lastReviewedAtUtc)
    {
        if (string.IsNullOrWhiteSpace(employeeId)) throw new ArgumentException("EmployeeId is required.", nameof(employeeId));
        if (string.IsNullOrWhiteSpace(managerId)) throw new ArgumentException("ManagerId is required.", nameof(managerId));

        var plan = new CareerDevelopmentPlan(
            Guid.NewGuid(),
            employeeId.Trim(),
            employeeName?.Trim() ?? string.Empty,
            managerId.Trim(),
            currentRole?.Trim() ?? string.Empty,
            targetRole?.Trim(),
            horizon,
            status,
            lastReviewedAtUtc.HasValue
                ? DateTime.SpecifyKind(lastReviewedAtUtc.Value, DateTimeKind.Utc)
                : null);
        plan.SetMilestones(milestones);
        return plan;
    }
}
