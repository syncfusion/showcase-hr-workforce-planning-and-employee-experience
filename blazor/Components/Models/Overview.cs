using System.Text.Json.Serialization;

namespace BlazorWebApp.Components.Models;

public sealed record KpiTrendPoint(
    [property: JsonPropertyName("x")] int X,
    [property: JsonPropertyName("yval")] double Yval);

public sealed record KpiCardData(
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("value")] string Value,
    [property: JsonPropertyName("change")] double Change,
    [property: JsonPropertyName("trendData")] KpiTrendPoint[] TrendData,
    [property: JsonPropertyName("context")] string Context,
    [property: JsonPropertyName("color")] string Color);

public sealed record ActiveRequisition(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("position")] string Position,
    [property: JsonPropertyName("department")] string Department,
    [property: JsonPropertyName("priority")] string Priority,
    [property: JsonPropertyName("candidates")] int Candidates,
    [property: JsonPropertyName("stage")] string Stage,
    [property: JsonPropertyName("timeOpen")] string TimeOpen);

public sealed record ActivityTimelineEvent(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("detail")] string Detail,
    [property: JsonPropertyName("timestamp")] string Timestamp,
    [property: JsonPropertyName("status")] string Status);

public sealed record AiInsightAction(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("label")] string Label);

public sealed record AiInsight(
    [property: JsonPropertyName("employeeId")] string EmployeeId,
    [property: JsonPropertyName("engagementDrop")] double EngagementDrop,
    [property: JsonPropertyName("quarter")] string Quarter,
    [property: JsonPropertyName("notes")] string Notes,
    [property: JsonPropertyName("actions")] AiInsightAction[] Actions);

public sealed record ActionPlan(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("category")] string Category,
    [property: JsonPropertyName("statusColor")] string StatusColor,
    [property: JsonPropertyName("statusLabel")] string StatusLabel,
    [property: JsonPropertyName("progress")] double Progress);

/// <summary>Wire shape returned by <c>GET /api/overview</c>.</summary>
public sealed record OverviewResponse(
    [property: JsonPropertyName("kpiCards")] KpiCardData[] KpiCards,
    [property: JsonPropertyName("requisitions")] ActiveRequisition[] Requisitions,
    [property: JsonPropertyName("activityTimeline")] ActivityTimelineEvent[] ActivityTimeline,
    [property: JsonPropertyName("aiInsight")] AiInsight AiInsight,
    [property: JsonPropertyName("actionPlans")] ActionPlan[] ActionPlans);
