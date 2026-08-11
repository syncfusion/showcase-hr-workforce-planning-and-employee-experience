using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

public sealed class WorkforcePlan : AuditableEntity<string>
{
    private WorkforcePlan()
        : base(string.Empty)
    {
        Name = string.Empty;
        Status = string.Empty;
        OwnerId = string.Empty;
        Currency = string.Empty;
    }

    private WorkforcePlan(
        string id,
        string name,
        string status,
        DateOnly planningPeriodStart,
        DateOnly planningPeriodEnd,
        string ownerId,
        string currency,
        DateTimeOffset? latestSnapshotAt)
        : base(id)
    {
        Name = name;
        Status = status;
        PlanningPeriodStart = planningPeriodStart;
        PlanningPeriodEnd = planningPeriodEnd;
        OwnerId = ownerId;
        Currency = currency;
        LatestSnapshotAt = latestSnapshotAt;
    }

    public string Name { get; private set; }
    public string Status { get; private set; }
    public DateOnly PlanningPeriodStart { get; private set; }
    public DateOnly PlanningPeriodEnd { get; private set; }
    public string OwnerId { get; private set; }
    public string Currency { get; private set; }
    public DateTimeOffset? LatestSnapshotAt { get; private set; }

    public static WorkforcePlan Create(
        string id,
        string name,
        string status,
        DateOnly planningPeriodStart,
        DateOnly planningPeriodEnd,
        string ownerId,
        string currency,
        DateTimeOffset? latestSnapshotAt)
        => new(id, name, status, planningPeriodStart, planningPeriodEnd, ownerId, currency, latestSnapshotAt);
}
