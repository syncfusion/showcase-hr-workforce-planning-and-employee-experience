namespace HrInsights.Contracts.EmployeeExperience;

public sealed record CreateRecognitionRequest(
    string ToEmployeeId,
    string ToName,
    string Type,
    string Message,
    string? Value,
    string VisibleTo);
