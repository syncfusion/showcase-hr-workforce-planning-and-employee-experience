using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

/// <summary>
/// A peer-to-peer recognition (shoutout, milestone, team win, ...).
/// </summary>
public sealed class Recognition : AuditableEntity<Guid>
{
    private Recognition() : base(Guid.Empty)
    {
        FromEmployeeId = string.Empty;
        FromName = string.Empty;
        ToEmployeeId = string.Empty;
        ToName = string.Empty;
        Type = string.Empty;
        Message = string.Empty;
        VisibleTo = string.Empty;
    }

    private Recognition(
        Guid id,
        string fromEmployeeId,
        string fromName,
        string toEmployeeId,
        string toName,
        string type,
        string message,
        string? value,
        DateTime createdAtUtc,
        string visibleTo)
        : base(id)
    {
        FromEmployeeId = fromEmployeeId;
        FromName = fromName;
        ToEmployeeId = toEmployeeId;
        ToName = toName;
        Type = type;
        Message = message;
        Value = value;
        CreatedAt = createdAtUtc;
        VisibleTo = visibleTo;
    }

    public string FromEmployeeId { get; private set; }
    public string FromName { get; private set; }
    public string ToEmployeeId { get; private set; }
    public string ToName { get; private set; }
    public string Type { get; private set; }
    public string Message { get; private set; }
    public string? Value { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public string VisibleTo { get; private set; }

    public static Recognition Create(
        string fromEmployeeId,
        string fromName,
        string toEmployeeId,
        string toName,
        string type,
        string message,
        string? value,
        DateTime createdAtUtc,
        string visibleTo)
    {
        if (string.IsNullOrWhiteSpace(toEmployeeId)) throw new ArgumentException("ToEmployeeId is required.", nameof(toEmployeeId));
        if (string.IsNullOrWhiteSpace(type)) throw new ArgumentException("Type is required.", nameof(type));
        if (string.IsNullOrWhiteSpace(message)) throw new ArgumentException("Message is required.", nameof(message));

        return new Recognition(
            Guid.NewGuid(),
            fromEmployeeId.Trim(),
            fromName?.Trim() ?? string.Empty,
            toEmployeeId.Trim(),
            toName?.Trim() ?? string.Empty,
            type.Trim(),
            message.Trim(),
            value,
            DateTime.SpecifyKind(createdAtUtc, DateTimeKind.Utc),
            string.IsNullOrWhiteSpace(visibleTo) ? "public" : visibleTo.Trim());
    }
}
