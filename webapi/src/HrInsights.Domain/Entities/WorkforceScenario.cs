using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

public sealed class WorkforceScenario : AuditableEntity<string>
{
    private WorkforceScenario()
        : base(string.Empty)
    {
        PlanId = string.Empty;
        Name = string.Empty;
        Type = string.Empty;
        Confidence = string.Empty;
    }

    private WorkforceScenario(
        string id,
        string planId,
        string name,
        string type,
        int headcountTarget,
        int? hiringTarget,
        double? attritionRate,
        decimal budgetImpact,
        string? confidence)
        : base(id)
    {
        PlanId = planId;
        Name = name;
        Type = type;
        HeadcountTarget = headcountTarget;
        HiringTarget = hiringTarget;
        AttritionRate = attritionRate;
        BudgetImpact = budgetImpact;
        Confidence = confidence ?? string.Empty;
    }

    public string PlanId { get; private set; }
    public string Name { get; private set; }
    public string Type { get; private set; }
    public int HeadcountTarget { get; private set; }
    public int? HiringTarget { get; private set; }
    public double? AttritionRate { get; private set; }
    public decimal BudgetImpact { get; private set; }
    public string Confidence { get; private set; }

    public static WorkforceScenario Create(
        string id,
        string planId,
        string name,
        string type,
        int headcountTarget,
        int? hiringTarget,
        double? attritionRate,
        decimal budgetImpact,
        string? confidence)
        => new(id, planId, name, type, headcountTarget, hiringTarget, attritionRate, budgetImpact, confidence);
}
