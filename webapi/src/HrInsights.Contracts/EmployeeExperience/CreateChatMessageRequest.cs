namespace HrInsights.Contracts.EmployeeExperience;

public sealed record CreateChatMessageRequest(
    string ThreadId,
    string Body,
    string? ToId);
