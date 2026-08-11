using HrInsights.Domain.Common;
using HrInsights.Domain.Enums;

namespace HrInsights.Domain.Entities;

/// <summary>
/// A candidate that has applied to a requisition and is moving through the
/// hiring funnel. The stage column drives the pipeline kanban + per-tab
/// counts surfaced by the Hiring Pipeline API.
/// </summary>
public sealed class Candidate : AuditableEntity<Guid>
{
    private Candidate()
        : base(Guid.Empty)
    {
        FullName = string.Empty;
        Email = string.Empty;
        Initials = string.Empty;
        Position = string.Empty;
        Department = string.Empty;
        Location = string.Empty;
        Source = string.Empty;
    }

    private Candidate(
        Guid id,
        Guid? requisitionId,
        string fullName,
        string email,
        string initials,
        string position,
        string department,
        string location,
        string source,
        CandidateStatus status,
        DateTime appliedAtUtc)
        : base(id)
    {
        RequisitionId = requisitionId;
        FullName = fullName;
        Email = email;
        Initials = initials;
        Position = position;
        Department = department;
        Location = location;
        Source = source;
        Status = status;
        AppliedAt = appliedAtUtc;
    }

    public Guid? RequisitionId { get; private set; }
    public string FullName { get; private set; }
    public string Email { get; private set; }
    public string Initials { get; private set; }
    public string Position { get; private set; }
    public string Department { get; private set; }
    public string Location { get; private set; }
    public string Source { get; private set; }
    public CandidateStatus Status { get; private set; }
    public DateTime AppliedAt { get; private set; }

    public void MoveTo(CandidateStatus next) => Status = next;
    public void Reject() => Status = CandidateStatus.Rejected;

    public static Candidate Create(
        Guid? requisitionId,
        string fullName,
        string email,
        string position,
        string department,
        string location,
        string source,
        CandidateStatus status,
        DateTime appliedAtUtc)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new ArgumentException("Full name is required.", nameof(fullName));
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required.", nameof(email));

        var initials = ComputeInitials(fullName);
        return new Candidate(
            Guid.NewGuid(),
            requisitionId,
            fullName.Trim(),
            email.Trim().ToLowerInvariant(),
            initials,
            position?.Trim() ?? string.Empty,
            department?.Trim() ?? string.Empty,
            location?.Trim() ?? string.Empty,
            source?.Trim() ?? string.Empty,
            status,
            DateTime.SpecifyKind(appliedAtUtc, DateTimeKind.Utc));
    }

    public static Candidate Hydrate(
        Guid id,
        Guid? requisitionId,
        string fullName,
        string email,
        string initials,
        string position,
        string department,
        string location,
        string source,
        CandidateStatus status,
        DateTime appliedAtUtc)
        => new(
            id,
            requisitionId,
            fullName,
            email,
            initials,
            position,
            department,
            location,
            source,
            status,
            appliedAtUtc);

    public static string ComputeInitials(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            return string.Empty;

        var parts = fullName
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        if (parts.Length == 0)
            return string.Empty;

        if (parts.Length == 1)
            return parts[0]!.Substring(0, 1).ToUpperInvariant();

        return (parts[0]!.Substring(0, 1) + parts[^1]!.Substring(0, 1)).ToUpperInvariant();
    }
}
