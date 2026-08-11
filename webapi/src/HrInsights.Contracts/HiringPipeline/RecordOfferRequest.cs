namespace HrInsights.Contracts.HiringPipeline;

/// <summary>
/// Request for recording an offer.
/// </summary>
public sealed record RecordOfferRequest(
    string ApplicationId,
    int Compensation,
    string Currency,
    string StartDate);         // "YYYY-MM-DD"
