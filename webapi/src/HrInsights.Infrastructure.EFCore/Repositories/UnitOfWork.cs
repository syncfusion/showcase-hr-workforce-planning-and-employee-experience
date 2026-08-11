using HrInsights.Infrastructure.Abstractions.Repositories;
using HrInsights.Infrastructure.EFCore.Persistence;

namespace HrInsights.Infrastructure.EFCore.Repositories;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly HrInsightsDbContext _dbContext;

    public UnitOfWork(HrInsightsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => _dbContext.SaveChangesAsync(cancellationToken);
}
