using Microsoft.AspNetCore.Mvc;
using HrInsights.Application.Services;
using HrInsights.Contracts.Dashboard;

namespace HrInsights.Api.Controllers;

[ApiController]
[Route("api/overview")]
[Produces("application/json")]
[Tags("Overview")]
public sealed class OverviewController : ControllerBase
{
    private readonly IOverviewService overviewService;
    private readonly IInsightGenerationService insightGenerationService;

    public OverviewController(IOverviewService overviewService, IInsightGenerationService insightGenerationService)
    {
        this.overviewService = overviewService;
        this.insightGenerationService = insightGenerationService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(OverviewResponse), StatusCodes.Status200OK)]
    public ActionResult<OverviewResponse> Get()
        => Ok(overviewService.GetOverview());

    [HttpGet("kpi")]
    [ProducesResponseType(typeof(KpiDto), StatusCodes.Status200OK)]
    public ActionResult<KpiDto> GetKpi()
        => Ok(overviewService.GetOverview().Kpi);

    [HttpGet("kpi-cards")]
    [ProducesResponseType(typeof(IReadOnlyList<KpiCardDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<KpiCardDto>> GetKpiCards()
        => Ok(overviewService.GetOverview().KpiCards);

    [HttpGet("requisitions")]
    [ProducesResponseType(typeof(IReadOnlyList<ActiveRequisitionDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<ActiveRequisitionDto>> GetRequisitions()
        => Ok(overviewService.GetOverview().Requisitions);

    [HttpGet("activity-timeline")]
    [ProducesResponseType(typeof(IReadOnlyList<ActivityTimelineEventDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<ActivityTimelineEventDto>> GetActivityTimeline()
        => Ok(overviewService.GetOverview().ActivityTimeline);

    [HttpGet("employee/{employeeId}/ai-insight")]
    [ProducesResponseType(typeof(AiInsightDto), StatusCodes.Status200OK)]
    public ActionResult<AiInsightDto> GetAiInsight(string employeeId)
        => Ok(overviewService.GetOverview().AiInsight);

    [HttpPost("employee/{employeeId}/generate-insight")]
    [ProducesResponseType(typeof(AiInsightDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<AiInsightDto>> GenerateAiInsight(string employeeId, CancellationToken cancellationToken)
    {
        var insight = await insightGenerationService.GenerateEmployeeInsightAsync(employeeId, cancellationToken);

        if (insight is null)
        {
            return Problem(
                title: "AI insight generation is unavailable.",
                detail: "OpenAI integration is disabled or misconfigured. Enable it in appsettings to use this feature.",
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        return Ok(insight);
    }

    [HttpGet("action-plans")]
    [ProducesResponseType(typeof(IReadOnlyList<ActionPlanDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<ActionPlanDto>> GetActionPlans()
        => Ok(overviewService.GetOverview().ActionPlans);

    [HttpPost("action-plans")]
    [ProducesResponseType(typeof(ActionPlanDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ActionPlanDto>> CreateActionPlan(
        [FromBody] ActionPlanCreateRequest request,
        CancellationToken cancellationToken)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Title))
        {
            ModelState.AddModelError(nameof(request.Title), "Title is required.");
            return ValidationProblem(ModelState);
        }

        var created = await overviewService.CreateActionPlanAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetActionPlans), new { }, created);
    }
}