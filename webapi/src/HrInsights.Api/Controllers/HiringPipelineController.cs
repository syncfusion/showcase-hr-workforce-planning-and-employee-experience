using Microsoft.AspNetCore.Mvc;
using HrInsights.Application.Services;
using HrInsights.Contracts.HiringPipeline;

namespace HrInsights.Api.Controllers;

[ApiController]
[Route("api/hiring-pipeline")]
[Produces("application/json")]
[Tags("Hiring Pipeline")]
public sealed class HiringPipelineController : ControllerBase
{
    private readonly IHiringPipelineService _service;

    public HiringPipelineController(IHiringPipelineService service) => _service = service;

    // ── 1. Requisitions ───────────────────────────────────────────

    [HttpGet("requisitions")]
    [ProducesResponseType(typeof(IReadOnlyList<RequisitionDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<RequisitionDto>> GetRequisitions(
        [FromQuery] string? department = null,
        [FromQuery] string? location = null,
        [FromQuery] string? priority = null)
        => Ok(_service.GetRequisitions(department, location, priority));

    [HttpPost("requisitions")]
    [ProducesResponseType(typeof(RequisitionDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateRequisition([FromBody] CreateRequisitionRequest request, CancellationToken cancellationToken)
    {
        var dto = await _service.CreateRequisitionAsync(request, cancellationToken);
        return CreatedAtAction(
            nameof(GetRequisitions),
            new { id = dto.Id },
            dto);
    }

    [HttpPatch("requisitions/{id}/status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateStatusRequest request, CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateStatusAsync(id, request, cancellationToken);
        return updated ? NoContent() : NotFound();
    }

    // ── 2. Filter Lookups ─────────────────────────────────────────

    [HttpGet("departments")]
    [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<string>> GetDepartments()
        => Ok(_service.GetDepartments());

    [HttpGet("locations")]
    [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<string>> GetLocations()
        => Ok(_service.GetLocations());

    // ── 3. Interviews & Offers (service layer, not wired into UI today) ─

    [HttpPost("interviews")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ScheduleInterview([FromBody] ScheduleInterviewRequest request, CancellationToken cancellationToken)
    {
        await _service.ScheduleInterviewAsync(request, cancellationToken);
        return NoContent();
    }

    [HttpPost("offers")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RecordOffer([FromBody] RecordOfferRequest request, CancellationToken cancellationToken)
    {
        await _service.RecordOfferAsync(request, cancellationToken);
        return NoContent();
    }

    // ── 4. Candidates (pipeline list / kanban) ─────────────────────

    [HttpGet("candidates")]
    [ProducesResponseType(typeof(PagedCandidatesDto), StatusCodes.Status200OK)]
    public ActionResult<PagedCandidatesDto> GetCandidates(
        [FromQuery] string? status = null,
        [FromQuery] string? requisitionId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sort = null)
    {
        var result = _service.GetCandidates(status, requisitionId, page, pageSize, sort);
        return Ok(result);
    }

    [HttpGet("candidates/counts")]
    [ProducesResponseType(typeof(CandidateCountsDto), StatusCodes.Status200OK)]
    public ActionResult<CandidateCountsDto> GetCandidateCounts()
        => Ok(_service.GetCandidateCounts());

    [HttpGet("candidates/{id}")]
    [ProducesResponseType(typeof(CandidateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<CandidateDto> GetCandidate(string id)
    {
        var dto = _service.GetCandidate(id);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPatch("candidates/{id}/status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCandidateStatus(string id, [FromBody] UpdateCandidateStatusRequest request, CancellationToken cancellationToken)
        => await _service.UpdateCandidateStatusAsync(id, request, cancellationToken) ? NoContent() : NotFound();

    [HttpPost("candidates/{id}/reject")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectCandidate(string id, CancellationToken cancellationToken)
        => await _service.RejectCandidateAsync(id, cancellationToken) ? NoContent() : NotFound();
}
