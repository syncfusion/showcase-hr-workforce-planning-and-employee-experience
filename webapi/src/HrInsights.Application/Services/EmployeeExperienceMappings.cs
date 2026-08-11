using HrInsights.Contracts.EmployeeExperience;
using HrInsights.Domain.Entities;
using HrInsights.Domain.Enums;

namespace HrInsights.Application.Services;

/// <summary>
/// Maps Employee Experience domain entities ⇄ wire DTOs.
/// Wire formats are preserved exactly so the React UI keeps working unchanged.
/// </summary>
internal static class EmployeeExperienceMappings
{
    // ── Self-Service ──────────────────────────────────────────────
    public static SelfServiceRequestDto ToDto(this SelfServiceRequest e)
        => new(
            Id: e.Id.ToString("D"),
            EmployeeId: e.EmployeeId,
            EmployeeName: e.EmployeeName,
            Type: e.Type,
            Subject: e.Subject,
            Details: e.Details,
            Status: ToWireStatus(e.Status),
            Priority: ToWirePriority(e.Priority),
            AssignedTo: e.AssignedTo,
            CreatedAt: ToIso(e.CreatedAt),
            UpdatedAt: e.UpdatedAt.HasValue ? ToIso(e.UpdatedAt.Value) : null,
            Attachments: e.GetAttachments());

    // ── Pulse Surveys ─────────────────────────────────────────────
    public static PulseSurveyDto ToDto(this PulseSurvey e)
        => new(
            Id: e.Id.ToString("D"),
            CampaignId: e.CampaignId,
            Title: e.Title,
            Status: ToWireSurveyStatus(e.Status),
            Cadence: e.Cadence.HasValue ? ToWireCadence(e.Cadence.Value) : null,
            QuestionRefs: e.GetQuestionRefs().ToList(),
            ResponseRate: e.ResponseRate,
            TotalResponses: e.TotalResponses,
            OpenAt: ToIso(e.OpenAt),
            CloseAt: e.CloseAt.HasValue ? ToIso(e.CloseAt.Value) : null,
            Themes: e.Themes.Select(t => new ThemeSentimentDto(t.Theme, t.Sentiment, t.Department)).ToList());

    public static PulseResponseDto ToDto(this PulseResponse e)
        => new(
            Id: e.Id.ToString("D"),
            PulseSurveyId: e.PulseSurveyId.ToString("D"),
            EmployeeId: e.EmployeeId,
            Department: e.Department,
            Sentiment: e.Sentiment,
            SubmittedAt: ToIso(e.SubmittedAt),
            Comment: e.Comment);

    // ── Recognitions ─────────────────────────────────────────────
    public static RecognitionDto ToDto(this Recognition e)
        => new(
            Id: e.Id.ToString("D"),
            FromEmployeeId: e.FromEmployeeId,
            FromName: e.FromName,
            ToEmployeeId: e.ToEmployeeId,
            ToName: e.ToName,
            Type: e.Type,
            Message: e.Message,
            Value: e.Value,
            CreatedAt: ToIso(e.CreatedAt),
            VisibleTo: e.VisibleTo);

    // ── Career Plans ─────────────────────────────────────────────
    public static CareerDevelopmentPlanDto ToDto(this CareerDevelopmentPlan e)
        => new(
            Id: e.Id.ToString("D"),
            EmployeeId: e.EmployeeId,
            EmployeeName: e.EmployeeName,
            ManagerId: e.ManagerId,
            CurrentRole: e.CurrentRole,
            TargetRole: e.TargetRole,
            Horizon: ToWireHorizon(e.Horizon),
            Status: ToWireCareerPlanStatus(e.Status),
            Milestones: e.Milestones.Select(ToDto).ToList(),
            LastReviewedAt: e.LastReviewedAt.HasValue ? ToIso(e.LastReviewedAt.Value) : null);

    public static CareerMilestoneDto ToDto(this CareerMilestone e)
        => new(
            Id: e.Id.ToString("D"),
            PlanId: e.CareerPlanId.ToString("D"),
            Title: e.Title,
            TargetDate: e.TargetDate.ToString("yyyy-MM-dd"),
            Status: ToWireMilestoneStatus(e.Status),
            EvidenceLink: e.EvidenceLink);

    // ── Learning ─────────────────────────────────────────────────
    public static LearningRecommendationDto ToDto(this LearningRecommendation e)
        => new(
            Id: e.Id.ToString("D"),
            PlanId: e.CareerPlanId?.ToString("D"),
            EmployeeId: e.EmployeeId,
            Title: e.Title,
            Provider: e.Provider,
            Format: ToWireFormat(e.Format),
            SkillTag: e.SkillTag,
            Reason: e.Reason,
            MatchScore: e.MatchScore,
            EstHours: e.EstHours,
            Status: ToWireLearningStatus(e.Status),
            SuggestedAt: ToIso(e.SuggestedAt));

    // ── Issues ───────────────────────────────────────────────────
    public static IssueReportDto ToDto(this IssueReport e)
        => new(
            Id: e.Id.ToString("D"),
            ReportedBy: e.ReportedBy,
            ReportedByName: e.ReportedByName,
            Category: e.Category,
            Subject: e.Subject,
            Description: e.Description,
            Url: e.Url,
            Browser: e.Browser,
            Attachments: e.GetAttachments(),
            Status: ToWireIssueStatus(e.Status),
            Priority: ToWireIssuePriority(e.Priority),
            AssignedTo: e.AssignedTo,
            CreatedAt: ToIso(e.CreatedAt),
            ResolvedAt: e.ResolvedAt.HasValue ? ToIso(e.ResolvedAt.Value) : null);

    // ── Delays ───────────────────────────────────────────────────
    public static DelayConcernDto ToDto(this DelayConcern e)
        => new(
            Id: e.Id.ToString("D"),
            RaisedBy: e.RaisedBy,
            RaisedByName: e.RaisedByName,
            RelatedEntityType: e.RelatedEntityType,
            RelatedEntityId: e.RelatedEntityId,
            Subject: e.Subject,
            Details: e.Details,
            DaysWaiting: e.DaysWaiting,
            ExpectedSlackDays: e.ExpectedSlackDays,
            Status: ToWireDelayStatus(e.Status),
            Severity: ToWireDelaySeverity(e.Severity),
            CreatedAt: ToIso(e.CreatedAt));

    // ── Kanban ───────────────────────────────────────────────────
    public static KanbanItemDto ToDto(this KanbanItem e)
        => new(
            Id: e.Id.ToString("D"),
            SourceType: e.SourceType,
            SourceId: e.SourceId,
            Title: e.Title,
            Lane: ToWireLane(e.Lane),
            AssigneeId: e.AssigneeId,
            Priority: ToWireKanbanPriority(e.Priority),
            DueDate: e.DueDate?.ToString("yyyy-MM-dd"),
            Tags: e.GetTags(),
            UpdatedAt: ToIso(e.UpdatedAt));

    // ── Notifications ───────────────────────────────────────────
    public static NotificationItemDto ToDto(this NotificationItem e)
        => new(
            Id: e.Id.ToString("D"),
            UserId: e.UserId,
            Type: e.Type,
            Title: e.Title,
            Body: e.Body,
            RelatedEntityType: e.RelatedEntityType,
            RelatedEntityId: e.RelatedEntityId,
            Read: e.Read,
            CreatedAt: ToIso(e.CreatedAt));

    // ── Chat Messages ───────────────────────────────────────────
    public static ChatMessageDto ToDto(this ChatMessage e)
        => new(
            Id: e.Id.ToString("D"),
            ThreadId: e.ThreadId,
            FromId: e.FromId,
            FromName: e.FromName,
            ToId: e.ToId,
            Body: e.Body,
            SentAt: ToIso(e.SentAt),
            Attachments: e.GetAttachments());

    // ── Wire-format helpers ──────────────────────────────────────
    private static string ToWireStatus(SelfServiceRequestStatus s) => s switch
    {
        SelfServiceRequestStatus.Submitted => "submitted",
        SelfServiceRequestStatus.InReview => "in-review",
        SelfServiceRequestStatus.InProgress => "in-progress",
        SelfServiceRequestStatus.Resolved => "resolved",
        SelfServiceRequestStatus.Rejected => "rejected",
        _ => "submitted",
    };

    private static SelfServiceRequestStatus FromWireStatus(string? s) => s switch
    {
        "submitted" => SelfServiceRequestStatus.Submitted,
        "in-review" => SelfServiceRequestStatus.InReview,
        "in-progress" => SelfServiceRequestStatus.InProgress,
        "resolved" => SelfServiceRequestStatus.Resolved,
        "rejected" => SelfServiceRequestStatus.Rejected,
        _ => SelfServiceRequestStatus.Submitted,
    };

    private static string ToWirePriority(SelfServiceRequestPriority p) => p switch
    {
        SelfServiceRequestPriority.Low => "low",
        SelfServiceRequestPriority.Medium => "medium",
        SelfServiceRequestPriority.High => "high",
        _ => "medium",
    };

    public static SelfServiceRequestPriority FromWirePriority(string? p) => p switch
    {
        "low" => SelfServiceRequestPriority.Low,
        "high" => SelfServiceRequestPriority.High,
        "medium" or null => SelfServiceRequestPriority.Medium,
        _ => SelfServiceRequestPriority.Medium,
    };

    private static string ToWireSurveyStatus(PulseSurveyStatus s) => s switch
    {
        PulseSurveyStatus.Draft => "draft",
        PulseSurveyStatus.Active => "active",
        PulseSurveyStatus.Closed => "closed",
        _ => "draft",
    };

    private static string ToWireCadence(PulseSurveyCadence c) => c switch
    {
        PulseSurveyCadence.OneTime => "one-time",
        PulseSurveyCadence.Weekly => "weekly",
        PulseSurveyCadence.Monthly => "monthly",
        PulseSurveyCadence.Quarterly => "quarterly",
        _ => "one-time",
    };

    public static PulseSurveyCadence FromWireCadence(string? c) => c switch
    {
        "weekly" => PulseSurveyCadence.Weekly,
        "monthly" => PulseSurveyCadence.Monthly,
        "quarterly" => PulseSurveyCadence.Quarterly,
        "one-time" or null => PulseSurveyCadence.OneTime,
        _ => PulseSurveyCadence.OneTime,
    };

    public static MilestoneStatus FromWireMilestoneStatus(string? s) => s switch
    {
        "not-started" => MilestoneStatus.NotStarted,
        "in-progress" => MilestoneStatus.InProgress,
        "completed" => MilestoneStatus.Completed,
        "blocked" => MilestoneStatus.Blocked,
        _ => MilestoneStatus.NotStarted,
    };

    private static string ToWireMilestoneStatus(MilestoneStatus s) => s switch
    {
        MilestoneStatus.NotStarted => "not-started",
        MilestoneStatus.InProgress => "in-progress",
        MilestoneStatus.Completed => "completed",
        MilestoneStatus.Blocked => "blocked",
        _ => "not-started",
    };

    private static string ToWireCareerPlanStatus(CareerPlanStatus s) => s switch
    {
        CareerPlanStatus.Draft => "draft",
        CareerPlanStatus.OnTrack => "on-track",
        CareerPlanStatus.AtRisk => "at-risk",
        CareerPlanStatus.Completed => "completed",
        CareerPlanStatus.Stalled => "stalled",
        _ => "draft",
    };

    private static string ToWireHorizon(CareerHorizon h) => h switch
    {
        CareerHorizon.SixMonths => "6-months",
        CareerHorizon.TwelveMonths => "12-months",
        CareerHorizon.TwentyFourMonths => "24-months",
        _ => "12-months",
    };

    public static CareerHorizon FromWireHorizon(string? h) => h switch
    {
        "6-months" => CareerHorizon.SixMonths,
        "12-months" or null => CareerHorizon.TwelveMonths,
        "24-months" => CareerHorizon.TwentyFourMonths,
        _ => CareerHorizon.TwelveMonths,
    };

    public static LearningRecommendationStatus FromWireLearningStatus(string? s) => s switch
    {
        "suggested" => LearningRecommendationStatus.Suggested,
        "saved" => LearningRecommendationStatus.Saved,
        "in-progress" => LearningRecommendationStatus.InProgress,
        "completed" => LearningRecommendationStatus.Completed,
        "dismissed" => LearningRecommendationStatus.Dismissed,
        _ => LearningRecommendationStatus.Suggested,
    };

    private static string ToWireLearningStatus(LearningRecommendationStatus s) => s switch
    {
        LearningRecommendationStatus.Suggested => "suggested",
        LearningRecommendationStatus.Saved => "saved",
        LearningRecommendationStatus.InProgress => "in-progress",
        LearningRecommendationStatus.Completed => "completed",
        LearningRecommendationStatus.Dismissed => "dismissed",
        _ => "suggested",
    };

    private static string ToWireFormat(LearningFormat f) => f switch
    {
        LearningFormat.Course => "course",
        LearningFormat.Article => "article",
        LearningFormat.Video => "video",
        LearningFormat.Certification => "certification",
        LearningFormat.Mentoring => "mentoring",
        LearningFormat.Project => "project",
        _ => "course",
    };

    public static LearningFormat FromWireFormat(string? s) => s switch
    {
        "course" => LearningFormat.Course,
        "article" => LearningFormat.Article,
        "video" => LearningFormat.Video,
        "certification" => LearningFormat.Certification,
        "mentoring" => LearningFormat.Mentoring,
        "project" => LearningFormat.Project,
        _ => LearningFormat.Course,
    };

    private static string ToWireIssueStatus(IssueReportStatus s) => s switch
    {
        IssueReportStatus.Submitted => "submitted",
        IssueReportStatus.Acknowledged => "acknowledged",
        IssueReportStatus.InProgress => "in-progress",
        IssueReportStatus.Resolved => "resolved",
        IssueReportStatus.WontFix => "wont-fix",
        _ => "submitted",
    };

    private static string ToWireIssuePriority(IssueReportPriority p) => p switch
    {
        IssueReportPriority.Low => "low",
        IssueReportPriority.Medium => "medium",
        IssueReportPriority.High => "high",
        IssueReportPriority.Critical => "critical",
        _ => "medium",
    };

    public static IssueReportPriority FromWireIssuePriority(string? p) => p switch
    {
        "low" => IssueReportPriority.Low,
        "high" => IssueReportPriority.High,
        "critical" => IssueReportPriority.Critical,
        "medium" or null => IssueReportPriority.Medium,
        _ => IssueReportPriority.Medium,
    };

    private static string ToWireDelayStatus(DelayConcernStatus s) => s switch
    {
        DelayConcernStatus.Open => "open",
        DelayConcernStatus.Acknowledged => "acknowledged",
        DelayConcernStatus.Resolved => "resolved",
        DelayConcernStatus.Rejected => "rejected",
        _ => "open",
    };

    private static string ToWireDelaySeverity(DelayConcernSeverity s) => s switch
    {
        DelayConcernSeverity.Low => "low",
        DelayConcernSeverity.Medium => "medium",
        DelayConcernSeverity.High => "high",
        _ => "medium",
    };

    public static DelayConcernSeverity FromWireDelaySeverity(string? s) => s switch
    {
        "low" => DelayConcernSeverity.Low,
        "high" => DelayConcernSeverity.High,
        "medium" or null => DelayConcernSeverity.Medium,
        _ => DelayConcernSeverity.Medium,
    };

    private static string ToWireLane(KanbanLane l) => l switch
    {
        KanbanLane.Backlog => "backlog",
        KanbanLane.InProgress => "in-progress",
        KanbanLane.InReview => "in-review",
        KanbanLane.Done => "done",
        _ => "backlog",
    };

    public static KanbanLane FromWireLane(string? s) => s switch
    {
        "in-progress" => KanbanLane.InProgress,
        "in-review" => KanbanLane.InReview,
        "done" => KanbanLane.Done,
        "backlog" or null => KanbanLane.Backlog,
        _ => KanbanLane.Backlog,
    };

    private static string ToWireKanbanPriority(KanbanPriority p) => p switch
    {
        KanbanPriority.Low => "low",
        KanbanPriority.Medium => "medium",
        KanbanPriority.High => "high",
        KanbanPriority.Critical => "critical",
        _ => "medium",
    };

    public static KanbanPriority FromWireKanbanPriority(string? p) => p switch
    {
        "low" => KanbanPriority.Low,
        "high" => KanbanPriority.High,
        "critical" => KanbanPriority.Critical,
        "medium" or null => KanbanPriority.Medium,
        _ => KanbanPriority.Medium,
    };

    // Best-effort parsing for wire IDs that may be guids or seed-prefixed strings.
    public static Guid ParseId(string id)
        => Guid.TryParse(id, out var g) ? g : Guid.Empty;

    private static string ToIso(DateTime dt)
        => dt.ToString("yyyy-MM-ddTHH:mm:ssZ");
}
