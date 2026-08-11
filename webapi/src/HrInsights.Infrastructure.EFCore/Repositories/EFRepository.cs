using Microsoft.EntityFrameworkCore;
using HrInsights.Infrastructure.Abstractions.Repositories;
using HrInsights.Infrastructure.EFCore.Persistence;

namespace HrInsights.Infrastructure.EFCore.Repositories;

public class EFRepository<TEntity, TKey> : IRepository<TEntity, TKey>
    where TEntity : class
    where TKey : notnull
{
    protected readonly HrInsightsDbContext DbContext;

    protected readonly DbSet<TEntity> DbSet;

    public EFRepository(HrInsightsDbContext dbContext)
    {
        DbContext = dbContext;
        DbSet = dbContext.Set<TEntity>();
    }

    public virtual Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default)
        => DbSet.FindAsync([id], cancellationToken).AsTask();

    public virtual async Task AddAsync(TEntity entity, CancellationToken cancellationToken = default)
        => await DbSet.AddAsync(entity, cancellationToken);

    public virtual void Update(TEntity entity) => DbSet.Update(entity);

    public virtual void Remove(TEntity entity) => DbSet.Remove(entity);
}
