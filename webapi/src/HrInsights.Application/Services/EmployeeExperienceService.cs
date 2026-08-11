using HrInsights.Contracts.EmployeeExperience;
using HrInsights.Domain.Entities;
using HrInsights.Domain.Enums;
using HrInsights.Infrastructure.Abstractions.Repositories;

namespace HrInsights.Application.Services;

public interface IEmployeeExperienceService
{
    IReadOnlyList<SelfServiceRequestDto> GetSelfServiceRequests(string? employeeId);
    Task<SelfServiceRequestDto> CreateSelfServiceRequestAsync(CreateSelfServiceRequest request, CancellationToken cancellationToken = default);

    IReadOnlyList<PulseSurveyDto> GetPulseSurveys();
    IReadOnlyList<PulseResponseDto> GetPulseResponses(string pulseSurveyId);
    Task<PulseResponseDto> SubmitPulseResponseAsync(CreatePulseResponseRequest request, CancellationToken cancellationToken = default);

    IReadOnlyList<RecognitionDto> GetRecognitions();
    Task<RecognitionDto> CreateRecognitionAsync(CreateRecognitionRequest request, CancellationToken cancellationToken = default);

    IReadOnlyList<CareerDevelopmentPlanDto> GetCareerPlans(string? employeeId);
    Task<CareerDevelopmentPlanDto?> UpdateMilestoneAsync(string planId, string milestoneId, UpdateMilestoneRequest request, CancellationToken cancellationToken = default);

    IReadOnlyList<LearningRecommendationDto> GetLearningRecommendations(string? employeeId);
    Task<LearningRecommendationDto?> UpdateLearningStatusAsync(string id, UpdateLearningRequest request, CancellationToken cancellationToken = default);

    IReadOnlyList<IssueReportDto> GetIssueReports(string? reportedBy);
    Task<IssueReportDto> CreateIssueReportAsync(CreateIssueReportRequest request, CancellationToken cancellationToken = default);

    IReadOnlyList<DelayConcernDto> GetDelayConcerns(string? raisedBy);
    Task<DelayConcernDto> CreateDelayConcernAsync(CreateDelayConcernRequest request, CancellationToken cancellationToken = default);

    IReadOnlyList<KanbanItemDto> GetKanbanItems();
    Task<KanbanItemDto?> MoveKanbanItemAsync(string id, UpdateKanbanLaneRequest request, CancellationToken cancellationToken = default);

    IReadOnlyList<NotificationItemDto> GetNotifications(string userId);
    Task<bool> MarkNotificationReadAsync(string id, CancellationToken cancellationToken = default);
    Task MarkAllNotificationsReadAsync(string userId, CancellationToken cancellationToken = default);

    IReadOnlyList<ChatMessageDto> GetChatMessages(string threadId);
    Task<ChatMessageDto> SendChatMessageAsync(CreateChatMessageRequest request, CancellationToken cancellationToken = default);
}

/// <summary>
/// Employee Experience service. Reads and writes both go through
/// PostgreSQL via the repository abstractions. With a readonly DB user
/// every mutating call fails with a database permission error; with a
/// writable user the change is persisted and visible to subsequent reads.
/// </summary>
public sealed class EmployeeExperienceService : IEmployeeExperienceService
{
    // Showcase default user — used as the "current employee" when the caller
    // doesn't provide an explicit id and is not authenticated.
    public const string DefaultEmployeeId = "emp_4521";
    public const string DefaultEmployeeName = "Ava Thompson";

    private readonly IReadRepository<SelfServiceRequest, Guid> _selfServiceReadRepo;
    private readonly IRepository<SelfServiceRequest, Guid> _selfServiceRepo;
    private readonly IReadRepository<PulseSurvey, Guid> _pulseSurveyReadRepo;
    private readonly IRepository<PulseSurvey, Guid> _pulseSurveyRepo;
    private readonly IReadRepository<PulseResponse, Guid> _pulseResponseReadRepo;
    private readonly IRepository<PulseResponse, Guid> _pulseResponseRepo;
    private readonly IReadRepository<Recognition, Guid> _recognitionReadRepo;
    private readonly IRepository<Recognition, Guid> _recognitionRepo;
    private readonly IReadRepository<CareerDevelopmentPlan, Guid> _careerPlanReadRepo;
    private readonly IRepository<CareerDevelopmentPlan, Guid> _careerPlanRepo;
    private readonly IReadRepository<LearningRecommendation, Guid> _learningReadRepo;
    private readonly IRepository<LearningRecommendation, Guid> _learningRepo;
    private readonly IReadRepository<IssueReport, Guid> _issueReadRepo;
    private readonly IRepository<IssueReport, Guid> _issueRepo;
    private readonly IReadRepository<DelayConcern, Guid> _delayReadRepo;
    private readonly IRepository<DelayConcern, Guid> _delayRepo;
    private readonly IReadRepository<KanbanItem, Guid> _kanbanReadRepo;
    private readonly IRepository<KanbanItem, Guid> _kanbanRepo;
    private readonly IReadRepository<NotificationItem, Guid> _notificationReadRepo;
    private readonly IRepository<NotificationItem, Guid> _notificationRepo;
    private readonly IReadRepository<ChatMessage, Guid> _chatReadRepo;
    private readonly IRepository<ChatMessage, Guid> _chatRepo;
    private readonly IUnitOfWork _unitOfWork;

    public EmployeeExperienceService(
        IReadRepository<SelfServiceRequest, Guid> selfServiceReadRepo,
        IRepository<SelfServiceRequest, Guid> selfServiceRepo,
        IReadRepository<PulseSurvey, Guid> pulseSurveyReadRepo,
        IRepository<PulseSurvey, Guid> pulseSurveyRepo,
        IReadRepository<PulseResponse, Guid> pulseResponseReadRepo,
        IRepository<PulseResponse, Guid> pulseResponseRepo,
        IReadRepository<Recognition, Guid> recognitionReadRepo,
        IRepository<Recognition, Guid> recognitionRepo,
        IReadRepository<CareerDevelopmentPlan, Guid> careerPlanReadRepo,
        IRepository<CareerDevelopmentPlan, Guid> careerPlanRepo,
        IReadRepository<LearningRecommendation, Guid> learningReadRepo,
        IRepository<LearningRecommendation, Guid> learningRepo,
        IReadRepository<IssueReport, Guid> issueReadRepo,
        IRepository<IssueReport, Guid> issueRepo,
        IReadRepository<DelayConcern, Guid> delayReadRepo,
        IRepository<DelayConcern, Guid> delayRepo,
        IReadRepository<KanbanItem, Guid> kanbanReadRepo,
        IRepository<KanbanItem, Guid> kanbanRepo,
        IReadRepository<NotificationItem, Guid> notificationReadRepo,
        IRepository<NotificationItem, Guid> notificationRepo,
        IReadRepository<ChatMessage, Guid> chatReadRepo,
        IRepository<ChatMessage, Guid> chatRepo,
        IUnitOfWork unitOfWork)
    {
        _selfServiceReadRepo = selfServiceReadRepo;
        _selfServiceRepo = selfServiceRepo;
        _pulseSurveyReadRepo = pulseSurveyReadRepo;
        _pulseSurveyRepo = pulseSurveyRepo;
        _pulseResponseReadRepo = pulseResponseReadRepo;
        _pulseResponseRepo = pulseResponseRepo;
        _recognitionReadRepo = recognitionReadRepo;
        _recognitionRepo = recognitionRepo;
        _careerPlanReadRepo = careerPlanReadRepo;
        _careerPlanRepo = careerPlanRepo;
        _learningReadRepo = learningReadRepo;
        _learningRepo = learningRepo;
        _issueReadRepo = issueReadRepo;
        _issueRepo = issueRepo;
        _delayReadRepo = delayReadRepo;
        _delayRepo = delayRepo;
        _kanbanReadRepo = kanbanReadRepo;
        _kanbanRepo = kanbanRepo;
        _notificationReadRepo = notificationReadRepo;
        _notificationRepo = notificationRepo;
        _chatReadRepo = chatReadRepo;
        _chatRepo = chatRepo;
        _unitOfWork = unitOfWork;
    }

    // ── 1. Self-Service Requests ────────────────────────────────────
    public IReadOnlyList<SelfServiceRequestDto> GetSelfServiceRequests(string? employeeId)
    {
        var data = _selfServiceReadRepo.ListAsync().GetAwaiter().GetResult();
        if (!string.IsNullOrWhiteSpace(employeeId))
            data = data.Where(r => r.EmployeeId == employeeId).ToList();
        return data.Select(e => e.ToDto()).ToList();
    }

    public async Task<SelfServiceRequestDto> CreateSelfServiceRequestAsync(CreateSelfServiceRequest request, CancellationToken cancellationToken = default)
    {
        var entity = SelfServiceRequest.Create(
            employeeId: DefaultEmployeeId,
            employeeName: DefaultEmployeeName,
            type: request.Type,
            subject: request.Subject,
            details: request.Details,
            priority: EmployeeExperienceMappings.FromWirePriority(request.Priority),
            assignedTo: null,
            createdAtUtc: DateTime.UtcNow,
            attachments: Array.Empty<string>());

        await _selfServiceRepo.AddAsync(entity, cancellationToken);
        await AddKanbanItemAsync("self-service", entity.Id.ToString("D"), entity.Subject, KanbanPriority.Medium, new[] { entity.Type }, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return entity.ToDto();
    }

    // ── 2. Pulse Surveys ────────────────────────────────────────────
    public IReadOnlyList<PulseSurveyDto> GetPulseSurveys()
    {
        var data = _pulseSurveyReadRepo.ListAsync().GetAwaiter().GetResult();
        return data.Select(e => e.ToDto()).ToList();
    }

    public IReadOnlyList<PulseResponseDto> GetPulseResponses(string pulseSurveyId)
    {
        var surveyGuid = EmployeeExperienceMappings.ParseId(pulseSurveyId);
        var data = _pulseResponseReadRepo.ListAsync().GetAwaiter().GetResult();
        return data.Where(r => r.PulseSurveyId == surveyGuid).Select(e => e.ToDto()).ToList();
    }

    public async Task<PulseResponseDto> SubmitPulseResponseAsync(CreatePulseResponseRequest request, CancellationToken cancellationToken = default)
    {
        var surveyGuid = EmployeeExperienceMappings.ParseId(request.PulseSurveyId);
        var entity = PulseResponse.Create(
            pulseSurveyId: surveyGuid,
            employeeId: DefaultEmployeeId,
            department: "Engineering",
            sentiment: request.Sentiment,
            submittedAtUtc: DateTime.UtcNow,
            comment: request.Comment);

        await _pulseResponseRepo.AddAsync(entity, cancellationToken);

        // Bump aggregate counters on the parent survey so the next read
        // sees the new TotalResponses / ResponseRate value.
        var survey = await _pulseSurveyReadRepo.GetByIdAsync(surveyGuid, cancellationToken);
        if (survey is not null)
        {
            survey.RegisterResponse(request.Sentiment, DateTime.UtcNow);
            _pulseSurveyRepo.Update(survey);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return entity.ToDto();
    }

    // ── 3. Recognitions ─────────────────────────────────────────────
    public IReadOnlyList<RecognitionDto> GetRecognitions()
    {
        var data = _recognitionReadRepo.ListAsync().GetAwaiter().GetResult();
        return data.OrderByDescending(r => r.CreatedAt).Select(e => e.ToDto()).ToList();
    }

    public async Task<RecognitionDto> CreateRecognitionAsync(CreateRecognitionRequest request, CancellationToken cancellationToken = default)
    {
        var entity = Recognition.Create(
            fromEmployeeId: DefaultEmployeeId,
            fromName: DefaultEmployeeName,
            toEmployeeId: request.ToEmployeeId,
            toName: request.ToName,
            type: request.Type,
            message: request.Message,
            value: request.Value,
            createdAtUtc: DateTime.UtcNow,
            visibleTo: request.VisibleTo);

        await _recognitionRepo.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return entity.ToDto();
    }

    // ── 4. Career Plans ─────────────────────────────────────────────
    public IReadOnlyList<CareerDevelopmentPlanDto> GetCareerPlans(string? employeeId)
    {
        var data = _careerPlanReadRepo.ListAsync().GetAwaiter().GetResult();
        if (!string.IsNullOrWhiteSpace(employeeId))
            data = data.Where(p => p.EmployeeId == employeeId).ToList();
        return data.Select(e => e.ToDto()).ToList();
    }

    public async Task<CareerDevelopmentPlanDto?> UpdateMilestoneAsync(string planId, string milestoneId, UpdateMilestoneRequest request, CancellationToken cancellationToken = default)
    {
        var planGuid = EmployeeExperienceMappings.ParseId(planId);
        var milestoneGuid = EmployeeExperienceMappings.ParseId(milestoneId);

        var plan = await _careerPlanReadRepo.GetByIdAsync(planGuid, cancellationToken);
        if (plan is null) return null;

        var milestone = plan.Milestones.FirstOrDefault(m => m.Id == milestoneGuid);
        if (milestone is null) return null;

        milestone.SetStatus(EmployeeExperienceMappings.FromWireMilestoneStatus(request.Status));
        plan.RecalculateStatus(DateTime.UtcNow);
        _careerPlanRepo.Update(plan);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return plan.ToDto();
    }

    // ── 5. Learning Recommendations ─────────────────────────────────
    public IReadOnlyList<LearningRecommendationDto> GetLearningRecommendations(string? employeeId)
    {
        var data = _learningReadRepo.ListAsync().GetAwaiter().GetResult();
        if (!string.IsNullOrWhiteSpace(employeeId))
            data = data.Where(l => l.EmployeeId == employeeId).ToList();
        return data.Select(e => e.ToDto()).ToList();
    }

    public async Task<LearningRecommendationDto?> UpdateLearningStatusAsync(string id, UpdateLearningRequest request, CancellationToken cancellationToken = default)
    {
        var guid = EmployeeExperienceMappings.ParseId(id);
        var entity = await _learningReadRepo.GetByIdAsync(guid, cancellationToken);
        if (entity is null) return null;

        entity.SetStatus(EmployeeExperienceMappings.FromWireLearningStatus(request.Status));
        _learningRepo.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return entity.ToDto();
    }

    // ── 6. Issue Reports ────────────────────────────────────────────
    public IReadOnlyList<IssueReportDto> GetIssueReports(string? reportedBy)
    {
        var data = _issueReadRepo.ListAsync().GetAwaiter().GetResult();
        if (!string.IsNullOrWhiteSpace(reportedBy))
            data = data.Where(i => i.ReportedBy == reportedBy).ToList();
        return data.OrderByDescending(i => i.CreatedAt).Select(e => e.ToDto()).ToList();
    }

    public async Task<IssueReportDto> CreateIssueReportAsync(CreateIssueReportRequest request, CancellationToken cancellationToken = default)
    {
        var entity = IssueReport.Create(
            reportedBy: DefaultEmployeeId,
            reportedByName: DefaultEmployeeName,
            category: request.Category,
            subject: request.Subject,
            description: request.Description,
            url: request.Url,
            browser: request.Browser,
            priority: EmployeeExperienceMappings.FromWireIssuePriority(request.Priority),
            assignedTo: null,
            createdAtUtc: DateTime.UtcNow,
            attachments: Array.Empty<string>());

        await _issueRepo.AddAsync(entity, cancellationToken);
        await AddKanbanItemAsync("issue", entity.Id.ToString("D"), entity.Subject, KanbanPriority.Medium, new[] { entity.Category }, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return entity.ToDto();
    }

    // ── 7. Delay Concerns ──────────────────────────────────────────
    public IReadOnlyList<DelayConcernDto> GetDelayConcerns(string? raisedBy)
    {
        var data = _delayReadRepo.ListAsync().GetAwaiter().GetResult();
        if (!string.IsNullOrWhiteSpace(raisedBy))
            data = data.Where(d => d.RaisedBy == raisedBy).ToList();
        return data.OrderByDescending(d => d.CreatedAt).Select(e => e.ToDto()).ToList();
    }

    public async Task<DelayConcernDto> CreateDelayConcernAsync(CreateDelayConcernRequest request, CancellationToken cancellationToken = default)
    {
        var entity = DelayConcern.Create(
            raisedBy: DefaultEmployeeId,
            raisedByName: DefaultEmployeeName,
            relatedEntityType: request.RelatedEntityType,
            relatedEntityId: request.RelatedEntityId,
            subject: request.Subject,
            details: request.Details,
            daysWaiting: request.DaysWaiting,
            expectedSlackDays: request.ExpectedSlackDays,
            severity: EmployeeExperienceMappings.FromWireDelaySeverity(request.Severity),
            createdAtUtc: DateTime.UtcNow);

        await _delayRepo.AddAsync(entity, cancellationToken);
        await AddKanbanItemAsync("delay", entity.Id.ToString("D"), entity.Subject, KanbanPriority.Medium, new[] { "delay", entity.RelatedEntityType }, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return entity.ToDto();
    }

    // ── 8. Kanban ──────────────────────────────────────────────────
    public IReadOnlyList<KanbanItemDto> GetKanbanItems()
    {
        var data = _kanbanReadRepo.ListAsync().GetAwaiter().GetResult();
        return data.OrderBy(k => k.Lane).ThenBy(k => k.UpdatedAt).Select(e => e.ToDto()).ToList();
    }

    public async Task<KanbanItemDto?> MoveKanbanItemAsync(string id, UpdateKanbanLaneRequest request, CancellationToken cancellationToken = default)
    {
        var guid = EmployeeExperienceMappings.ParseId(id);
        var entity = await _kanbanReadRepo.GetByIdAsync(guid, cancellationToken);
        if (entity is null) return null;

        var nextLane = EmployeeExperienceMappings.FromWireLane(request.Lane);
        entity.SetLane(nextLane, DateTime.UtcNow);
        _kanbanRepo.Update(entity);

        // Sync the source entity's status with the new lane.
        await SyncSourceStatusAsync(entity.SourceType, entity.SourceId, nextLane, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return entity.ToDto();
    }

    private async Task AddKanbanItemAsync(string sourceType, string sourceId, string title, KanbanPriority priority, IReadOnlyList<string> tags, CancellationToken cancellationToken)
    {
        var entity = KanbanItem.Create(
            sourceType: sourceType,
            sourceId: sourceId,
            title: title,
            lane: KanbanLane.Backlog,
            assigneeId: null,
            priority: priority,
            dueDate: null,
            tags: tags,
            updatedAtUtc: DateTime.UtcNow);
        await _kanbanRepo.AddAsync(entity, cancellationToken);
    }

    private async Task SyncSourceStatusAsync(string sourceType, string sourceId, KanbanLane lane, CancellationToken cancellationToken)
    {
        // Map lane → corresponding source status, then update the source row
        // so the next read of that source reflects the kanban lane change.
        if (sourceType == "self-service")
        {
            var guid = EmployeeExperienceMappings.ParseId(sourceId);
            var source = await _selfServiceReadRepo.GetByIdAsync(guid, cancellationToken);
            if (source is null) return;

            var nextStatus = lane switch
            {
                KanbanLane.Backlog => SelfServiceRequestStatus.Submitted,
                KanbanLane.InProgress => SelfServiceRequestStatus.InProgress,
                KanbanLane.InReview => SelfServiceRequestStatus.InReview,
                KanbanLane.Done => SelfServiceRequestStatus.Resolved,
                _ => SelfServiceRequestStatus.Submitted,
            };
            source.SetStatus(nextStatus, DateTime.UtcNow);
            _selfServiceRepo.Update(source);
        }
        else if (sourceType == "issue")
        {
            var guid = EmployeeExperienceMappings.ParseId(sourceId);
            var source = await _issueReadRepo.GetByIdAsync(guid, cancellationToken);
            if (source is null) return;

            var nextStatus = lane switch
            {
                KanbanLane.Backlog => IssueReportStatus.Submitted,
                KanbanLane.InProgress => IssueReportStatus.InProgress,
                KanbanLane.InReview => IssueReportStatus.Acknowledged,
                KanbanLane.Done => IssueReportStatus.Resolved,
                _ => IssueReportStatus.Submitted,
            };
            source.SetStatus(nextStatus, DateTime.UtcNow);
            _issueRepo.Update(source);
        }
        else if (sourceType == "delay")
        {
            var guid = EmployeeExperienceMappings.ParseId(sourceId);
            var source = await _delayReadRepo.GetByIdAsync(guid, cancellationToken);
            if (source is null) return;

            var nextStatus = lane switch
            {
                KanbanLane.Backlog => DelayConcernStatus.Open,
                KanbanLane.InProgress => DelayConcernStatus.Open,
                KanbanLane.InReview => DelayConcernStatus.Acknowledged,
                KanbanLane.Done => DelayConcernStatus.Resolved,
                _ => DelayConcernStatus.Open,
            };
            source.SetStatus(nextStatus);
            _delayRepo.Update(source);
        }
    }

    // ── 9. Notifications ────────────────────────────────────────────
    public IReadOnlyList<NotificationItemDto> GetNotifications(string userId)
    {
        var data = _notificationReadRepo.ListAsync().GetAwaiter().GetResult();
        return data
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(e => e.ToDto())
            .ToList();
    }

    public async Task<bool> MarkNotificationReadAsync(string id, CancellationToken cancellationToken = default)
    {
        var guid = EmployeeExperienceMappings.ParseId(id);
        var entity = await _notificationReadRepo.GetByIdAsync(guid, cancellationToken);
        if (entity is null) return false;
        entity.MarkRead();
        _notificationRepo.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task MarkAllNotificationsReadAsync(string userId, CancellationToken cancellationToken = default)
    {
        var data = await _notificationReadRepo.ListAsync(cancellationToken: cancellationToken);
        var pending = data.Where(n => n.UserId == userId && !n.Read).ToList();
        if (pending.Count == 0) return;
        foreach (var n in pending)
        {
            n.MarkRead();
            _notificationRepo.Update(n);
        }
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    // ── 10. Chat Messages ──────────────────────────────────────────
    public IReadOnlyList<ChatMessageDto> GetChatMessages(string threadId)
    {
        var data = _chatReadRepo.ListAsync().GetAwaiter().GetResult();
        return data
            .Where(m => m.ThreadId == threadId)
            .OrderBy(m => m.SentAt)
            .Select(e => e.ToDto())
            .ToList();
    }

    public async Task<ChatMessageDto> SendChatMessageAsync(CreateChatMessageRequest request, CancellationToken cancellationToken = default)
    {
        var entity = ChatMessage.Create(
            threadId: request.ThreadId,
            fromId: DefaultEmployeeId,
            fromName: DefaultEmployeeName,
            toId: request.ToId,
            body: request.Body,
            sentAtUtc: DateTime.UtcNow,
            attachments: Array.Empty<string>());

        await _chatRepo.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return entity.ToDto();
    }
}
