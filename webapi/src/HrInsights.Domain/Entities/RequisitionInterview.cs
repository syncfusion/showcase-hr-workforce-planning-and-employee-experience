using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

/// <summary>
/// A scheduled interview for an application on a requisition.
/// </summary>
public sealed class RequisitionInterview : AuditableEntity<Guid>
{
    private RequisitionInterview()
        : base(Guid.Empty)
    {
        ApplicationId = string.Empty;
        Type = string.Empty;
        Interviewers = string.Empty;
    }

    private RequisitionInterview(
        Guid id,
        Guid requisitionId,
        string applicationId,
        string type,
        DateTime scheduledStartUtc,
        DateTime scheduledEndUtc,
        string interviewers)
        : base(id)
    {
        RequisitionId = requisitionId;
        ApplicationId = applicationId;
        Type = type;
        ScheduledStartUtc = scheduledStartUtc;
        ScheduledEndUtc = scheduledEndUtc;
        Interviewers = interviewers;
    }

    public Guid RequisitionId { get; private set; }
    public string ApplicationId { get; private set; }
    public string Type { get; private set; }   // "phone" | "technical" | "panel" | "manager"
    public DateTime ScheduledStartUtc { get; private set; }
    public DateTime ScheduledEndUtc { get; private set; }
    public string Interviewers { get; private set; }   // CSV of interviewer ids/names

    public static RequisitionInterview Create(
        Guid requisitionId,
        string applicationId,
        string type,
        DateTime scheduledStartUtc,
        DateTime scheduledEndUtc,
        IEnumerable<string> interviewers)
        => new(
            Guid.NewGuid(),
            requisitionId,
            applicationId,
            type,
            scheduledStartUtc,
            scheduledEndUtc,
            string.Join(',', interviewers ?? Array.Empty<string>()));

    public IReadOnlyList<string> GetInterviewers()
        => string.IsNullOrWhiteSpace(Interviewers)
            ? Array.Empty<string>()
            : Interviewers.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}
