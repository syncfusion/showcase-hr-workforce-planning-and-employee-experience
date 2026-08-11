using HrInsights.Domain.Common;
using HrInsights.Domain.Enums;

namespace HrInsights.Domain.Entities;

/// <summary>
/// A work item shown on the Employee Experience kanban board.
/// </summary>
public sealed class KanbanItem : AuditableEntity<Guid>
{
    private KanbanItem() : base(Guid.Empty)
    {
        SourceType = string.Empty;
        SourceId = string.Empty;
        Title = string.Empty;
    }

    private KanbanItem(
        Guid id,
        string sourceType,
        string sourceId,
        string title,
        KanbanLane lane,
        string? assigneeId,
        KanbanPriority priority,
        DateOnly? dueDate,
        DateTime updatedAtUtc)
        : base(id)
    {
        SourceType = sourceType;
        SourceId = sourceId;
        Title = title;
        Lane = lane;
        AssigneeId = assigneeId;
        Priority = priority;
        DueDate = dueDate;
        UpdatedAt = updatedAtUtc;
    }

    public string SourceType { get; private set; }
    public string SourceId { get; private set; }
    public string Title { get; private set; }
    public KanbanLane Lane { get; private set; }
    public string? AssigneeId { get; private set; }
    public KanbanPriority Priority { get; private set; }
    public DateOnly? DueDate { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public string? TagsCsv { get; private set; } = string.Empty;

    public IReadOnlyList<string> GetTags()
        => string.IsNullOrWhiteSpace(TagsCsv)
            ? Array.Empty<string>()
            : TagsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    public void SetTags(IEnumerable<string> tags)
        => TagsCsv = string.Join(',', tags ?? Array.Empty<string>());

    public void SetLane(KanbanLane lane, DateTime updatedAtUtc)
    {
        Lane = lane;
        UpdatedAt = DateTime.SpecifyKind(updatedAtUtc, DateTimeKind.Utc);
    }

    public static KanbanItem Create(
        string sourceType,
        string sourceId,
        string title,
        KanbanLane lane,
        string? assigneeId,
        KanbanPriority priority,
        DateOnly? dueDate,
        IEnumerable<string>? tags,
        DateTime updatedAtUtc)
    {
        if (string.IsNullOrWhiteSpace(sourceType)) throw new ArgumentException("SourceType is required.", nameof(sourceType));
        if (string.IsNullOrWhiteSpace(sourceId)) throw new ArgumentException("SourceId is required.", nameof(sourceId));
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));

        var item = new KanbanItem(
            Guid.NewGuid(),
            sourceType.Trim(),
            sourceId.Trim(),
            title.Trim(),
            lane,
            assigneeId,
            priority,
            dueDate,
            DateTime.SpecifyKind(updatedAtUtc, DateTimeKind.Utc));
        item.SetTags(tags);
        return item;
    }
}
