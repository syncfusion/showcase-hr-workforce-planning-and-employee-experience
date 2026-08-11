//using Bogus;
//using Microsoft.EntityFrameworkCore;
//using HrInsights.Infrastructure.Abstractions.Services;
//using HrInsights.Infrastructure.EFCore.Persistence;
//using HrInsights.SeedData;

//namespace HrInsights.Infrastructure.EFCore.Services;

//public sealed class CrmSeedDataGenerator : ICrmSeedDataGenerator
//{
//    private readonly HrInsightsDbContext dbContext;
//    private readonly DatabaseSeeder databaseSeeder;

//    public CrmSeedDataGenerator(HrInsightsDbContext dbContext)
//    {
//        this.dbContext = dbContext;
//        databaseSeeder = new DatabaseSeeder(new CrmSeedOptions());
//    }

//    public async Task GenerateAsync(CancellationToken cancellationToken = default)
//    {
//        var seedData = databaseSeeder.Generate();

//        // C#
//await dbContext.Database.ExecuteSqlRawAsync(
//    "TRUNCATE TABLE \"ai_recommendations\", \"activities\", \"forecasts\", \"sales_documents\", \"quotes\", \"contacts\", \"opportunities\", \"accounts\" RESTART IDENTITY CASCADE",
//    cancellationToken);
//        //await dbContext.Database.ExecuteSqlRawAsync("TRUNCATE TABLE \"AiRecommendations\", \"Activities\", \"Forecasts\", \"SalesDocuments\", \"Quotes\", \"Contacts\", \"Opportunities\", \"Accounts\" RESTART IDENTITY CASCADE", cancellationToken);

//        //dbContext.AddRange(seedData.Accounts);
//        //dbContext.AddRange(seedData.Contacts);
//        //dbContext.AddRange(seedData.Opportunities);
//        //dbContext.AddRange(seedData.Activities);
//        //dbContext.AddRange(seedData.Forecasts);
//        //dbContext.AddRange(seedData.SalesDocuments);
//        //dbContext.AddRange(seedData.AiRecommendations);

//        //await dbContext.SaveChangesAsync(cancellationToken);

//        dbContext.Accounts.AddRange(seedData.Accounts);
//        dbContext.Contacts.AddRange(seedData.Contacts);
//        dbContext.Opportunities.AddRange(seedData.Opportunities);

//        await dbContext.SaveChangesAsync(cancellationToken);

//        // Now generate Activities using actual saved IDs
//        var accountIds = await dbContext.Accounts.Select(x => x.Id).ToListAsync(cancellationToken);
//        var contactIds = await dbContext.Contacts.Select(x => x.Id).ToListAsync(cancellationToken);
//        var opportunityIds = await dbContext.Opportunities.Select(x => x.Id).ToListAsync(cancellationToken);

//        //var activities = activityFaker.Generate(100);

//        //foreach (var activity in activities)
//        //{
//        //    activity.AccountId = faker.PickRandom(accountIds);
//        //    activity.ContactId = faker.PickRandom(contactIds);
//        //    activity.OpportunityId = faker.PickRandom(opportunityIds);
//        //}

//        //dbContext.Activities.AddRange(seedData.Activities);
//        dbContext.AddRange(seedData.Activities);
//        dbContext.AddRange(seedData.Forecasts);
//        dbContext.AddRange(seedData.SalesDocuments);
//        dbContext.AddRange(seedData.AiRecommendations);

//        await dbContext.SaveChangesAsync(cancellationToken);
//    }
//}
using Microsoft.EntityFrameworkCore;
using HrInsights.Infrastructure.Abstractions.Services;
using HrInsights.Infrastructure.EFCore.Persistence;
using HrInsights.SeedData;

namespace HrInsights.Infrastructure.EFCore.Services;

public sealed class CrmSeedDataGenerator : ICrmSeedDataGenerator
{
    private readonly HrInsightsDbContext dbContext;
    private readonly DatabaseSeeder databaseSeeder;

    public CrmSeedDataGenerator(
        HrInsightsDbContext dbContext,
        DatabaseSeeder databaseSeeder)
    {
        this.dbContext = dbContext;
        this.databaseSeeder = databaseSeeder;
    }

    public async Task GenerateAsync(CancellationToken cancellationToken = default)
    {
        var seedData = databaseSeeder.Generate();

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        await dbContext.Database.ExecuteSqlRawAsync("""
            TRUNCATE TABLE
                "employee_experience_career_plan_milestones",
                "employee_experience_career_plans",
                "employee_experience_pulse_survey_themes",
                "employee_experience_pulse_surveys",
                "employee_experience_pulse_responses",
                "employee_experience_learning_recommendations",
                "employee_experience_chat_messages",
                "employee_experience_notifications",
                "employee_experience_kanban_items",
                "employee_experience_delay_concerns",
                "employee_experience_issue_reports",
                "employee_experience_recognitions",
                "employee_experience_self_service_requests",
                "planning_snapshots",
                "scenario_assumptions",
                "workforce_line_items",
                "workforce_scenarios",
                "workforce_plans",
                "overview_ai_insights",
                "overview_activity_timeline_events",
                "overview_action_plans",
                "overview_action_items",
                "overview_kpi_trend_points",
                "overview_kpi_cards",
                "overview_kpi_snapshots",
                "overview_requisitions",
                "hiring_pipeline_candidates",
                "hiring_pipeline_offers",
                "hiring_pipeline_interviews",
                "hiring_pipeline_requisitions"
            RESTART IDENTITY CASCADE;
            """, cancellationToken);

        dbContext.ChangeTracker.Clear();

        // 1. Save Overview dashboard seed data
        dbContext.KpiSnapshots.Add(seedData.KpiSnapshot);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.KpiCards.AddRange(seedData.KpiCards);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.OverviewRequisitions.AddRange(seedData.OverviewRequisitions);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.ActivityTimelineEvents.AddRange(seedData.ActivityTimelineEvents);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.OverviewAiInsights.Add(seedData.OverviewAiInsight);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.OverviewActionPlans.AddRange(seedData.OverviewActionPlans);
        await dbContext.SaveChangesAsync(cancellationToken);

        // 6. Save Workforce Planning seed data
        dbContext.WorkforcePlans.AddRange(seedData.WorkforcePlans);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.WorkforceScenarios.AddRange(seedData.WorkforceScenarios);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.WorkforceLineItems.AddRange(seedData.WorkforceLineItems);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.ScenarioAssumptions.AddRange(seedData.ScenarioAssumptions);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.PlanningSnapshots.AddRange(seedData.PlanningSnapshots);
        await dbContext.SaveChangesAsync(cancellationToken);

        // 7. Save Hiring Pipeline seed data (parents before children)
        dbContext.Requisitions.AddRange(seedData.HiringRequisitions);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.RequisitionInterviews.AddRange(seedData.HiringInterviews);
        dbContext.RequisitionOffers.AddRange(seedData.HiringOffers);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.Candidates.AddRange(seedData.HiringCandidates);
        await dbContext.SaveChangesAsync(cancellationToken);

        // 8. Save Employee Experience seed data
        // Parents (surveys, plans) first so owned children can be inserted.
        dbContext.SelfServiceRequests.AddRange(seedData.SelfServiceRequests);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.PulseSurveys.AddRange(seedData.PulseSurveys);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.PulseResponses.AddRange(seedData.PulseResponses);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.Recognitions.AddRange(seedData.Recognitions);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.CareerDevelopmentPlans.AddRange(seedData.CareerDevelopmentPlans);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.LearningRecommendations.AddRange(seedData.LearningRecommendations);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.IssueReports.AddRange(seedData.IssueReports);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.DelayConcerns.AddRange(seedData.DelayConcerns);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.KanbanItems.AddRange(seedData.KanbanItems);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.NotificationItems.AddRange(seedData.Notifications);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.ChatMessages.AddRange(seedData.ChatMessages);
        await dbContext.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);
    }
}