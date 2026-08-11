using HrInsights.Contracts.WorkforcePlanning;

namespace HrInsights.SeedData;

public sealed class WorkforcePlanningBogusGenerator
{
    private static readonly IReadOnlyList<WorkforcePlanDto> _plans =
    [
        new("wp_2026_q3", "Q3 2026 Workforce Plan", "active", "2026-07-01", "2026-09-30", "u_104", "USD", "2026-06-18T09:00:00-04:00")
    ];

    private static readonly IReadOnlyList<WorkforceScenarioDto> _scenarios =
    [
        new("scen_base", "wp_2026_q3", "Baseline Plan", "baseline", 425, 48, 0.12, 1845000, "high"),
        new("scen_growth", "wp_2026_q3", "Growth Plan", "growth", 452, 67, 0.1, 2037000, "medium"),
        new("scen_constrained", "wp_2026_q3", "Constrained Plan", "constrained", 401, 31, 0.14, 1729000, "low")
    ];

    private static readonly IReadOnlyList<WorkforceLineItemDto> _lineItems =
    [
        // baseline
        new("li_eng_01", "scen_base", "Engineering", "EMEA", "Software Engineering", 112, 124, 8, "CC-410"),
        new("li_eng_02", "scen_base", "Engineering", "NA", "Product Engineering", 74, 80, 4, "CC-411"),
        new("li_sales_01", "scen_base", "Sales", "EMEA", "Account Executive", 38, 42, 3, "CC-520"),
        new("li_hr_01", "scen_base", "HR", "APAC", "People Operations", 16, 17, 1, "CC-120"),
        new("li_fin_01", "scen_base", "Finance", "NA", "FP&A", 22, 23, 0, "CC-610"),
        // growth
        new("li_eng_01_g", "scen_growth", "Engineering", "EMEA", "Software Engineering", 112, 132, 12, "CC-410"),
        new("li_eng_02_g", "scen_growth", "Engineering", "NA", "Product Engineering", 74, 87, 7, "CC-411"),
        new("li_sales_01_g", "scen_growth", "Sales", "EMEA", "Account Executive", 38, 48, 9, "CC-520"),
        new("li_hr_01_g", "scen_growth", "HR", "APAC", "People Operations", 16, 18, 1, "CC-120"),
        new("li_fin_01_g", "scen_growth", "Finance", "NA", "FP&A", 22, 25, 2, "CC-610"),
        // constrained
        new("li_eng_01_c", "scen_constrained", "Engineering", "EMEA", "Software Engineering", 112, 118, 4, "CC-410"),
        new("li_eng_02_c", "scen_constrained", "Engineering", "NA", "Product Engineering", 74, 77, 2, "CC-411"),
        new("li_sales_01_c", "scen_constrained", "Sales", "EMEA", "Account Executive", 38, 39, 1, "CC-520"),
        new("li_hr_01_c", "scen_constrained", "HR", "APAC", "People Operations", 16, 16, 0, "CC-120"),
        new("li_fin_01_c", "scen_constrained", "Finance", "NA", "FP&A", 22, 23, 0, "CC-610")
    ];

    private static readonly IReadOnlyList<ScenarioAssumptionDto> _assumptions =
    [
        new("asmp_001", "scen_base", "attrition", 0.12, "percent", "Backfills occur within 45 days"),
        new("asmp_002", "scen_base", "salary growth", 0.04, "percent", "Annual merit increase assumption"),
        new("asmp_003", "scen_growth", "attrition", 0.1, "percent", "Lower attrition in high-growth teams"),
        new("asmp_004", "scen_growth", "recruiting cycle", 2.5, "months", "Average time to fill roles"),
        new("asmp_005", "scen_constrained", "attrition", 0.14, "percent", "Hiring freeze risk included")
    ];

    private static readonly IReadOnlyList<PlanningSnapshotDto> _snapshots =
    [
        new("snap_2026_06_18", "wp_2026_q3", "2026-06-18T09:00:00-04:00", "u_209", "hris"),
        new("snap_2026_06_15", "wp_2026_q3", "2026-06-15T18:30:00+01:00", "u_104", "planning-sheet")
    ];

    public IReadOnlyList<WorkforcePlanDto> GetPlans() => _plans;

    public IReadOnlyList<WorkforceScenarioDto> GetScenarios(string planId)
        => _scenarios.Where(s => s.PlanId == planId).ToList();

    public IReadOnlyList<WorkforceLineItemDto> GetLineItems(string? scenarioId)
    {
        if (string.IsNullOrWhiteSpace(scenarioId))
            return _lineItems;
        return _lineItems.Where(li => li.ScenarioId == scenarioId).ToList();
    }

    public IReadOnlyList<ScenarioAssumptionDto> GetAssumptions(string scenarioId)
        => _assumptions.Where(a => a.ScenarioId == scenarioId).ToList();

    public IReadOnlyList<PlanningSnapshotDto> GetSnapshots(string planId)
        => _snapshots.Where(s => s.PlanId == planId).ToList();
}
