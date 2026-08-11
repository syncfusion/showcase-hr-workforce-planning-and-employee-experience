namespace HrInsights.Contracts.HiringPipeline;

/// <summary>
/// A single hiring requisition.
/// </summary>
public sealed record RequisitionDto(
    string Id,
    string Title,
    string Department,
    string Location,
    string Priority,      // "low" | "medium" | "high"
    string Status,        // "needs_approval" | "open" | "in_review" | "offered" | "hired"
    int DaysOpen,
    int HiredCount,
    int TargetCount,
    string CreatedAt);    // ISO 8601
