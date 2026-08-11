namespace HrInsights.Contracts.HiringPipeline;

/// <summary>
/// Request for updating a requisition status.
/// </summary>
public sealed record UpdateStatusRequest(string Status);
