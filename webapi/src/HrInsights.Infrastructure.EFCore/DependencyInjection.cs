using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HrInsights.Infrastructure.Abstractions.Repositories;
using HrInsights.Infrastructure.Abstractions.Services;
using HrInsights.Infrastructure.EFCore.Persistence;
using HrInsights.Infrastructure.EFCore.Repositories;
using HrInsights.Infrastructure.EFCore.Services;
using HrInsights.SeedData;

namespace HrInsights.Infrastructure.EFCore;

public static class DependencyInjection
{
    public static IServiceCollection AddHrInsightsInfrastructureEfCore(this IServiceCollection services, IConfiguration configuration)
    {
        var connectinString = configuration.GetConnectionString("HrInsightsDatabase");
        services.AddDbContext<HrInsightsDbContext>(options =>
            options.UseNpgsql(connectinString));

        services.AddScoped(typeof(IRepository<,>), typeof(EFRepository<,>));
        services.AddScoped(typeof(IReadRepository<,>), typeof(EFReadRepository<,>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddSingleton(new CrmSeedOptions());
        services.AddScoped<DatabaseSeeder>();
        services.AddScoped<ICrmSeedDataGenerator, CrmSeedDataGenerator>();

        return services;
    }
}
