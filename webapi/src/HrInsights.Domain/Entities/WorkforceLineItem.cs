using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

public sealed class WorkforceLineItem : AuditableEntity<string>
{
    private WorkforceLineItem()
        : base(string.Empty)
    {
        ScenarioId = string.Empty;
        Function = string.Empty;
        Region = string.Empty;
        RoleFamily = string.Empty;
        CostCenter = string.Empty;
    }

    private WorkforceLineItem(
        string id,
        string scenarioId,
        string function,
        string region,
        string roleFamily,
        int currentHeadcount,
        int plannedHeadcount,
        int? openRoles,
        string? costCenter)
        : base(id)
    {
        ScenarioId = scenarioId;
        Function = function;
        Region = region;
        RoleFamily = roleFamily;
        CurrentHeadcount = currentHeadcount;
        PlannedHeadcount = plannedHeadcount;
        OpenRoles = openRoles;
        CostCenter = costCenter ?? string.Empty;
    }

    public string ScenarioId { get; private set; }
    public string Function { get; private set; }
    public string Region { get; private set; }
    public string RoleFamily { get; private set; }
    public int CurrentHeadcount { get; private set; }
    public int PlannedHeadcount { get; private set; }
    public int? OpenRoles { get; private set; }
    public string CostCenter { get; private set; }

    public static WorkforceLineItem Create(
        string id,
        string scenarioId,
        string function,
        string region,
        string roleFamily,
        int currentHeadcount,
        int plannedHeadcount,
        int? openRoles,
        string? costCenter)
        => new(id, scenarioId, function, region, roleFamily, currentHeadcount, plannedHeadcount, openRoles, costCenter);
}
