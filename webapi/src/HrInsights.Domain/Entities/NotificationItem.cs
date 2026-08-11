using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

/// <summary>
/// A notification in a user's inbox (chat, mention, system, status update, ...).
/// </summary>
public sealed class NotificationItem : AuditableEntity<Guid>
{
    private NotificationItem() : base(Guid.Empty)
    {
        UserId = string.Empty;
        Type = string.Empty;
        Title = string.Empty;
    }

    private NotificationItem(
        Guid id,
        string userId,
        string type,
        string title,
        string? body,
        string? relatedEntityType,
        string? relatedEntityId,
        bool read,
        DateTime createdAtUtc)
        : base(id)
    {
        UserId = userId;
        Type = type;
        Title = title;
        Body = body;
        RelatedEntityType = relatedEntityType;
        RelatedEntityId = relatedEntityId;
        Read = read;
        CreatedAt = createdAtUtc;
    }

    public string UserId { get; private set; }
    public string Type { get; private set; }
    public string Title { get; private set; }
    public string? Body { get; private set; }
    public string? RelatedEntityType { get; private set; }
    public string? RelatedEntityId { get; private set; }
    public bool Read { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public void MarkRead() => Read = true;
    public void MarkUnread() => Read = false;

    public static NotificationItem Create(
        string userId,
        string type,
        string title,
        string? body,
        string? relatedEntityType,
        string? relatedEntityId,
        bool read,
        DateTime createdAtUtc)
    {
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("UserId is required.", nameof(userId));
        if (string.IsNullOrWhiteSpace(type)) throw new ArgumentException("Type is required.", nameof(type));
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));

        return new NotificationItem(
            Guid.NewGuid(),
            userId.Trim(),
            type.Trim(),
            title.Trim(),
            body,
            relatedEntityType?.Trim(),
            relatedEntityId?.Trim(),
            read,
            DateTime.SpecifyKind(createdAtUtc, DateTimeKind.Utc));
    }
}
