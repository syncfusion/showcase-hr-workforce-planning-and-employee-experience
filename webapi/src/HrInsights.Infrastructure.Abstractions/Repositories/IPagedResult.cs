namespace HrInsights.Infrastructure.Abstractions.Repositories;

public interface IPagedResult<out T>
{
    IReadOnlyList<T> Items { get; }

    int Page { get; }

    int PageSize { get; }

    int TotalCount { get; }

    int TotalPages { get; }
}
