namespace HrInsights.Domain.Enums;

/// <summary>
/// Status of an issue report (system, access, performance, ...).
/// </summary>
public enum IssueReportStatus
{
    Submitted = 0,
    Acknowledged = 1,
    InProgress = 2,
    Resolved = 3,
    WontFix = 4,
}
