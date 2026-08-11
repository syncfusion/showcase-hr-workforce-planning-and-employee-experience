namespace HrInsights.Infrastructure.Abstractions.Services;

public interface ICurrentUserService
{
    Guid? UserId { get; }

    string? DisplayName { get; }

    string? Email { get; }
}
