using System.Text.Json.Serialization;

namespace BlazorWebApp.Components.Models;

public sealed record WorkforcePlan(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("planningPeriodStart")] string PlanningPeriodStart,
    [property: JsonPropertyName("planningPeriodEnd")] string PlanningPeriodEnd,
    [property: JsonPropertyName("ownerId")] string OwnerId,
    [property: JsonPropertyName("currency")] string Currency,
    [property: JsonPropertyName("latestSnapshotAt")] string? LatestSnapshotAt);

public sealed record WorkforceScenario(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("planId")] string PlanId,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("headcountTarget")] int HeadcountTarget,
    [property: JsonPropertyName("hiringTarget")] int? HiringTarget,
    [property: JsonPropertyName("attritionRate")] double? AttritionRate,
    [property: JsonPropertyName("budgetImpact")] double BudgetImpact,
    [property: JsonPropertyName("confidence")] string? Confidence);

public sealed record WorkforceLineItem(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("scenarioId")] string ScenarioId,
    [property: JsonPropertyName("function")] string Function,
    [property: JsonPropertyName("region")] string Region,
    [property: JsonPropertyName("roleFamily")] string RoleFamily,
    [property: JsonPropertyName("currentHeadcount")] int CurrentHeadcount,
    [property: JsonPropertyName("plannedHeadcount")] int PlannedHeadcount,
    [property: JsonPropertyName("openRoles")] int? OpenRoles,
    [property: JsonPropertyName("costCenter")] string? CostCenter);

public sealed record ScenarioAssumption(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("scenarioId")] string ScenarioId,
    [property: JsonPropertyName("category")] string Category,
    [property: JsonPropertyName("value")] double Value,
    [property: JsonPropertyName("unit")] string Unit,
    [property: JsonPropertyName("note")] string? Note);

public sealed record PlanningSnapshot(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("planId")] string PlanId,
    [property: JsonPropertyName("capturedAt")] string CapturedAt,
    [property: JsonPropertyName("createdBy")] string CreatedBy,
    [property: JsonPropertyName("sourceSystem")] string SourceSystem);
