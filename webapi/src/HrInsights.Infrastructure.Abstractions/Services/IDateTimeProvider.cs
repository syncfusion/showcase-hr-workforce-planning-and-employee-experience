namespace HrInsights.Infrastructure.Abstractions.Services;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
