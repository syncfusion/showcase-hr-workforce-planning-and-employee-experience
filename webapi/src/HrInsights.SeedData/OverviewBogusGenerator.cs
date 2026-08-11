using HrInsights.Contracts.Dashboard;

namespace HrInsights.SeedData;

public sealed class OverviewBogusGenerator
{
    private static readonly ActionLabelDto[] _aiActions =
    [
        new ActionLabelDto("a1", "Schedule 1:1"),
        new ActionLabelDto("a2", "View Full Profile"),
        new ActionLabelDto("a3", "Assign Mentor"),
        new ActionLabelDto("a4", "Update Risk Status"),
    ];

    public OverviewResponse Generate()
    {
        var kpi = new KpiDto(
            Headcount: 847,
            HeadcountChange: 12,
            OpenRoles: 34,
            OpenRolesChange: -5,
            EngagementScore: 78,
            EngagementChange: 3);

        var kpiCards = new KpiCardDto[]
        {
            new KpiCardDto(
                Title: "Total Headcount",
                Value: "847",
                Change: 12,
                TrendData: [
                    new KpiTrendPointDto(1, 805),
                    new KpiTrendPointDto(2, 812),
                    new KpiTrendPointDto(3, 818),
                    new KpiTrendPointDto(4, 825),
                    new KpiTrendPointDto(5, 832),
                    new KpiTrendPointDto(6, 847),
                ],
                Context: "Across 12 departments",
                ShowProgress: null,
                ProgressValue: null,
                Target: null,
                Color: "#059669"),

            new KpiCardDto(
                Title: "Open Requisitions",
                Value: "34",
                Change: -5,
                TrendData: [
                    new KpiTrendPointDto(1, 42),
                    new KpiTrendPointDto(2, 40),
                    new KpiTrendPointDto(3, 38),
                    new KpiTrendPointDto(4, 36),
                    new KpiTrendPointDto(5, 35),
                    new KpiTrendPointDto(6, 34),
                ],
                Context: "6 critical roles · Avg 18 days open",
                ShowProgress: null,
                ProgressValue: null,
                Target: null,
                Color: "#d97706"),

            new KpiCardDto(
                Title: "Engagement Score",
                Value: "78%",
                Change: 3,
                TrendData: [
                    new KpiTrendPointDto(1, 72),
                    new KpiTrendPointDto(2, 74),
                    new KpiTrendPointDto(3, 73),
                    new KpiTrendPointDto(4, 75),
                    new KpiTrendPointDto(5, 76),
                    new KpiTrendPointDto(6, 78),
                ],
                Context: "Target: 85%",
                ShowProgress: true,
                ProgressValue: 78,
                Target: 85,
                Color: "#3B8CDE"),

            new KpiCardDto(
                Title: "Retention Risk",
                Value: "23",
                Change: 5,
                TrendData: [
                    new KpiTrendPointDto(1, 14),
                    new KpiTrendPointDto(2, 16),
                    new KpiTrendPointDto(3, 18),
                    new KpiTrendPointDto(4, 19),
                    new KpiTrendPointDto(5, 21),
                    new KpiTrendPointDto(6, 23),
                ],
                Context: "4 high-risk cohorts",
                ShowProgress: null,
                ProgressValue: null,
                Target: null,
                Color: "#dc2626"),
        };

        var requisitions = new ActiveRequisitionDto[]
        {
            new("ar-1", "Senior Frontend Developer", "Engineering", "Critical", 8, "Interview", "18 days"),
            new("ar-2", "Product Manager",          "Product",     "High",   12, "Final Round", "24 days"),
            new("ar-3", "DevOps Engineer",          "Engineering", "High",    4, "Offer",       "12 days"),
            new("ar-4", "UX Designer",              "Product",     "Medium",  6, "Screening",  "8 days"),
            new("ar-5", "Data Analyst",             "Analytics",   "Medium", 15, "Filled",     "35 days"),
        };

        var timeline = new ActivityTimelineEventDto[]
        {
            new("tl-1", "Added to Watch List — Engagement below threshold", "Survey Response — Score: 38/100", "2h ago",     "flagged"),
            new("tl-2", "1:1 Completed — With manager J.Williams",         "Scheduled Check-in — Follow-up on action items", "1d ago", "completed"),
            new("tl-3", "Q2 Performance Review Submitted",                 "Score: Meets Expectations", "3d ago",     "submitted"),
            new("tl-4", "Team Transfer Request — Product to Engineering",  "Status: Pending Approval", "5d ago",       "pending"),
        };

        var aiInsight = new AiInsightDto(
            EmployeeId:    "emp-sarah-lin",
            EngagementDrop: 15,
            Quarter:       "Q4",
            Notes:         "Recent 1:1 notes indicate workaround concerns.\nConsider redistributing 2 projects or adjusting OKRs.",
            Actions:       _aiActions);

        var actionPlans = new ActionPlanDto[]
        {
            new("ap-1", "Customer Success Retention",
                "4 employees with engagement < 40%",
                "HIGH RISK COHORT", "danger",   "Urgent",      60),

            new("ap-2", "Engineering Q3 Coverage",
                "Resolve July overlap conflicts",
                "LEAVE COVERAGE",   "warning", "In Progress", 35),

            new("ap-3", "Q3 New Hire Ramp",
                "15 new hires across 6 departments",
                "ONBOARDING",       "success", "On Track",    80),
        };

        return new OverviewResponse(kpi, kpiCards, requisitions, timeline, aiInsight, actionPlans);
    }
}