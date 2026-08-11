namespace HrInsights.Contracts.HiringPipeline;

/// <summary>
/// A single candidate row in the pipeline list.
/// Wire shape MUST match <c>frontend/react/src/types/index.ts#Applicant</c>.
/// </summary>
public sealed record CandidateDto(
    string Id,
    string? RequisitionId,
    string FullName,
    string Email,
    string Initials,
    string Position,
    string Department,
    string Location,
    string Source,
    string Status,        // "new" | "screening" | "interview" | "offer" | "hired" | "rejected"
    string AppliedAt);    // ISO 8601, UTC

/// <summary>
/// Paged result envelope returned by GET /api/candidates.
/// </summary>
public sealed record PagedCandidatesDto(
    IReadOnlyList<CandidateDto> Items,
    int Total,
    int Page,
    int PageSize);

/// <summary>
/// PATCH /api/candidates/{id}/status body.
/// </summary>
public sealed record UpdateCandidateStatusRequest(string Status);

/// <summary>
/// Per-status candidate counts returned by GET /api/candidates/counts.
/// Drives the tab badges in the React list view.
/// </summary>
public sealed record CandidateCountsDto(
    int All,
    int New,
    int Screening,
    int Interview,
    int Offer,
    int Hired,
    int Rejected);
