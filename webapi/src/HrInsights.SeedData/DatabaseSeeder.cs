namespace HrInsights.SeedData;

public sealed class DatabaseSeeder
{
    private readonly CrmSeedOptions _options;
    private readonly OverviewSeedGenerator _overviewGenerator;
    private readonly WorkforcePlanningSeedGenerator _workforcePlanGenerator;
    private readonly HiringPipelineSeedGenerator _hiringGenerator;
    private readonly CandidateSeedGenerator _candidateGenerator;
    private readonly EmployeeExperienceSeedGenerator _employeeExperienceGenerator;

    public DatabaseSeeder(CrmSeedOptions options)
    {
        _options = options;
        _overviewGenerator = new OverviewSeedGenerator();
        _workforcePlanGenerator = new WorkforcePlanningSeedGenerator();
        _hiringGenerator = new HiringPipelineSeedGenerator();
        _candidateGenerator = new CandidateSeedGenerator();
        _employeeExperienceGenerator = new EmployeeExperienceSeedGenerator();
    }

    public CrmSeedData Generate()
    {
        var kpiSnapshot = _overviewGenerator.CreateKpiSnapshot();
        var kpiCards = _overviewGenerator.CreateKpiCards();
        var overviewRequisitions = _overviewGenerator.CreateRequisitions();
        var timelineEvents = _overviewGenerator.CreateTimelineEvents();
        var aiInsight = _overviewGenerator.CreateAiInsight();
        var actionPlans = _overviewGenerator.CreateActionPlans();

        var workforcePlans = _workforcePlanGenerator.CreatePlans();
        var workforceScenarios = _workforcePlanGenerator.CreateScenarios();
        var workforceLineItems = _workforcePlanGenerator.CreateLineItems();
        var scenarioAssumptions = _workforcePlanGenerator.CreateAssumptions();
        var planningSnapshots = _workforcePlanGenerator.CreateSnapshots();

        var hiringRequisitions = _hiringGenerator.CreateRequisitions();
        var hiringInterviews = _hiringGenerator.CreateInterviews(hiringRequisitions);
        var hiringOffers = _hiringGenerator.CreateOffers(hiringRequisitions);
        var hiringCandidates = _candidateGenerator.CreateCandidates(hiringRequisitions);

        var selfService = _employeeExperienceGenerator.CreateSelfServiceRequests();
        var pulseSurveys = _employeeExperienceGenerator.CreatePulseSurveys();
        var pulseResponses = _employeeExperienceGenerator.CreatePulseResponses();
        var recognitions = _employeeExperienceGenerator.CreateRecognitions();
        var careerPlans = _employeeExperienceGenerator.CreateCareerPlans();
        var learning = _employeeExperienceGenerator.CreateLearningRecommendations();
        var issues = _employeeExperienceGenerator.CreateIssueReports();
        var delays = _employeeExperienceGenerator.CreateDelayConcerns();
        var kanban = _employeeExperienceGenerator.CreateKanbanItems();
        var notifications = _employeeExperienceGenerator.CreateNotifications();
        var chat = _employeeExperienceGenerator.CreateChatMessages();

        return new CrmSeedData(
            kpiSnapshot, kpiCards, overviewRequisitions,
            timelineEvents, aiInsight, actionPlans,
            workforcePlans, workforceScenarios, workforceLineItems,
            scenarioAssumptions, planningSnapshots,
            hiringRequisitions, hiringInterviews, hiringOffers,
            hiringCandidates,
            selfService, pulseSurveys, pulseResponses, recognitions,
            careerPlans, learning, issues, delays, kanban,
            notifications, chat);
    }

    public Task GenerateAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        _ = Generate();
        return Task.CompletedTask;
    }
}
