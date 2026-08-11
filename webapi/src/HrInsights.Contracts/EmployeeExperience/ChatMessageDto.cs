namespace HrInsights.Contracts.EmployeeExperience;

public sealed record ChatMessageDto(
    string Id,
    string ThreadId,
    string FromId,
    string FromName,
    string? ToId,
    string Body,
    string SentAt,          // ISO 8601
    IReadOnlyList<string>? Attachments);
