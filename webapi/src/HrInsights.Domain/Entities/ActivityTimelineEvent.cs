using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

/// <summary>
/// Timeline event displayed on the Overview dashboard.
/// </summary>
public sealed class ActivityTimelineEvent : AuditableEntity<Guid>
{
    private ActivityTimelineEvent()
        : base(Guid.Empty)
    {
        Title = string.Empty;
        Description = string.Empty;
        Category = string.Empty;
        Status = string.Empty;
        TimestampDisplay = string.Empty;
    }

    private ActivityTimelineEvent(Guid id, string title, string description, string category, string status, DateTime date, string timestampDisplay)
        : base(id)
    {
        Title = title;
        Description = description;
        Category = category;
        Status = status;
        Date = date;
        TimestampDisplay = timestampDisplay;
    }

    public string Title { get; private set; }
    public string Description { get; private set; }
    public string Category { get; private set; }
    public string Status { get; private set; }
    public DateTime Date { get; private set; }
    public string TimestampDisplay { get; private set; }

    public static ActivityTimelineEvent Create(string title, string description, string category, string status, DateTime date, string timestampDisplay)
        => new(Guid.NewGuid(), title, description, category, status, date, timestampDisplay);
}
