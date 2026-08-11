using Microsoft.EntityFrameworkCore;
using HrInsights.Infrastructure.Abstractions.Repositories;
using HrInsights.Infrastructure.EFCore.Persistence;

namespace HrInsights.Infrastructure.EFCore.Repositories;

public class EFReadRepository<TEntity, TKey> : IReadRepository<TEntity, TKey>
    where TEntity : class
    where TKey : notnull
{
    protected readonly HrInsightsDbContext DbContext;

    protected readonly DbSet<TEntity> DbSet;

    public EFReadRepository(HrInsightsDbContext dbContext)
    {
        DbContext = dbContext;
        DbSet = dbContext.Set<TEntity>();
    }

    public virtual Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default)
        => DbSet.FindAsync([id], cancellationToken).AsTask();

    public virtual async Task<IReadOnlyList<TEntity>> ListAsync(ISpecification<TEntity>? specification = null, CancellationToken cancellationToken = default)
    {
        var query = ApplySpecification(specification);
        return await query.ToListAsync(cancellationToken);
    }

    public virtual async Task<IPagedResult<TEntity>> PagedAsync(ISpecification<TEntity>? specification = null, int page = 1, int pageSize = 25, CancellationToken cancellationToken = default)
    {
        var query = ApplySpecification(specification);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return new PagedResult<TEntity>(items, page, pageSize, totalCount);
    }

    protected virtual IQueryable<TEntity> ApplySpecification(ISpecification<TEntity>? specification)
    {
        var query = DbSet.AsQueryable();
        if (specification is null)
        {
            return query;
        }

        return query.Where(specification.IsSatisfiedBy).AsQueryable();
    }
}
