namespace HrInsights.Domain.Enums;

/// <summary>
/// Stage of a hiring requisition as it moves through the pipeline.
/// </summary>
public enum HiringPipelineStatus
{
    NeedsApproval = 0,
    Open = 1,
    InReview = 2,
    Offered = 3,
    Hired = 4,
}
