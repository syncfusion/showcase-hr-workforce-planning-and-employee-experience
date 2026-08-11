// Blazor models for the Employee Experience screen.
//
// Field names and types mirror the backend DTOs in
// `backend/src/SalesCrm.Contracts/EmployeeExperience/*Dto.cs` and
// `*Request.cs`, which are the source of truth for the wire format.
// The C# property names use PascalCase (Blazor/Razor convention); the
// [JsonPropertyName] attributes below map each one to the camelCase
// JSON field the controller emits.

using System.Text.Json.Serialization;

namespace BlazorWebApp.Components.Models;

// ── Shared ────────────────────────────────────────────────────────────

public sealed record ThemeSentiment(
    [property: JsonPropertyName("theme")] string Theme,
    [property: JsonPropertyName("sentiment")] int Sentiment,
    [property: JsonPropertyName("department")] string Department);

// ── 1. Self-Service ───────────────────────────────────────────────────

public sealed record SelfServiceRequest(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("employeeId")] string EmployeeId,
    [property: JsonPropertyName("employeeName")] string EmployeeName,
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("subject")] string Subject,
    [property: JsonPropertyName("details")] string Details,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("priority")] string? Priority,
    [property: JsonPropertyName("assignedTo")] string? AssignedTo,
    [property: JsonPropertyName("createdAt")] string CreatedAt,
    [property: JsonPropertyName("updatedAt")] string? UpdatedAt,
    [property: JsonPropertyName("attachments")] IReadOnlyList<string> Attachments);

public sealed record SelfServiceRequestInput(
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("subject")] string Subject,
    [property: JsonPropertyName("details")] string Details,
    [property: JsonPropertyName("priority")] string? Priority);

// ── 2. Pulse Surveys ──────────────────────────────────────────────────

public sealed record PulseSurvey(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("campaignId")] string? CampaignId,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("cadence")] string? Cadence,
    [property: JsonPropertyName("questionRefs")] IReadOnlyList<string> QuestionRefs,
    [property: JsonPropertyName("responseRate")] decimal ResponseRate,
    [property: JsonPropertyName("totalResponses")] int TotalResponses,
    [property: JsonPropertyName("openAt")] string OpenAt,
    [property: JsonPropertyName("closeAt")] string? CloseAt,
    [property: JsonPropertyName("themes")] IReadOnlyList<ThemeSentiment> Themes);

// ── 3. Pulse Responses ────────────────────────────────────────────────

public sealed record PulseResponse(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("pulseSurveyId")] string PulseSurveyId,
    [property: JsonPropertyName("employeeId")] string? EmployeeId,
    [property: JsonPropertyName("department")] string? Department,
    [property: JsonPropertyName("sentiment")] decimal Sentiment,
    [property: JsonPropertyName("submittedAt")] string SubmittedAt,
    [property: JsonPropertyName("comment")] string? Comment);

public sealed record PulseResponseInput(
    [property: JsonPropertyName("pulseSurveyId")] string PulseSurveyId,
    [property: JsonPropertyName("sentiment")] decimal Sentiment,
    [property: JsonPropertyName("comment")] string? Comment);

// ── 4. Recognitions ───────────────────────────────────────────────────

public sealed record Recognition(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("fromEmployeeId")] string FromEmployeeId,
    [property: JsonPropertyName("fromName")] string FromName,
    [property: JsonPropertyName("toEmployeeId")] string ToEmployeeId,
    [property: JsonPropertyName("toName")] string ToName,
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("value")] string? Value,
    [property: JsonPropertyName("createdAt")] string CreatedAt,
    [property: JsonPropertyName("visibleTo")] string VisibleTo);

public sealed record RecognitionInput(
    [property: JsonPropertyName("toEmployeeId")] string ToEmployeeId,
    [property: JsonPropertyName("toName")] string ToName,
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("message")] string Message,
    [property: JsonPropertyName("value")] string? Value,
    [property: JsonPropertyName("visibleTo")] string VisibleTo);

// ── 5. Career Plans ───────────────────────────────────────────────────

public sealed record CareerMilestone(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("planId")] string PlanId,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("targetDate")] string? TargetDate,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("evidenceLink")] string? EvidenceLink);

public sealed record CareerDevelopmentPlan(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("employeeId")] string EmployeeId,
    [property: JsonPropertyName("employeeName")] string EmployeeName,
    [property: JsonPropertyName("managerId")] string ManagerId,
    [property: JsonPropertyName("currentRole")] string CurrentRole,
    [property: JsonPropertyName("targetRole")] string? TargetRole,
    [property: JsonPropertyName("horizon")] string Horizon,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("milestones")] IReadOnlyList<CareerMilestone> Milestones,
    [property: JsonPropertyName("lastReviewedAt")] string? LastReviewedAt);

public sealed record UpdateMilestoneInput(
    [property: JsonPropertyName("status")] string Status);

// ── 6. Learning Recommendations ───────────────────────────────────────

public sealed record LearningRecommendation(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("planId")] string? PlanId,
    [property: JsonPropertyName("employeeId")] string EmployeeId,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("provider")] string? Provider,
    [property: JsonPropertyName("format")] string Format,
    [property: JsonPropertyName("skillTag")] string? SkillTag,
    [property: JsonPropertyName("reason")] string? Reason,
    [property: JsonPropertyName("matchScore")] decimal? MatchScore,
    [property: JsonPropertyName("estHours")] decimal? EstHours,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("suggestedAt")] string SuggestedAt);

public sealed record UpdateLearningInput(
    [property: JsonPropertyName("status")] string Status);

// ── 7. Issue Reports ──────────────────────────────────────────────────

public sealed record IssueReport(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("reportedBy")] string ReportedBy,
    [property: JsonPropertyName("reportedByName")] string ReportedByName,
    [property: JsonPropertyName("category")] string Category,
    [property: JsonPropertyName("subject")] string Subject,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("url")] string? Url,
    [property: JsonPropertyName("browser")] string? Browser,
    [property: JsonPropertyName("attachments")] IReadOnlyList<string> Attachments,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("priority")] string? Priority,
    [property: JsonPropertyName("assignedTo")] string? AssignedTo,
    [property: JsonPropertyName("createdAt")] string CreatedAt,
    [property: JsonPropertyName("resolvedAt")] string? ResolvedAt);

public sealed record IssueReportInput(
    [property: JsonPropertyName("category")] string Category,
    [property: JsonPropertyName("subject")] string Subject,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("url")] string? Url,
    [property: JsonPropertyName("browser")] string? Browser,
    [property: JsonPropertyName("priority")] string? Priority);

// ── 8. Delay Concerns ─────────────────────────────────────────────────

public sealed record DelayConcern(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("raisedBy")] string RaisedBy,
    [property: JsonPropertyName("raisedByName")] string RaisedByName,
    [property: JsonPropertyName("relatedEntityType")] string RelatedEntityType,
    [property: JsonPropertyName("relatedEntityId")] string? RelatedEntityId,
    [property: JsonPropertyName("subject")] string Subject,
    [property: JsonPropertyName("details")] string Details,
    [property: JsonPropertyName("daysWaiting")] int DaysWaiting,
    [property: JsonPropertyName("expectedSlackDays")] int? ExpectedSlackDays,
    [property: JsonPropertyName("status")] string Status,
    [property: JsonPropertyName("severity")] string? Severity,
    [property: JsonPropertyName("createdAt")] string CreatedAt);

public sealed record DelayConcernInput(
    [property: JsonPropertyName("relatedEntityType")] string RelatedEntityType,
    [property: JsonPropertyName("relatedEntityId")] string? RelatedEntityId,
    [property: JsonPropertyName("subject")] string Subject,
    [property: JsonPropertyName("details")] string Details,
    [property: JsonPropertyName("daysWaiting")] int DaysWaiting,
    [property: JsonPropertyName("expectedSlackDays")] int? ExpectedSlackDays,
    [property: JsonPropertyName("severity")] string? Severity);

// ── 9. Kanban ─────────────────────────────────────────────────────────

public sealed record KanbanItem(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("sourceType")] string SourceType,
    [property: JsonPropertyName("sourceId")] string SourceId,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("lane")] string Lane,
    [property: JsonPropertyName("assigneeId")] string? AssigneeId,
    [property: JsonPropertyName("priority")] string? Priority,
    [property: JsonPropertyName("dueDate")] string? DueDate,
    [property: JsonPropertyName("tags")] IReadOnlyList<string> Tags,
    [property: JsonPropertyName("updatedAt")] string UpdatedAt);

public sealed record UpdateKanbanLaneInput(
    [property: JsonPropertyName("lane")] string Lane);

// ── 10. Notifications ────────────────────────────────────────────────

public sealed record NotificationItem(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("userId")] string UserId,
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("body")] string? Body,
    [property: JsonPropertyName("relatedEntityType")] string? RelatedEntityType,
    [property: JsonPropertyName("relatedEntityId")] string? RelatedEntityId,
    [property: JsonPropertyName("read")] bool Read,
    [property: JsonPropertyName("createdAt")] string CreatedAt);

// ── 11. Chat Messages ─────────────────────────────────────────────────

public sealed record ChatMessage(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("threadId")] string ThreadId,
    [property: JsonPropertyName("fromId")] string FromId,
    [property: JsonPropertyName("fromName")] string FromName,
    [property: JsonPropertyName("toId")] string? ToId,
    [property: JsonPropertyName("body")] string Body,
    [property: JsonPropertyName("sentAt")] string SentAt,
    [property: JsonPropertyName("attachments")] IReadOnlyList<string> Attachments);

public sealed record ChatMessageInput(
    [property: JsonPropertyName("threadId")] string ThreadId,
    [property: JsonPropertyName("body")] string Body,
    [property: JsonPropertyName("toId")] string? ToId);
