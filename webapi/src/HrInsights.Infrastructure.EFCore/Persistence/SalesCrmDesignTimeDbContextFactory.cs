using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Json;

namespace HrInsights.Infrastructure.EFCore.Persistence;

public sealed class HrInsightsDesignTimeDbContextFactory : IDesignTimeDbContextFactory<HrInsightsDbContext>
{
    public HrInsightsDbContext CreateDbContext(string[] args)
    {
        var basePath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "HrInsights.Api"));

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<HrInsightsDbContext>();
        optionsBuilder.UseNpgsql(
            configuration.GetConnectionString("HrInsightsDb")
            ?? configuration.GetConnectionString("HrInsightsDatabase")
            ?? "Host=localhost;Port=5432;Database=hrinsights_pipeline;Username=postgres;Password=Syncfusion@123",
            npgsqlOptions => npgsqlOptions.MigrationsAssembly(typeof(HrInsightsDbContext).Assembly.FullName));

        return new HrInsightsDbContext(optionsBuilder.Options);
    }
}