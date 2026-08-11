namespace HrInsights.Infrastructure.Abstractions.Repositories;

public interface IRepository<TEntity, TKey>
    where TEntity : class
    where TKey : notnull
{
    Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default);

    Task AddAsync(TEntity entity, CancellationToken cancellationToken = default);

    void Update(TEntity entity);

    void Remove(TEntity entity);
}
