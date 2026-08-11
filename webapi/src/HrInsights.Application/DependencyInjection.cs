using HrInsights.Application.Ai;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HrInsights.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddHrInsightsApplication(this IServiceCollection services)
    {
        services.AddScoped<Services.IOverviewService, Services.OverviewService>();
        services.AddScoped<Services.IWorkforcePlanningService, Services.WorkforcePlanningService>();
        services.AddScoped<Services.IHiringPipelineService, Services.HiringPipelineService>();
        services.AddScoped<Services.IEmployeeExperienceService, Services.EmployeeExperienceService>();

        services.AddScoped<Services.IInsightGenerationService, Services.InsightGenerationService>();
        services.AddSingleton<IAiClient, OpenAiClient>();

        return services;
    }

    public static IServiceCollection AddHrInsightsOpenAi(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<OpenAiOptions>(configuration.GetSection(OpenAiOptions.SectionName));
        return services;
    }
}
