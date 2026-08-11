using HrInsights.Contracts.HiringPipeline;
using HrInsights.Domain.Entities;
using HrInsights.Domain.Enums;
using HrInsights.Infrastructure.Abstractions.Repositories;

namespace HrInsights.Application.Services;

/// <summary>
/// Service contract for the hiring-pipeline module.
/// </summary>
public interface IHiringPipelineService
{
    IReadOnlyList<RequisitionDto> GetRequisitions(string? department, string? location, string? priority);
    IReadOnlyList<string> GetDepartments();
    IReadOnlyList<string> GetLocations();
    Task<RequisitionDto> CreateRequisitionAsync(CreateRequisitionRequest request, CancellationToken cancellationToken = default);
    Task<bool> UpdateStatusAsync(string id, UpdateStatusRequest request, CancellationToken cancellationToken = default);
    Task ScheduleInterviewAsync(ScheduleInterviewRequest request, CancellationToken cancellationToken = default);
    Task RecordOfferAsync(RecordOfferRequest request, CancellationToken cancellationToken = default);

    // ── Candidate pipeline (per-requisition) ─────────────────────
    PagedCandidatesDto GetCandidates(
        string? status,
        string? requisitionId,
        int page,
        int pageSize,
        string? sort);
    CandidateCountsDto GetCandidateCounts();
    CandidateDto? GetCandidate(string id);
    Task<bool> UpdateCandidateStatusAsync(string id, UpdateCandidateStatusRequest request, CancellationToken cancellationToken = default);
    Task<bool> RejectCandidateAsync(string id, CancellationToken cancellationToken = default);
}

/// <summary>
/// DB-backed hiring pipeline service. All reads and writes go through
/// the repository abstractions. With a readonly DB user, every mutating
/// call fails with a database permission error; with a writable user the
/// change is persisted and visible to subsequent reads.
/// </summary>
public sealed class HiringPipelineService : IHiringPipelineService
{
    private readonly IReadRepository<Requisition, Guid> _requisitionReadRepository;
    private readonly IRepository<Requisition, Guid> _requisitionRepository;
    private readonly IRepository<RequisitionInterview, Guid> _interviewRepository;
    private readonly IRepository<RequisitionOffer, Guid> _offerRepository;
    private readonly IReadRepository<Candidate, Guid> _candidateReadRepository;
    private readonly IRepository<Candidate, Guid> _candidateRepository;
    private readonly IUnitOfWork _unitOfWork;

    public HiringPipelineService(
        IReadRepository<Requisition, Guid> requisitionReadRepository,
        IRepository<Requisition, Guid> requisitionRepository,
        IRepository<RequisitionInterview, Guid> interviewRepository,
        IRepository<RequisitionOffer, Guid> offerRepository,
        IReadRepository<Candidate, Guid> candidateReadRepository,
        IRepository<Candidate, Guid> candidateRepository,
        IUnitOfWork unitOfWork)
    {
        _requisitionReadRepository = requisitionReadRepository;
        _requisitionRepository = requisitionRepository;
        _interviewRepository = interviewRepository;
        _offerRepository = offerRepository;
        _candidateReadRepository = candidateReadRepository;
        _candidateRepository = candidateRepository;
        _unitOfWork = unitOfWork;
    }

    public IReadOnlyList<RequisitionDto> GetRequisitions(string? department, string? location, string? priority)
    {
        var data = _requisitionReadRepository
            .ListAsync()
            .GetAwaiter()
            .GetResult()
            .ToList();

        if (!string.IsNullOrWhiteSpace(department))
            data = data.Where(r => string.Equals(r.Department, department, StringComparison.OrdinalIgnoreCase)).ToList();

        if (!string.IsNullOrWhiteSpace(location))
            data = data.Where(r => string.Equals(r.Location, location, StringComparison.OrdinalIgnoreCase)).ToList();

        if (!string.IsNullOrWhiteSpace(priority) && TryParsePriority(priority, out var priorityEnum))
            data = data.Where(r => r.Priority == priorityEnum).ToList();

        return data
            .OrderByDescending(r => r.CreatedAt)
            .Select(MapToDto)
            .ToList();
    }

    public IReadOnlyList<string> GetDepartments()
        => _requisitionReadRepository
            .ListAsync()
            .GetAwaiter()
            .GetResult()
            .Select(r => r.Department)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(d => d)
            .ToList();

    public IReadOnlyList<string> GetLocations()
        => _requisitionReadRepository
            .ListAsync()
            .GetAwaiter()
            .GetResult()
            .Select(r => r.Location)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(d => d)
            .ToList();

    public async Task<RequisitionDto> CreateRequisitionAsync(CreateRequisitionRequest request, CancellationToken cancellationToken = default)
    {
        var status = ParseStatus(request.Status);
        var priority = ParsePriority(request.Priority);
        var createdAt = ParseDate(request.CreatedAt);

        var entity = Requisition.Create(
            title: request.Title,
            department: request.Department,
            location: request.Location,
            priority: priority,
            status: status,
            daysOpen: request.DaysOpen,
            hiredCount: request.HiredCount,
            targetCount: request.TargetCount,
            createdAt: createdAt);

        await _requisitionRepository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return MapToDto(entity);
    }

    public async Task<bool> UpdateStatusAsync(string id, UpdateStatusRequest request, CancellationToken cancellationToken = default)
    {
        if (!TryParseGuid(id, out var guid))
        {
            return false;
        }

        var entity = await _requisitionReadRepository.GetByIdAsync(guid, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        var newStatus = ParseStatus(request.Status);
        entity.UpdateStage(newStatus);
        _requisitionRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task ScheduleInterviewAsync(ScheduleInterviewRequest request, CancellationToken cancellationToken = default)
    {
        if (!TryParseGuid(request.ApplicationId, out var requisitionId))
        {
            // The applicationId coming from clients is a free-form string. We only persist
            // the interview when it can be resolved to a known requisition. The current UI
            // does not exercise this path, so this is a defensive no-op.
            return;
        }

        var interview = RequisitionInterview.Create(
            requisitionId: requisitionId,
            applicationId: request.ApplicationId,
            type: request.Type,
            scheduledStartUtc: ParseDate(request.ScheduledStart),
            scheduledEndUtc: ParseDate(request.ScheduledEnd),
            interviewers: request.Interviewers);

        await _interviewRepository.AddAsync(interview, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task RecordOfferAsync(RecordOfferRequest request, CancellationToken cancellationToken = default)
    {
        if (!TryParseGuid(request.ApplicationId, out var requisitionId))
        {
            return;
        }

        var offer = RequisitionOffer.Create(
            requisitionId: requisitionId,
            applicationId: request.ApplicationId,
            compensation: request.Compensation,
            currency: request.Currency,
            startDate: DateTime.SpecifyKind(DateTime.Parse(request.StartDate), DateTimeKind.Utc));

        await _offerRepository.AddAsync(offer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    // ── 4. Candidates ─────────────────────────────────────────────

    public PagedCandidatesDto GetCandidates(
        string? status,
        string? requisitionId,
        int page,
        int pageSize,
        string? sort)
    {
        page = page <= 0 ? 1 : page;
        pageSize = pageSize <= 0 ? 20 : Math.Min(pageSize, 200);

        var data = _candidateReadRepository
            .ListAsync()
            .GetAwaiter()
            .GetResult()
            .ToList();

        if (!string.IsNullOrWhiteSpace(status)
            && !string.Equals(status, "all", StringComparison.OrdinalIgnoreCase)
            && TryParseCandidateStatus(status, out var parsedStatus))
        {
            data = data.Where(c => c.Status == parsedStatus).ToList();
        }

        if (!string.IsNullOrWhiteSpace(requisitionId) && TryParseGuid(requisitionId, out var reqGuid))
        {
            data = data.Where(c => c.RequisitionId == reqGuid).ToList();
        }

        data = ApplyCandidateSort(data, sort);

        var total = data.Count;
        var items = data
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(MapToDto)
            .ToList();

        return new PagedCandidatesDto(items, total, page, pageSize);
    }

    public CandidateCountsDto GetCandidateCounts()
    {
        var data = _candidateReadRepository
            .ListAsync()
            .GetAwaiter()
            .GetResult();

        return new CandidateCountsDto(
            All: data.Count,
            New: data.Count(c => c.Status == CandidateStatus.New),
            Screening: data.Count(c => c.Status == CandidateStatus.Screening),
            Interview: data.Count(c => c.Status == CandidateStatus.Interview),
            Offer: data.Count(c => c.Status == CandidateStatus.Offer),
            Hired: data.Count(c => c.Status == CandidateStatus.Hired),
            Rejected: data.Count(c => c.Status == CandidateStatus.Rejected));
    }

    public CandidateDto? GetCandidate(string id)
    {
        if (!TryParseGuid(id, out var guid))
        {
            return null;
        }

        var entity = _candidateReadRepository
            .GetByIdAsync(guid)
            .GetAwaiter()
            .GetResult();

        return entity is null ? null : MapToDto(entity);
    }

    public async Task<bool> UpdateCandidateStatusAsync(string id, UpdateCandidateStatusRequest request, CancellationToken cancellationToken = default)
    {
        if (!TryParseGuid(id, out var guid))
        {
            return false;
        }

        var entity = await _candidateReadRepository.GetByIdAsync(guid, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        if (!TryParseCandidateStatus(request.Status, out var next))
        {
            return false;
        }

        entity.MoveTo(next);
        _candidateRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> RejectCandidateAsync(string id, CancellationToken cancellationToken = default)
    {
        if (!TryParseGuid(id, out var guid))
        {
            return false;
        }

        var entity = await _candidateReadRepository.GetByIdAsync(guid, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        entity.Reject();
        _candidateRepository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static List<Candidate> ApplyCandidateSort(IReadOnlyList<Candidate> data, string? sort)
    {
        if (string.IsNullOrWhiteSpace(sort))
        {
            return data.OrderByDescending(c => c.AppliedAt).ToList();
        }

        var parts = sort.Split(':', 2, StringSplitOptions.TrimEntries);
        var field = parts[0].ToLowerInvariant();
        var descending = parts.Length > 1
            && parts[1].Equals("desc", StringComparison.OrdinalIgnoreCase);

        return (field, descending) switch
        {
            ("fullname", false)  => data.OrderBy(c => c.FullName).ToList(),
            ("fullname", true)   => data.OrderByDescending(c => c.FullName).ToList(),
            ("appliedat", false) => data.OrderBy(c => c.AppliedAt).ToList(),
            ("status", false)    => data.OrderBy(c => c.Status).ThenByDescending(c => c.AppliedAt).ToList(),
            ("status", true)     => data.OrderByDescending(c => c.Status).ThenByDescending(c => c.AppliedAt).ToList(),
            (_, true)            => data.OrderByDescending(c => c.AppliedAt).ToList(),
            _                    => data.OrderBy(c => c.AppliedAt).ToList(),
        };
    }

    // ── Mapping helpers ──────────────────────────────────────────────

    private static CandidateDto MapToDto(Candidate c) => new(
        Id: c.Id.ToString(),
        RequisitionId: c.RequisitionId?.ToString(),
        FullName: c.FullName,
        Email: c.Email,
        Initials: c.Initials,
        Position: c.Position,
        Department: c.Department,
        Location: c.Location,
        Source: c.Source,
        Status: MapCandidateStatus(c.Status),
        AppliedAt: c.AppliedAt.ToString("O"));

    private static string MapCandidateStatus(CandidateStatus status) => status switch
    {
        CandidateStatus.New => "new",
        CandidateStatus.Screening => "screening",
        CandidateStatus.Interview => "interview",
        CandidateStatus.Offer => "offer",
        CandidateStatus.Hired => "hired",
        CandidateStatus.Rejected => "rejected",
        _ => "new",
    };

    private static bool TryParseCandidateStatus(string? value, out CandidateStatus status)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            status = CandidateStatus.New;
            return false;
        }

        var normalized = value.Trim().ToLowerInvariant();
        switch (normalized)
        {
            case "new": status = CandidateStatus.New; return true;
            case "screening": status = CandidateStatus.Screening; return true;
            case "interview": status = CandidateStatus.Interview; return true;
            case "offer": status = CandidateStatus.Offer; return true;
            case "hired": status = CandidateStatus.Hired; return true;
            case "rejected": status = CandidateStatus.Rejected; return true;
            default:
                status = Enum.TryParse<CandidateStatus>(normalized, true, out var parsed)
                    ? parsed
                    : CandidateStatus.New;
                return Enum.IsDefined(typeof(CandidateStatus), status);
        }
    }

    private static RequisitionDto MapToDto(Requisition r) => new(
        Id: r.Id.ToString(),
        Title: r.Title,
        Department: r.Department,
        Location: r.Location,
        Priority: MapPriority(r.Priority),
        Status: MapStatus(r.Status),
        DaysOpen: r.DaysOpen,
        HiredCount: r.HiredCount,
        TargetCount: r.TargetCount,
        CreatedAt: r.CreatedAt.ToString("O"));

    private static string MapStatus(HiringPipelineStatus status) => status switch
    {
        HiringPipelineStatus.NeedsApproval => "needs_approval",
        HiringPipelineStatus.Open => "open",
        HiringPipelineStatus.InReview => "in_review",
        HiringPipelineStatus.Offered => "offered",
        HiringPipelineStatus.Hired => "hired",
        _ => "open",
    };

    private static string MapPriority(HiringPipelinePriority priority) => priority switch
    {
        HiringPipelinePriority.Low => "low",
        HiringPipelinePriority.Medium => "medium",
        HiringPipelinePriority.High => "high",
        _ => "medium",
    };

    private static HiringPipelineStatus ParseStatus(string status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return HiringPipelineStatus.Open;
        }

        var normalized = status.Trim().ToLowerInvariant().Replace("-", "_");
        return normalized switch
        {
            "needs_approval" or "needsapproval" or "approval" => HiringPipelineStatus.NeedsApproval,
            "open" => HiringPipelineStatus.Open,
            "in_review" or "inreview" or "review" => HiringPipelineStatus.InReview,
            "offered" or "offer" => HiringPipelineStatus.Offered,
            "hired" => HiringPipelineStatus.Hired,
            _ => Enum.TryParse<HiringPipelineStatus>(normalized, true, out var parsed)
                ? parsed
                : HiringPipelineStatus.Open,
        };
    }

    private static bool TryParsePriority(string value, out HiringPipelinePriority priority)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            priority = HiringPipelinePriority.Medium;
            return false;
        }

        var normalized = value.Trim().ToLowerInvariant();
        priority = normalized switch
        {
            "low" => HiringPipelinePriority.Low,
            "medium" or "med" => HiringPipelinePriority.Medium,
            "high" => HiringPipelinePriority.High,
            _ => Enum.TryParse<HiringPipelinePriority>(normalized, true, out var parsed)
                ? parsed
                : HiringPipelinePriority.Medium,
        };
        return true;
    }

    private static HiringPipelinePriority ParsePriority(string value)
    {
        TryParsePriority(value, out var priority);
        return priority;
    }

    private static bool TryParseGuid(string value, out Guid guid)
        => Guid.TryParse(value, out guid);

    private static DateTime ParseDate(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return DateTime.UtcNow;
        }

        return DateTime.TryParse(value, null, System.Globalization.DateTimeStyles.AssumeUniversal | System.Globalization.DateTimeStyles.AdjustToUniversal, out var parsed)
            ? parsed
            : DateTime.UtcNow;
    }
}
