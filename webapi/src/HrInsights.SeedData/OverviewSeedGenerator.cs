using HrInsights.Domain.Entities;

namespace HrInsights.SeedData;

/// <summary>
/// Generates hardcoded Overview seed data matching the original mock values.
/// </summary>
public sealed class OverviewSeedGenerator
{
    public KpiSnapshot CreateKpiSnapshot()
    {
        var snapshot = KpiSnapshot.Create(
            headcount: 847,
            openRoles: 34,
            attritionRate: null,
            engagementScore: 78);
        snapshot.HeadcountChange = 12;
        snapshot.OpenRolesChange = -5;
        snapshot.EngagementChange = 3;
        return snapshot;
    }

    public IReadOnlyList<KpiCard> CreateKpiCards()
    {
        var headcountCard = KpiCard.Create("Total Headcount", 847, "", 12);
        headcountCard.Context = "Across 12 departments";
        headcountCard.Color = "#059669";
        headcountCard.SetTrend([
            new KpiTrendPoint(1, 805),
            new KpiTrendPoint(2, 812),
            new KpiTrendPoint(3, 818),
            new KpiTrendPoint(4, 825),
            new KpiTrendPoint(5, 832),
            new KpiTrendPoint(6, 847),
        ]);

        var openRolesCard = KpiCard.Create("Open Requisitions", 34, "", -5);
        openRolesCard.Context = "6 critical roles · Avg 18 days open";
        openRolesCard.Color = "#d97706";
        openRolesCard.SetTrend([
            new KpiTrendPoint(1, 42),
            new KpiTrendPoint(2, 40),
            new KpiTrendPoint(3, 38),
            new KpiTrendPoint(4, 36),
            new KpiTrendPoint(5, 35),
            new KpiTrendPoint(6, 34),
        ]);

        var engagementCard = KpiCard.Create("Engagement Score", 78, "%", 3);
        engagementCard.Context = "Target: 85%";
        engagementCard.ShowProgress = true;
        engagementCard.ProgressValue = 78;
        engagementCard.Target = 85;
        engagementCard.Color = "#3B8CDE";
        engagementCard.SetTrend([
            new KpiTrendPoint(1, 72),
            new KpiTrendPoint(2, 74),
            new KpiTrendPoint(3, 73),
            new KpiTrendPoint(4, 75),
            new KpiTrendPoint(5, 76),
            new KpiTrendPoint(6, 78),
        ]);

        var retentionCard = KpiCard.Create("Retention Risk", 23, "", 5);
        retentionCard.Context = "4 high-risk cohorts";
        retentionCard.Color = "#dc2626";
        retentionCard.SetTrend([
            new KpiTrendPoint(1, 14),
            new KpiTrendPoint(2, 16),
            new KpiTrendPoint(3, 18),
            new KpiTrendPoint(4, 19),
            new KpiTrendPoint(5, 21),
            new KpiTrendPoint(6, 23),
        ]);

        return [headcountCard, openRolesCard, engagementCard, retentionCard];
    }

    public IReadOnlyList<OverviewRequisition> CreateRequisitions()
    {
        return
        [
            OverviewRequisition.Create(
                "Senior Frontend Developer", "Engineering",
                "Critical", 8,
                "Interview", "18 days"),
            OverviewRequisition.Create(
                "Product Manager", "Product",
                "High", 12,
                "Final Round", "24 days"),
            OverviewRequisition.Create(
                "DevOps Engineer", "Engineering",
                "High", 4,
                "Offer", "12 days"),
            OverviewRequisition.Create(
                "UX Designer", "Product",
                "Medium", 6,
                "Screening", "8 days"),
            OverviewRequisition.Create(
                "Data Analyst", "Analytics",
                "Medium", 15,
                "Filled", "35 days"),
        ];
    }

    public IReadOnlyList<ActivityTimelineEvent> CreateTimelineEvents()
    {
        return
        [
            ActivityTimelineEvent.Create(
                "Added to Watch List — Engagement below threshold",
                "Survey Response — Score: 38/100",
                "watch", "flagged",
                DateTime.UtcNow.AddHours(-2), "2h ago"),
            ActivityTimelineEvent.Create(
                "1:1 Completed — With manager J.Williams",
                "Scheduled Check-in — Follow-up on action items",
                "1:1", "completed",
                DateTime.UtcNow.AddDays(-1), "1d ago"),
            ActivityTimelineEvent.Create(
                "Q2 Performance Review Submitted",
                "Score: Meets Expectations",
                "review", "submitted",
                DateTime.UtcNow.AddDays(-3), "3d ago"),
            ActivityTimelineEvent.Create(
                "Team Transfer Request — Product to Engineering",
                "Status: Pending Approval",
                "transfer", "pending",
                DateTime.UtcNow.AddDays(-5), "5d ago"),
        ];
    }

    public OverviewAiInsight CreateAiInsight()
    {
        var insight = OverviewAiInsight.Create(
            employeeId: "emp-sarah-lin",
            engagementDrop: 15,
            quarter: "Q4",
            notes: "Recent 1:1 notes indicate workaround concerns.\nConsider redistributing 2 projects or adjusting OKRs.",
            summary: "Sarah L. has declined");
        insight.SetActions([
            new OverviewAiActionLabel("a1", "Schedule 1:1"),
            new OverviewAiActionLabel("a2", "View Full Profile"),
            new OverviewAiActionLabel("a3", "Assign Mentor"),
            new OverviewAiActionLabel("a4", "Update Risk Status"),
        ]);
        return insight;
    }

    public IReadOnlyList<OverviewActionPlan> CreateActionPlans()
    {
        var ap1 = OverviewActionPlan.Create("Customer Success Retention",
            "4 employees with engagement < 40%", "HIGH RISK COHORT", "danger", "Urgent", 60);
        ap1.SetActions([
            new OverviewActionItem("Run pulse survey", "priority", "danger", DateTime.UtcNow.AddDays(7)),
            new OverviewActionItem("1:1with at-risk employees", "pending", "primary", DateTime.UtcNow.AddDays(10)),
        ]);

        var ap2 = OverviewActionPlan.Create("Engineering Q3 Coverage",
            "Resolve July overlap conflicts", "LEAVE COVERAGE", "warning", "In Progress", 35);
        ap2.SetActions([
            new OverviewActionItem("Publish leave roster", "pending", "warning", DateTime.UtcNow.AddDays(4)),
        ]);

        var ap3 = OverviewActionPlan.Create("Q3 New Hire Ramp",
            "15 new hires across 6 departments", "ONBOARDING", "success", "On Track", 80);
        ap3.SetActions([
            new OverviewActionItem("Send onboarding kit", "completed", "success", DateTime.UtcNow.AddDays(-2)),
            new OverviewActionItem("Buddy assignments", "completed", "success", DateTime.UtcNow.AddDays(3)),
        ]);

        return [ap1, ap2, ap3];
    }
}
