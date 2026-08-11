using HrInsights.Domain.Entities;

namespace HrInsights.SeedData;

public sealed record CrmSeedData(
    KpiSnapshot KpiSnapshot,
    IReadOnlyList<KpiCard> KpiCards,
    IReadOnlyList<OverviewRequisition> OverviewRequisitions,
    IReadOnlyList<ActivityTimelineEvent> ActivityTimelineEvents,
    OverviewAiInsight OverviewAiInsight,
    IReadOnlyList<OverviewActionPlan> OverviewActionPlans,
    IReadOnlyList<WorkforcePlan> WorkforcePlans,
    IReadOnlyList<WorkforceScenario> WorkforceScenarios,
    IReadOnlyList<WorkforceLineItem> WorkforceLineItems,
    IReadOnlyList<ScenarioAssumption> ScenarioAssumptions,
    IReadOnlyList<PlanningSnapshot> PlanningSnapshots,
    IReadOnlyList<Requisition> HiringRequisitions,
    IReadOnlyList<RequisitionInterview> HiringInterviews,
    IReadOnlyList<RequisitionOffer> HiringOffers,
    IReadOnlyList<Candidate> HiringCandidates,
    IReadOnlyList<SelfServiceRequest> SelfServiceRequests,
    IReadOnlyList<PulseSurvey> PulseSurveys,
    IReadOnlyList<PulseResponse> PulseResponses,
    IReadOnlyList<Recognition> Recognitions,
    IReadOnlyList<CareerDevelopmentPlan> CareerDevelopmentPlans,
    IReadOnlyList<LearningRecommendation> LearningRecommendations,
    IReadOnlyList<IssueReport> IssueReports,
    IReadOnlyList<DelayConcern> DelayConcerns,
    IReadOnlyList<KanbanItem> KanbanItems,
    IReadOnlyList<NotificationItem> Notifications,
    IReadOnlyList<ChatMessage> ChatMessages);
