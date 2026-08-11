namespace HrInsights.Contracts.Dashboard;

/// <summary>
/// KPI trend point for sparkline charts inside KPI cards.
/// </summary>
public sealed record KpiTrendPointDto(int X, int Yval);

/// <summary>
/// Enhanced KPI card data with trend sparklines for dashboard header cards.
/// </summary>
public sealed record KpiCardDto(
    string Title,
    string Value,
    int Change,
    IReadOnlyList<KpiTrendPointDto> TrendData,
    string Context,
    bool? ShowProgress,
    int? ProgressValue,
    int? Target,
    string Color);

/// <summary>
/// KPI metrics for the Overview dashboard header cards.
/// </summary>
public sealed record KpiDto(
    int Headcount,
    int HeadcountChange,
    int OpenRoles,
    int OpenRolesChange,
    int EngagementScore,
    int EngagementChange);

/// <summary>
/// Active requisition shown in the Overview requisitions grid.
/// </summary>
public sealed record ActiveRequisitionDto(
    string Id,
    string Position,
    string Department,
    string Priority,      // "Critical" | "High" | "Medium"
    int Candidates,
    string Stage,        // "Interview" | "Final Round" | "Offer" | "Screening" | "Filled"
    string TimeOpen);

/// <summary>
/// Activity timeline event shown in the sidebar detail panel.
/// </summary>
public sealed record ActivityTimelineEventDto(
    string Id,
    string Title,
    string Detail,
    string Timestamp,
    // Free-form status from the domain entity (e.g. "completed", "pending",
    // "submitted", "flagged"). The frontend uses it to color the timeline
    // dot — "completed" maps to the success/green palette, everything else
    // (including "pending" and "submitted") uses the brand color.
    string Status);

/// <summary>
/// AI-generated insight for a specific employee.
/// </summary>
public sealed record AiInsightDto(
    string EmployeeId,
    int EngagementDrop,
    string Quarter,
    string Notes,
    IReadOnlyList<ActionLabelDto> Actions);

public sealed record ActionLabelDto(string Id, string Label);

/// <summary>
/// Action plan shown in the Overview Action Plans section.
/// </summary>
public sealed record ActionPlanDto(
    string Id,
    string Title,
    string Description,
    string Category,
    string StatusColor,   // "primary" | "success" | "warning" | "danger"
    string StatusLabel,
    int Progress);

/// <summary>
/// Top-level response envelope for the Overview screen.
/// </summary>
public sealed record OverviewResponse(
    KpiDto Kpi,
    IReadOnlyList<KpiCardDto> KpiCards,
    IReadOnlyList<ActiveRequisitionDto> Requisitions,
    IReadOnlyList<ActivityTimelineEventDto> ActivityTimeline,
    AiInsightDto AiInsight,
    IReadOnlyList<ActionPlanDto> ActionPlans);