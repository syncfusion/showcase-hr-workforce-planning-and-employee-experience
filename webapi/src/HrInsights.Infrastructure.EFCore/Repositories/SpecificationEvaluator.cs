using HrInsights.Infrastructure.Abstractions.Repositories;

namespace HrInsights.Infrastructure.EFCore.Repositories;

public static class SpecificationEvaluator
{
    public static IQueryable<TEntity> GetQuery<TEntity>(IQueryable<TEntity> inputQuery, ISpecification<TEntity>? specification)
    {
        if (specification is null)
        {
            return inputQuery;
        }

        return inputQuery.Where(specification.IsSatisfiedBy).AsQueryable();
    }
}
