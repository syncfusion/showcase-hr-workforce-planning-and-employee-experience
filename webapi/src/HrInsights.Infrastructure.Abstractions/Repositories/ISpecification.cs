namespace HrInsights.Infrastructure.Abstractions.Repositories;

public interface ISpecification<TEntity>
{
    bool IsSatisfiedBy(TEntity entity);
}
