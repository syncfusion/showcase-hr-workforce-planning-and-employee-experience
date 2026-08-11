using HrInsights.Domain.Common;
using HrInsights.Domain.Enums;

namespace HrInsights.Domain.Entities;

/// <summary>
/// A user-submitted issue report (system bug, access problem, ...).
/// </summary>
public sealed class IssueReport : AuditableEntity<Guid>
{
    private IssueReport() : base(Guid.Empty)
    {
        ReportedBy = string.Empty;
        ReportedByName = string.Empty;
        Category = string.Empty;
        Subject = string.Empty;
        Description = string.Empty;
    }

    private IssueReport(
        Guid id,
        string reportedBy,
        string reportedByName,
        string category,
        string subject,
        string description,
        string? url,
        string? browser,
        IssueReportStatus status,
        IssueReportPriority priority,
        string? assignedTo,
        DateTime createdAtUtc,
        DateTime? resolvedAtUtc)
        : base(id)
    {
        ReportedBy = reportedBy;
        ReportedByName = reportedByName;
        Category = category;
        Subject = subject;
        Description = description;
        Url = url;
        Browser = browser;
        Status = status;
        Priority = priority;
        AssignedTo = assignedTo;
        CreatedAt = createdAtUtc;
        ResolvedAt = resolvedAtUtc;
    }

    public string ReportedBy { get; private set; }
    public string ReportedByName { get; private set; }
    public string Category { get; private set; }
    public string Subject { get; private set; }
    public string Description { get; private set; }
    public string? Url { get; private set; }
    public string? Browser { get; private set; }
    public IssueReportStatus Status { get; private set; }
    public IssueReportPriority Priority { get; private set; }
    public string? AssignedTo { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? ResolvedAt { get; private set; }
    public string? AttachmentsCsv { get; private set; } = string.Empty;

    public IReadOnlyList<string> GetAttachments()
        => string.IsNullOrWhiteSpace(AttachmentsCsv)
            ? Array.Empty<string>()
            : AttachmentsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    public void SetAttachments(IEnumerable<string> attachments)
        => AttachmentsCsv = string.Join(',', attachments ?? Array.Empty<string>());

    public void SetStatus(IssueReportStatus status, DateTime updatedAtUtc)
    {
        Status = status;
        ResolvedAt = status == IssueReportStatus.Resolved
            ? DateTime.SpecifyKind(updatedAtUtc, DateTimeKind.Utc)
            : ResolvedAt;
    }

    public static IssueReport Create(
        string reportedBy,
        string reportedByName,
        string category,
        string subject,
        string description,
        string? url,
        string? browser,
        IssueReportPriority priority,
        string? assignedTo,
        DateTime createdAtUtc,
        IEnumerable<string>? attachments = null)
    {
        if (string.IsNullOrWhiteSpace(reportedBy)) throw new ArgumentException("ReportedBy is required.", nameof(reportedBy));
        if (string.IsNullOrWhiteSpace(category)) throw new ArgumentException("Category is required.", nameof(category));
        if (string.IsNullOrWhiteSpace(subject)) throw new ArgumentException("Subject is required.", nameof(subject));

        var report = new IssueReport(
            Guid.NewGuid(),
            reportedBy.Trim(),
            reportedByName?.Trim() ?? string.Empty,
            category.Trim(),
            subject.Trim(),
            description?.Trim() ?? string.Empty,
            url,
            browser,
            IssueReportStatus.Submitted,
            priority,
            assignedTo,
            DateTime.SpecifyKind(createdAtUtc, DateTimeKind.Utc),
            null);
        report.SetAttachments(attachments ?? Array.Empty<string>());
        return report;
    }
}
