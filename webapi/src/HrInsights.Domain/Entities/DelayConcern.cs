using HrInsights.Domain.Common;
using HrInsights.Domain.Enums;

namespace HrInsights.Domain.Entities;

/// <summary>
/// An employee-raised "this is taking too long" concern
/// (e.g. self-service request pending 9 days).
/// </summary>
public sealed class DelayConcern : AuditableEntity<Guid>
{
    private DelayConcern() : base(Guid.Empty)
    {
        RaisedBy = string.Empty;
        RaisedByName = string.Empty;
        RelatedEntityType = string.Empty;
        Subject = string.Empty;
        Details = string.Empty;
    }

    private DelayConcern(
        Guid id,
        string raisedBy,
        string raisedByName,
        string relatedEntityType,
        string? relatedEntityId,
        string subject,
        string details,
        int daysWaiting,
        int? expectedSlackDays,
        DelayConcernStatus status,
        DelayConcernSeverity severity,
        DateTime createdAtUtc)
        : base(id)
    {
        RaisedBy = raisedBy;
        RaisedByName = raisedByName;
        RelatedEntityType = relatedEntityType;
        RelatedEntityId = relatedEntityId;
        Subject = subject;
        Details = details;
        DaysWaiting = daysWaiting;
        ExpectedSlackDays = expectedSlackDays;
        Status = status;
        Severity = severity;
        CreatedAt = createdAtUtc;
    }

    public string RaisedBy { get; private set; }
    public string RaisedByName { get; private set; }
    public string RelatedEntityType { get; private set; }
    public string? RelatedEntityId { get; private set; }
    public string Subject { get; private set; }
    public string Details { get; private set; }
    public int DaysWaiting { get; private set; }
    public int? ExpectedSlackDays { get; private set; }
    public DelayConcernStatus Status { get; private set; }
    public DelayConcernSeverity Severity { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public void SetStatus(DelayConcernStatus status) => Status = status;

    public static DelayConcern Create(
        string raisedBy,
        string raisedByName,
        string relatedEntityType,
        string? relatedEntityId,
        string subject,
        string details,
        int daysWaiting,
        int? expectedSlackDays,
        DelayConcernSeverity severity,
        DateTime createdAtUtc)
    {
        if (string.IsNullOrWhiteSpace(raisedBy)) throw new ArgumentException("RaisedBy is required.", nameof(raisedBy));
        if (string.IsNullOrWhiteSpace(relatedEntityType)) throw new ArgumentException("RelatedEntityType is required.", nameof(relatedEntityType));
        if (string.IsNullOrWhiteSpace(subject)) throw new ArgumentException("Subject is required.", nameof(subject));

        return new DelayConcern(
            Guid.NewGuid(),
            raisedBy.Trim(),
            raisedByName?.Trim() ?? string.Empty,
            relatedEntityType.Trim(),
            relatedEntityId,
            subject.Trim(),
            details?.Trim() ?? string.Empty,
            daysWaiting,
            expectedSlackDays,
            DelayConcernStatus.Open,
            severity,
            DateTime.SpecifyKind(createdAtUtc, DateTimeKind.Utc));
    }
}
