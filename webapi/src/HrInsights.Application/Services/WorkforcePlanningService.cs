using HrInsights.Contracts.WorkforcePlanning;
using HrInsights.Domain.Entities;
using HrInsights.Infrastructure.Abstractions.Repositories;

namespace HrInsights.Application.Services;

public interface IWorkforcePlanningService
{
    IReadOnlyList<WorkforcePlanDto> GetWorkforcePlans();
    IReadOnlyList<WorkforceScenarioDto> GetScenarios(string planId);
    IReadOnlyList<WorkforceLineItemDto> GetLineItems(string? scenarioId);
    IReadOnlyList<ScenarioAssumptionDto> GetAssumptions(string scenarioId);
    IReadOnlyList<PlanningSnapshotDto> GetSnapshots(string planId);
}

public sealed class WorkforcePlanningService : IWorkforcePlanningService
{
    private readonly IReadRepository<WorkforcePlan, string> _planRepository;
    private readonly IReadRepository<WorkforceScenario, string> _scenarioRepository;
    private readonly IReadRepository<WorkforceLineItem, string> _lineItemRepository;
    private readonly IReadRepository<ScenarioAssumption, string> _assumptionRepository;
    private readonly IReadRepository<PlanningSnapshot, string> _snapshotRepository;

    public WorkforcePlanningService(
        IReadRepository<WorkforcePlan, string> planRepository,
        IReadRepository<WorkforceScenario, string> scenarioRepository,
        IReadRepository<WorkforceLineItem, string> lineItemRepository,
        IReadRepository<ScenarioAssumption, string> assumptionRepository,
        IReadRepository<PlanningSnapshot, string> snapshotRepository)
    {
        _planRepository = planRepository;
        _scenarioRepository = scenarioRepository;
        _lineItemRepository = lineItemRepository;
        _assumptionRepository = assumptionRepository;
        _snapshotRepository = snapshotRepository;
    }

    public IReadOnlyList<WorkforcePlanDto> GetWorkforcePlans()
    {
        var plans = _planRepository.ListAsync().GetAwaiter().GetResult();
        return plans.Select(MapPlan).ToList();
    }

    public IReadOnlyList<WorkforceScenarioDto> GetScenarios(string planId)
    {
        var scenarios = _scenarioRepository.ListAsync().GetAwaiter().GetResult();
        return scenarios.Where(x => x.PlanId == planId).Select(MapScenario).ToList();
    }

    public IReadOnlyList<WorkforceLineItemDto> GetLineItems(string? scenarioId)
    {
        var lineItems = _lineItemRepository.ListAsync().GetAwaiter().GetResult();
        return lineItems.Where(x => scenarioId is null || x.ScenarioId == scenarioId).Select(MapLineItem).ToList();
    }

    public IReadOnlyList<ScenarioAssumptionDto> GetAssumptions(string scenarioId)
    {
        var assumptions = _assumptionRepository.ListAsync().GetAwaiter().GetResult();
        return assumptions.Where(x => x.ScenarioId == scenarioId).Select(MapAssumption).ToList();
    }

    public IReadOnlyList<PlanningSnapshotDto> GetSnapshots(string planId)
    {
        var snapshots = _snapshotRepository.ListAsync().GetAwaiter().GetResult();
        return snapshots.Where(x => x.PlanId == planId).Select(MapSnapshot).ToList();
    }

    private static WorkforcePlanDto MapPlan(WorkforcePlan plan)
        => new(
            Id: plan.Id,
            Name: plan.Name,
            Status: plan.Status,
            PlanningPeriodStart: plan.PlanningPeriodStart.ToString("yyyy-MM-dd"),
            PlanningPeriodEnd: plan.PlanningPeriodEnd.ToString("yyyy-MM-dd"),
            OwnerId: plan.OwnerId,
            Currency: plan.Currency,
            LatestSnapshotAt: plan.LatestSnapshotAt?.ToString("O"));

    private static WorkforceScenarioDto MapScenario(WorkforceScenario scenario)
        => new(
            Id: scenario.Id,
            PlanId: scenario.PlanId,
            Name: scenario.Name,
            Type: scenario.Type,
            HeadcountTarget: scenario.HeadcountTarget,
            HiringTarget: scenario.HiringTarget,
            AttritionRate: scenario.AttritionRate,
            BudgetImpact: scenario.BudgetImpact,
            Confidence: string.IsNullOrWhiteSpace(scenario.Confidence) ? null : scenario.Confidence);

    private static WorkforceLineItemDto MapLineItem(WorkforceLineItem lineItem)
        => new(
            Id: lineItem.Id,
            ScenarioId: lineItem.ScenarioId,
            Function: lineItem.Function,
            Region: lineItem.Region,
            RoleFamily: lineItem.RoleFamily,
            CurrentHeadcount: lineItem.CurrentHeadcount,
            PlannedHeadcount: lineItem.PlannedHeadcount,
            OpenRoles: lineItem.OpenRoles,
            CostCenter: string.IsNullOrWhiteSpace(lineItem.CostCenter) ? null : lineItem.CostCenter);

    private static ScenarioAssumptionDto MapAssumption(ScenarioAssumption assumption)
        => new(
            Id: assumption.Id,
            ScenarioId: assumption.ScenarioId,
            Category: assumption.Category,
            Value: assumption.Value,
            Unit: assumption.Unit,
            Note: string.IsNullOrWhiteSpace(assumption.Note) ? null : assumption.Note);

    private static PlanningSnapshotDto MapSnapshot(PlanningSnapshot snapshot)
        => new(
            Id: snapshot.Id,
            PlanId: snapshot.PlanId,
            CapturedAt: snapshot.CapturedAt.ToString("O"),
            CreatedBy: snapshot.CreatedBy,
            SourceSystem: snapshot.SourceSystem);
}
