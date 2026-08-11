namespace HrInsights.Contracts.EmployeeExperience;

public sealed record NotificationItemDto(
    string Id,
    string UserId,
    string Type,            // "chat" | "system" | "mention" | "status-update"
    string Title,
    string? Body,
    string? RelatedEntityType,
    string? RelatedEntityId,
    bool Read,
    string CreatedAt);      // ISO 8601
