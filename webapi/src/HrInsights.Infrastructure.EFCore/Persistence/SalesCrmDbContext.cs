using Microsoft.EntityFrameworkCore;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Persistence;

public sealed class HrInsightsDbContext : DbContext
{
    public HrInsightsDbContext(DbContextOptions<HrInsightsDbContext> options) : base(options)
    {
    }

    // Overview dashboard entities
    public DbSet<KpiSnapshot> KpiSnapshots => Set<KpiSnapshot>();
    public DbSet<KpiCard> KpiCards => Set<KpiCard>();
    public DbSet<OverviewRequisition> OverviewRequisitions => Set<OverviewRequisition>();
    public DbSet<ActivityTimelineEvent> ActivityTimelineEvents => Set<ActivityTimelineEvent>();
    public DbSet<OverviewAiInsight> OverviewAiInsights => Set<OverviewAiInsight>();
    public DbSet<OverviewActionPlan> OverviewActionPlans => Set<OverviewActionPlan>();

    // Workforce planning entities
    public DbSet<WorkforcePlan> WorkforcePlans => Set<WorkforcePlan>();
    public DbSet<WorkforceScenario> WorkforceScenarios => Set<WorkforceScenario>();
    public DbSet<WorkforceLineItem> WorkforceLineItems => Set<WorkforceLineItem>();
    public DbSet<ScenarioAssumption> ScenarioAssumptions => Set<ScenarioAssumption>();
    public DbSet<PlanningSnapshot> PlanningSnapshots => Set<PlanningSnapshot>();

    // Hiring pipeline entities
    public DbSet<Requisition> Requisitions => Set<Requisition>();
    public DbSet<RequisitionInterview> RequisitionInterviews => Set<RequisitionInterview>();
    public DbSet<RequisitionOffer> RequisitionOffers => Set<RequisitionOffer>();
    public DbSet<Candidate> Candidates => Set<Candidate>();

    // Employee experience entities
    public DbSet<SelfServiceRequest> SelfServiceRequests => Set<SelfServiceRequest>();
    public DbSet<PulseSurvey> PulseSurveys => Set<PulseSurvey>();
    public DbSet<PulseResponse> PulseResponses => Set<PulseResponse>();
    public DbSet<Recognition> Recognitions => Set<Recognition>();
    public DbSet<CareerDevelopmentPlan> CareerDevelopmentPlans => Set<CareerDevelopmentPlan>();
    public DbSet<LearningRecommendation> LearningRecommendations => Set<LearningRecommendation>();
    public DbSet<IssueReport> IssueReports => Set<IssueReport>();
    public DbSet<DelayConcern> DelayConcerns => Set<DelayConcern>();
    public DbSet<KanbanItem> KanbanItems => Set<KanbanItem>();
    public DbSet<NotificationItem> NotificationItems => Set<NotificationItem>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(HrInsightsDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
