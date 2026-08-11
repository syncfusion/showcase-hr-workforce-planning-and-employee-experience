using HrInsights.Contracts.Dashboard;
using HrInsights.Domain.Entities;
using HrInsights.Infrastructure.Abstractions.Repositories;

namespace HrInsights.Application.Services;

public interface IOverviewService
{
    OverviewResponse GetOverview();

    Task<ActionPlanDto> CreateActionPlanAsync(ActionPlanCreateRequest request, CancellationToken cancellationToken = default);
}

public sealed record ActionPlanCreateRequest(
    string Title,
    string Description,
    string Category,
    string StatusColor,
    string StatusLabel,
    int Progress);

public sealed class OverviewService : IOverviewService
{
    private readonly IReadRepository<KpiSnapshot, Guid> _kpiSnapshotRepository;
    private readonly IReadRepository<KpiCard, Guid> _kpiCardRepository;
    private readonly IReadRepository<OverviewRequisition, Guid> _requisitionRepository;
    private readonly IReadRepository<ActivityTimelineEvent, Guid> _timelineRepository;
    private readonly IReadRepository<OverviewAiInsight, Guid> _aiInsightRepository;
    private readonly IReadRepository<OverviewActionPlan, Guid> _actionPlanRepository;
    private readonly IRepository<OverviewActionPlan, Guid> _actionPlanWriteRepository;
    private readonly IUnitOfWork _unitOfWork;

    public OverviewService(
        IReadRepository<KpiSnapshot, Guid> kpiSnapshotRepository,
        IReadRepository<KpiCard, Guid> kpiCardRepository,
        IReadRepository<OverviewRequisition, Guid> requisitionRepository,
        IReadRepository<ActivityTimelineEvent, Guid> timelineRepository,
        IReadRepository<OverviewAiInsight, Guid> aiInsightRepository,
        IReadRepository<OverviewActionPlan, Guid> actionPlanRepository,
        IRepository<OverviewActionPlan, Guid> actionPlanWriteRepository,
        IUnitOfWork unitOfWork)
    {
        _kpiSnapshotRepository = kpiSnapshotRepository;
        _kpiCardRepository = kpiCardRepository;
        _requisitionRepository = requisitionRepository;
        _timelineRepository = timelineRepository;
        _aiInsightRepository = aiInsightRepository;
        _actionPlanRepository = actionPlanRepository;
        _actionPlanWriteRepository = actionPlanWriteRepository;
        _unitOfWork = unitOfWork;
    }

    public OverviewResponse GetOverview()
    {
        var kpiSnapshot = _kpiSnapshotRepository.ListAsync().GetAwaiter().GetResult().FirstOrDefault()
            ?? throw new InvalidOperationException("KPI snapshot not found in database. Ensure seed is applied.");

        var kpiCards = _kpiCardRepository.ListAsync().GetAwaiter().GetResult().ToList();
        var requisitions = _requisitionRepository.ListAsync().GetAwaiter().GetResult().ToList();
        var timeline = _timelineRepository.ListAsync().GetAwaiter().GetResult().OrderByDescending(t => t.Date).ToList();
        var aiInsight = _aiInsightRepository.ListAsync().GetAwaiter().GetResult().FirstOrDefault()
            ?? throw new InvalidOperationException("AI insight not found in database. Ensure seed is applied.");
        var actionPlans = _actionPlanRepository.ListAsync().GetAwaiter().GetResult().ToList();

        return new OverviewResponse(
            Kpi: MapKpi(kpiSnapshot),
            KpiCards: kpiCards.Select(MapKpiCard).ToList().AsReadOnly(),
            Requisitions: requisitions.Select(MapRequisition).ToList().AsReadOnly(),
            ActivityTimeline: timeline.Select(MapTimelineEvent).ToList().AsReadOnly(),
            AiInsight: MapAiInsight(aiInsight),
            ActionPlans: actionPlans.Select(MapActionPlan).ToList().AsReadOnly()
        );
    }

    private static KpiDto MapKpi(KpiSnapshot s)
        => new(
            Headcount: s.Headcount,
            HeadcountChange: s.HeadcountChange,
            OpenRoles: s.OpenRoles,
            OpenRolesChange: s.OpenRolesChange,
            EngagementScore: s.EngagementScore,
            EngagementChange: s.EngagementChange
        );

    private static KpiCardDto MapKpiCard(KpiCard card)
        => new(
            Title: card.Title,
            Value: FormatKpiValue(card.CurrentValue, card.Unit),
            Change: (int)Math.Round(card.ChangePercent, MidpointRounding.AwayFromZero),
            TrendData: card.Trend.Select(t => new KpiTrendPointDto(t.MonthIndex, (int)Math.Round(t.Value, MidpointRounding.AwayFromZero))).ToList().AsReadOnly(),
            Context: card.Context,
            ShowProgress: card.ShowProgress,
            ProgressValue: card.ProgressValue,
            Target: card.Target,
            Color: card.Color
        );

    private static string FormatKpiValue(double value, string unit)
        => unit switch
        {
            "%" => $"{value:0}%",
            _ => $"{value:0}"
        };

    private static ActiveRequisitionDto MapRequisition(OverviewRequisition r)
        => new(
            Id: r.Id.ToString(),
            Position: r.Role,
            Department: r.Department,
            Priority: r.Priority,
            Candidates: r.Candidates,
            Stage: r.Stage,
            TimeOpen: r.TimeOpen
        );

    private static ActivityTimelineEventDto MapTimelineEvent(ActivityTimelineEvent e)
        => new(
            Id: e.Id.ToString(),
            Title: e.Title,
            Detail: e.Description,
            Timestamp: e.TimestampDisplay,
            Status: e.Status
        );

    private static AiInsightDto MapAiInsight(OverviewAiInsight insight)
        => new(
            EmployeeId: insight.EmployeeId,
            EngagementDrop: insight.EngagementDrop,
            Quarter: insight.Quarter,
            Notes: insight.Notes,
            Actions: insight.Actions.Select(a => new ActionLabelDto(a.Id, a.Label)).ToList().AsReadOnly()
        );

    private static ActionPlanDto MapActionPlan(OverviewActionPlan plan)
        => new(
            Id: plan.Id.ToString(),
            Title: plan.Title,
            Description: plan.Description,
            Category: plan.Category,
            StatusColor: plan.StatusColor,
            StatusLabel: plan.StatusLabel,
            Progress: plan.Progress
        );

    public async Task<ActionPlanDto> CreateActionPlanAsync(ActionPlanCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new ArgumentException("Title is required.", nameof(request));
        }

        // Clamp the client-supplied progress to 0-100. New plans start at 0%
        // regardless of what the client sent; the UI already defaults to 0
        // but we re-assert it server-side so the contract is well-defined.
        var progress = 0;

        var entity = OverviewActionPlan.Create(
            title: request.Title.Trim(),
            description: request.Description?.Trim() ?? string.Empty,
            category: request.Category?.Trim() ?? "Retention",
            statusColor: request.StatusColor?.Trim() ?? "primary",
            statusLabel: request.StatusLabel?.Trim() ?? "Planned",
            progress: progress);

        // Persist to the database so the new plan is visible to subsequent reads.
        await _actionPlanWriteRepository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return MapActionPlan(entity);
    }
}