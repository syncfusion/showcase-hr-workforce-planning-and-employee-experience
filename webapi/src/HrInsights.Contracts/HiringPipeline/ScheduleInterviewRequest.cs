namespace HrInsights.Contracts.HiringPipeline;

/// <summary>
/// Request for scheduling an interview.
/// </summary>
public sealed record ScheduleInterviewRequest(
    string ApplicationId,
    string Type,              // "phone" | "technical" | "panel" | "manager"
    string ScheduledStart,    // ISO 8601
    string ScheduledEnd,      // ISO 8601
    IReadOnlyList<string> Interviewers);
