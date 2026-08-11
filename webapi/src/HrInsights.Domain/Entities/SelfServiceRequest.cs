using HrInsights.Domain.Common;
using HrInsights.Domain.Enums;

namespace HrInsights.Domain.Entities;

/// <summary>
/// A self-service HR request submitted by an employee
/// (address change, equipment, benefits, payroll, leave, ...).
/// </summary>
public sealed class SelfServiceRequest : AuditableEntity<Guid>
{
    private SelfServiceRequest() : base(Guid.Empty)
    {
        EmployeeId = string.Empty;
        EmployeeName = string.Empty;
        Type = string.Empty;
        Subject = string.Empty;
        Details = string.Empty;
    }

    private SelfServiceRequest(
        Guid id,
        string employeeId,
        string employeeName,
        string type,
        string subject,
        string details,
        SelfServiceRequestStatus status,
        SelfServiceRequestPriority priority,
        string? assignedTo,
        DateTime createdAtUtc,
        DateTime? updatedAtUtc)
        : base(id)
    {
        EmployeeId = employeeId;
        EmployeeName = employeeName;
        Type = type;
        Subject = subject;
        Details = details;
        Status = status;
        Priority = priority;
        AssignedTo = assignedTo;
        CreatedAt = createdAtUtc;
        UpdatedAt = updatedAtUtc;
    }

    public string EmployeeId { get; private set; }
    public string EmployeeName { get; private set; }
    public string Type { get; private set; }
    public string Subject { get; private set; }
    public string Details { get; private set; }
    public SelfServiceRequestStatus Status { get; private set; }
    public SelfServiceRequestPriority Priority { get; private set; }
    public string? AssignedTo { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }
    public string? AttachmentsCsv { get; private set; } = string.Empty;

    public IReadOnlyList<string> GetAttachments()
        => string.IsNullOrWhiteSpace(AttachmentsCsv)
            ? Array.Empty<string>()
            : AttachmentsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    public void SetAttachments(IEnumerable<string> attachments)
        => AttachmentsCsv = string.Join(',', attachments ?? Array.Empty<string>());

    public void SetStatus(SelfServiceRequestStatus status, DateTime updatedAtUtc)
    {
        Status = status;
        UpdatedAt = updatedAtUtc;
    }

    public static SelfServiceRequest Create(
        string employeeId,
        string employeeName,
        string type,
        string subject,
        string details,
        SelfServiceRequestPriority priority,
        string? assignedTo,
        DateTime createdAtUtc,
        IEnumerable<string>? attachments = null)
    {
        if (string.IsNullOrWhiteSpace(employeeId)) throw new ArgumentException("EmployeeId is required.", nameof(employeeId));
        if (string.IsNullOrWhiteSpace(type)) throw new ArgumentException("Type is required.", nameof(type));
        if (string.IsNullOrWhiteSpace(subject)) throw new ArgumentException("Subject is required.", nameof(subject));

        var req = new SelfServiceRequest(
            Guid.NewGuid(),
            employeeId.Trim(),
            employeeName?.Trim() ?? string.Empty,
            type.Trim(),
            subject.Trim(),
            details?.Trim() ?? string.Empty,
            SelfServiceRequestStatus.Submitted,
            priority,
            assignedTo,
            DateTime.SpecifyKind(createdAtUtc, DateTimeKind.Utc),
            null);
        req.SetAttachments(attachments ?? Array.Empty<string>());
        return req;
    }

    public static SelfServiceRequest Hydrate(
        Guid id,
        string employeeId,
        string employeeName,
        string type,
        string subject,
        string details,
        SelfServiceRequestStatus status,
        SelfServiceRequestPriority priority,
        string? assignedTo,
        DateTime createdAtUtc,
        DateTime? updatedAtUtc,
        string? attachmentsCsv)
        => new(id, employeeId, employeeName, type, subject, details, status, priority, assignedTo,
            DateTime.SpecifyKind(createdAtUtc, DateTimeKind.Utc),
            updatedAtUtc.HasValue ? DateTime.SpecifyKind(updatedAtUtc.Value, DateTimeKind.Utc) : null)
        {
            AttachmentsCsv = attachmentsCsv ?? string.Empty,
        };
}
