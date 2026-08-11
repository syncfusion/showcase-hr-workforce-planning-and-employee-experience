using Microsoft.AspNetCore.Mvc;
using HrInsights.Application.Services;
using HrInsights.Contracts.WorkforcePlanning;

namespace HrInsights.Api.Controllers;

[ApiController]
[Route("api/workforce-planning")]
[Produces("application/json")]
[Tags("Workforce Planning")]
public sealed class WorkforcePlanningController : ControllerBase
{
    private readonly IWorkforcePlanningService _service;

    public WorkforcePlanningController(IWorkforcePlanningService service) => _service = service;

    [HttpGet("plans")]
    [ProducesResponseType(typeof(IReadOnlyList<WorkforcePlanDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<WorkforcePlanDto>> GetPlans()
        => Ok(_service.GetWorkforcePlans());

    [HttpGet("scenarios")]
    [ProducesResponseType(typeof(IReadOnlyList<WorkforceScenarioDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<WorkforceScenarioDto>> GetScenarios([FromQuery] string planId)
        => Ok(_service.GetScenarios(planId));

    [HttpGet("line-items")]
    [ProducesResponseType(typeof(IReadOnlyList<WorkforceLineItemDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<WorkforceLineItemDto>> GetLineItems([FromQuery] string? scenarioId = null)
        => Ok(_service.GetLineItems(scenarioId));

    [HttpGet("assumptions")]
    [ProducesResponseType(typeof(IReadOnlyList<ScenarioAssumptionDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<ScenarioAssumptionDto>> GetAssumptions([FromQuery] string scenarioId)
        => Ok(_service.GetAssumptions(scenarioId));

    [HttpGet("snapshots")]
    [ProducesResponseType(typeof(IReadOnlyList<PlanningSnapshotDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<PlanningSnapshotDto>> GetSnapshots([FromQuery] string planId)
        => Ok(_service.GetSnapshots(planId));
}
