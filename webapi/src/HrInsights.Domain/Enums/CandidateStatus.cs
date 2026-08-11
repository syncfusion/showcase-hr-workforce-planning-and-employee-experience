namespace HrInsights.Domain.Enums;

/// <summary>
/// Stage of a candidate as they move through the hiring funnel.
/// Wire form is the lower-case string of the name (e.g. "screening").
/// </summary>
public enum CandidateStatus
{
    New = 0,
    Screening = 1,
    Interview = 2,
    Offer = 3,
    Hired = 4,
    Rejected = 5,
}
