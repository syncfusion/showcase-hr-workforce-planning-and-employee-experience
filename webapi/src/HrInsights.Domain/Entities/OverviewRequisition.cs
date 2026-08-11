using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

/// <summary>
/// Active requisition displayed on the Overview dashboard.
/// </summary>
public sealed class OverviewRequisition : AuditableEntity<Guid>
{
    private OverviewRequisition()
        : base(Guid.Empty)
    {
        Role = string.Empty;
        Department = string.Empty;
        Priority = string.Empty;
        Stage = string.Empty;
    }

    private OverviewRequisition(Guid id, string role, string department, string priority, int candidates, string stage, string timeOpen)
        : base(id)
    {
        Role = role;
        Department = department;
        Priority = priority;
        Candidates = candidates;
        Stage = stage;
        TimeOpen = timeOpen;
    }

    public string Role { get; private set; }
    public string Department { get; private set; }
    public string Priority { get; private set; }
    public int Candidates { get; private set; }
    public string Stage { get; private set; }
    public string TimeOpen { get; private set; } = string.Empty;

    public static OverviewRequisition Create(string role, string department, string priority, int candidates, string stage, string timeOpen)
        => new(Guid.NewGuid(), role, department, priority, candidates, stage, timeOpen);
}
