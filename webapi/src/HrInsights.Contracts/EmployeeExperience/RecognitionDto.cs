namespace HrInsights.Contracts.EmployeeExperience;

public sealed record RecognitionDto(
    string Id,
    string FromEmployeeId,
    string FromName,
    string ToEmployeeId,
    string ToName,
    string Type,           // "peer-shoutout" | "milestone" | "leadership" | "team-win"
    string Message,
    string? Value,
    string CreatedAt,      // ISO 8601
    string VisibleTo);     // "public" | "team" | "private"
