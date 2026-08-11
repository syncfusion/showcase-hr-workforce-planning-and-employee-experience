using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

/// <summary>
/// Action label within an AI insight.
/// </summary>
public sealed class OverviewAiActionLabel
{
    public OverviewAiActionLabel(string id, string label)
    {
        Id = id;
        Label = label;
    }

    public string Id { get; }
    public string Label { get; }
}

/// <summary>
/// AI-generated insight displayed on the Overview dashboard.
/// </summary>
public sealed class OverviewAiInsight : AuditableEntity<Guid>
{
    private List<OverviewAiActionLabel> _actions = new();

    private OverviewAiInsight()
        : base(Guid.Empty)
    {
        EmployeeId = string.Empty;
        Summary = string.Empty;
        Quarter = string.Empty;
        Notes = string.Empty;
    }

    private OverviewAiInsight(Guid id, string employeeId, int engagementDrop, string quarter, string notes, string summary)
        : base(id)
    {
        EmployeeId = employeeId;
        EngagementDrop = engagementDrop;
        Quarter = quarter;
        Notes = notes;
        Summary = summary;
    }

    public string EmployeeId { get; private set; }
    public int EngagementDrop { get; private set; }
    public string Quarter { get; private set; }
    public string Notes { get; private set; }
    public string Summary { get; private set; }

    public List<OverviewAiActionLabel> Actions
    {
        get => _actions;
        private set => _actions = value ?? new List<OverviewAiActionLabel>();
    }

    public void SetActions(IEnumerable<OverviewAiActionLabel> actions)
    {
        _actions = new List<OverviewAiActionLabel>(actions);
    }

    public static OverviewAiInsight Create(string employeeId, int engagementDrop, string quarter, string notes, string summary)
        => new(Guid.NewGuid(), employeeId, engagementDrop, quarter, notes, summary);
}
