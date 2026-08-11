using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

/// <summary>
/// Action item / label within an action plan on the Overview dashboard.
/// </summary>
public sealed class OverviewActionItem
{
    public OverviewActionItem(string label, string status, string color, DateTime dueDate)
    {
        Label = label;
        Status = status;
        Color = color;
        DueDate = dueDate;
    }

    public string Label { get; }
    public string Status { get; }
    public string Color { get; }
    public DateTime DueDate { get; }
}

/// <summary>
/// Action plan displayed on the Overview dashboard.
/// </summary>
public sealed class OverviewActionPlan : AuditableEntity<Guid>
{
    private List<OverviewActionItem> _actions = new();

    private OverviewActionPlan()
        : base(Guid.Empty)
    {
        Title = string.Empty;
        Description = string.Empty;
        Category = string.Empty;
        StatusColor = string.Empty;
        StatusLabel = string.Empty;
    }

    private OverviewActionPlan(Guid id, string title, string description, string category, string statusColor, string statusLabel, int progress)
        : base(id)
    {
        Title = title;
        Description = description;
        Category = category;
        StatusColor = statusColor;
        StatusLabel = statusLabel;
        Progress = progress;
    }

    public string Title { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public string StatusColor { get; private set; } = string.Empty;
    public string StatusLabel { get; private set; } = string.Empty;
    public int Progress { get; private set; }

    public List<OverviewActionItem> Actions
    {
        get => _actions;
        private set => _actions = value ?? new List<OverviewActionItem>();
    }

    public void SetActions(IEnumerable<OverviewActionItem> actions)
    {
        _actions = new List<OverviewActionItem>(actions);
    }

    public static OverviewActionPlan Create(string title, string description, string category, string statusColor, string statusLabel, int progress)
        => new(Guid.NewGuid(), title, description, category, statusColor, statusLabel, progress);
}
