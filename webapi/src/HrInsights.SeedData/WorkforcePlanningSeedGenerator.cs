using HrInsights.Domain.Entities;

namespace HrInsights.SeedData;

public sealed class WorkforcePlanningSeedGenerator
{
    public IReadOnlyList<WorkforcePlan> CreatePlans()
        =>
        [
            WorkforcePlan.Create(
                id: "wp_2026_q3",
                name: "Q3 2026 Workforce Plan",
                status: "active",
                planningPeriodStart: new DateOnly(2026, 7, 1),
                planningPeriodEnd: new DateOnly(2026, 9, 30),
                ownerId: "u_104",
                currency: "USD",
                latestSnapshotAt: new DateTimeOffset(2026, 6, 18, 13, 0, 0, TimeSpan.Zero)),
        ];

    public IReadOnlyList<WorkforceScenario> CreateScenarios()
        =>
        [
            WorkforceScenario.Create("scen_base", "wp_2026_q3", "Baseline Plan", "baseline", 425, 48, 0.12, 1845000m, "high"),
            WorkforceScenario.Create("scen_growth", "wp_2026_q3", "Growth Plan", "growth", 452, 67, 0.10, 2037000m, "medium"),
            WorkforceScenario.Create("scen_constrained", "wp_2026_q3", "Constrained Plan", "constrained", 401, 31, 0.14, 1729000m, "low"),
        ];

    public IReadOnlyList<WorkforceLineItem> CreateLineItems()
        =>
        [
            WorkforceLineItem.Create("li_eng_01", "scen_base", "Engineering", "EMEA", "Software Engineering", 112, 124, 8, "CC-410"),
            WorkforceLineItem.Create("li_eng_02", "scen_base", "Engineering", "NA", "Product Engineering", 74, 80, 4, "CC-411"),
            WorkforceLineItem.Create("li_sales_01", "scen_base", "Sales", "EMEA", "Account Executive", 38, 42, 3, "CC-520"),
            WorkforceLineItem.Create("li_hr_01", "scen_base", "HR", "APAC", "People Operations", 16, 17, 1, "CC-120"),
            WorkforceLineItem.Create("li_fin_01", "scen_base", "Finance", "NA", "FP&A", 22, 23, 0, "CC-610"),
            WorkforceLineItem.Create("li_eng_01_g", "scen_growth", "Engineering", "EMEA", "Software Engineering", 112, 132, 12, "CC-410"),
            WorkforceLineItem.Create("li_eng_02_g", "scen_growth", "Engineering", "NA", "Product Engineering", 74, 87, 7, "CC-411"),
            WorkforceLineItem.Create("li_sales_01_g", "scen_growth", "Sales", "EMEA", "Account Executive", 38, 48, 9, "CC-520"),
            WorkforceLineItem.Create("li_hr_01_g", "scen_growth", "HR", "APAC", "People Operations", 16, 18, 1, "CC-120"),
            WorkforceLineItem.Create("li_fin_01_g", "scen_growth", "Finance", "NA", "FP&A", 22, 25, 2, "CC-610"),
            WorkforceLineItem.Create("li_eng_01_c", "scen_constrained", "Engineering", "EMEA", "Software Engineering", 112, 118, 4, "CC-410"),
            WorkforceLineItem.Create("li_eng_02_c", "scen_constrained", "Engineering", "NA", "Product Engineering", 74, 77, 2, "CC-411"),
            WorkforceLineItem.Create("li_sales_01_c", "scen_constrained", "Sales", "EMEA", "Account Executive", 38, 39, 1, "CC-520"),
            WorkforceLineItem.Create("li_hr_01_c", "scen_constrained", "HR", "APAC", "People Operations", 16, 16, 0, "CC-120"),
            WorkforceLineItem.Create("li_fin_01_c", "scen_constrained", "Finance", "NA", "FP&A", 22, 23, 0, "CC-610"),
        ];

    public IReadOnlyList<ScenarioAssumption> CreateAssumptions()
        =>
        [
            ScenarioAssumption.Create("asmp_001", "scen_base", "attrition", 0.12, "percent", "Backfills occur within 45 days"),
            ScenarioAssumption.Create("asmp_002", "scen_base", "salary growth", 0.04, "percent", "Annual merit increase assumption"),
            ScenarioAssumption.Create("asmp_003", "scen_growth", "attrition", 0.10, "percent", "Lower attrition in high-growth teams"),
            ScenarioAssumption.Create("asmp_004", "scen_growth", "recruiting cycle", 2.5, "months", "Average time to fill roles"),
            ScenarioAssumption.Create("asmp_005", "scen_constrained", "attrition", 0.14, "percent", "Hiring freeze risk included"),
        ];

    public IReadOnlyList<PlanningSnapshot> CreateSnapshots()
        =>
        [
            PlanningSnapshot.Create("snap_2026_06_18", "wp_2026_q3", new DateTimeOffset(2026, 6, 18, 13, 0, 0, TimeSpan.Zero), "u_209", "hris"),
            PlanningSnapshot.Create("snap_2026_06_15", "wp_2026_q3", new DateTimeOffset(2026, 6, 15, 17, 30, 0, TimeSpan.Zero), "u_104", "planning-sheet"),
        ];
}
