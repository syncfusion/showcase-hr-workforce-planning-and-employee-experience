namespace HrInsights.Infrastructure.Abstractions.Repositories;

public interface IReadRepository<TEntity, TKey>
    where TEntity : class
    where TKey : notnull
{
    Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TEntity>> ListAsync(ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default);

    Task<IPagedResult<TEntity>> PagedAsync(ISpecification<TEntity>? specification = null, int page = 1, int pageSize = 25, CancellationToken cancellationToken = default);
}
