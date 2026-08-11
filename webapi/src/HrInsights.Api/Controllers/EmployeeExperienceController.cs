using Microsoft.AspNetCore.Mvc;
using HrInsights.Application.Services;
using HrInsights.Contracts.EmployeeExperience;

namespace HrInsights.Api.Controllers;

[ApiController]
[Route("api/employee-experience")]
[Produces("application/json")]
[Tags("Employee Experience")]
public sealed class EmployeeExperienceController : ControllerBase
{
    private readonly IEmployeeExperienceService _service;

    // Hard-coded showcase current user; used when the caller is unauthenticated
    // and didn't pass an explicit identifier. In production this should be
    // derived from the auth principal.
    private const string DefaultEmployeeId = "emp_4521";

    public EmployeeExperienceController(IEmployeeExperienceService service) => _service = service;

    /// <summary>
    /// Resolves the effective user/employee id for an incoming request.
    /// Priority: explicit query param → authenticated NameIdentifier claim → default.
    /// </summary>
    private string ResolveUserId(string? explicitId)
    {
        if (!string.IsNullOrWhiteSpace(explicitId)) return explicitId;
        var claim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrWhiteSpace(claim)) return claim;
        return DefaultEmployeeId;
    }

    // ── 1. Self-Service Requests ─────────────────────────────────────

    [HttpGet("self-service")]
    [ProducesResponseType(typeof(IReadOnlyList<SelfServiceRequestDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<SelfServiceRequestDto>> GetSelfServiceRequests([FromQuery] string? employeeId = null)
        => Ok(_service.GetSelfServiceRequests(ResolveUserId(employeeId)));

    [HttpPost("self-service")]
    [ProducesResponseType(typeof(SelfServiceRequestDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateSelfServiceRequest([FromBody] CreateSelfServiceRequest request, CancellationToken cancellationToken)
    {
        var dto = await _service.CreateSelfServiceRequestAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetSelfServiceRequests), new { id = dto.Id }, dto);
    }

    // ── 2. Pulse Surveys ─────────────────────────────────────────────

    [HttpGet("pulse-surveys")]
    [ProducesResponseType(typeof(IReadOnlyList<PulseSurveyDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<PulseSurveyDto>> GetPulseSurveys()
        => Ok(_service.GetPulseSurveys());

    // ── 3. Pulse Responses ───────────────────────────────────────────

    [HttpGet("pulse-responses")]
    [ProducesResponseType(typeof(IReadOnlyList<PulseResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<IReadOnlyList<PulseResponseDto>> GetPulseResponses([FromQuery] string? pulseSurveyId)
    {
        if (string.IsNullOrWhiteSpace(pulseSurveyId))
            return BadRequest(new { error = "The pulseSurveyId query parameter is required." });
        return Ok(_service.GetPulseResponses(pulseSurveyId));
    }

    [HttpPost("pulse-responses")]
    [ProducesResponseType(typeof(PulseResponseDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> SubmitPulseResponse([FromBody] CreatePulseResponseRequest request, CancellationToken cancellationToken)
    {
        var dto = await _service.SubmitPulseResponseAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetPulseResponses), new { pulseSurveyId = dto.PulseSurveyId }, dto);
    }

    // ── 4. Recognitions ─────────────────────────────────────────────

    [HttpGet("recognitions")]
    [ProducesResponseType(typeof(IReadOnlyList<RecognitionDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<RecognitionDto>> GetRecognitions()
        => Ok(_service.GetRecognitions());

    [HttpPost("recognitions")]
    [ProducesResponseType(typeof(RecognitionDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateRecognition([FromBody] CreateRecognitionRequest request, CancellationToken cancellationToken)
    {
        var dto = await _service.CreateRecognitionAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetRecognitions), new { id = dto.Id }, dto);
    }

    // ── 5. Career Plans ────────────────────────────────────────────

    [HttpGet("career-plans")]
    [ProducesResponseType(typeof(IReadOnlyList<CareerDevelopmentPlanDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<CareerDevelopmentPlanDto>> GetCareerPlans([FromQuery] string? employeeId = null)
        => Ok(_service.GetCareerPlans(ResolveUserId(employeeId)));

    [HttpPatch("career-plans/{planId}/milestones/{milestoneId}")]
    [ProducesResponseType(typeof(CareerDevelopmentPlanDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMilestone(string planId, string milestoneId, [FromBody] UpdateMilestoneRequest request, CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateMilestoneAsync(planId, milestoneId, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    // ── 6. Learning Recommendations ──────────────────────────────

    [HttpGet("learning-recommendations")]
    [ProducesResponseType(typeof(IReadOnlyList<LearningRecommendationDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<LearningRecommendationDto>> GetLearningRecommendations([FromQuery] string? employeeId = null)
        => Ok(_service.GetLearningRecommendations(ResolveUserId(employeeId)));

    [HttpPatch("learning-recommendations/{id}")]
    [ProducesResponseType(typeof(LearningRecommendationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLearningStatus(string id, [FromBody] UpdateLearningRequest request, CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateLearningStatusAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    // ── 7. Issue Reports ─────────────────────────────────────────────

    [HttpGet("issues")]
    [ProducesResponseType(typeof(IReadOnlyList<IssueReportDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<IssueReportDto>> GetIssueReports([FromQuery] string? reportedBy = null)
        => Ok(_service.GetIssueReports(ResolveUserId(reportedBy)));

    [HttpPost("issues")]
    [ProducesResponseType(typeof(IssueReportDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateIssueReport([FromBody] CreateIssueReportRequest request, CancellationToken cancellationToken)
    {
        var dto = await _service.CreateIssueReportAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetIssueReports), new { id = dto.Id }, dto);
    }

    // ── 8. Delay Concerns ──────────────────────────────────────────

    [HttpGet("delays")]
    [ProducesResponseType(typeof(IReadOnlyList<DelayConcernDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<DelayConcernDto>> GetDelayConcerns([FromQuery] string? raisedBy = null)
        => Ok(_service.GetDelayConcerns(ResolveUserId(raisedBy)));

    [HttpPost("delays")]
    [ProducesResponseType(typeof(DelayConcernDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateDelayConcern([FromBody] CreateDelayConcernRequest request, CancellationToken cancellationToken)
    {
        var dto = await _service.CreateDelayConcernAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetDelayConcerns), new { id = dto.Id }, dto);
    }

    // ── 9. Kanban ──────────────────────────────────────────────────

    [HttpGet("kanban")]
    [ProducesResponseType(typeof(IReadOnlyList<KanbanItemDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<KanbanItemDto>> GetKanbanItems()
        => Ok(_service.GetKanbanItems());

    [HttpPatch("kanban/{id}/lane")]
    [ProducesResponseType(typeof(KanbanItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MoveKanbanItem(string id, [FromBody] UpdateKanbanLaneRequest request, CancellationToken cancellationToken)
    {
        var updated = await _service.MoveKanbanItemAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    // ── 10. Notifications ────────────────────────────────────────────

    [HttpGet("notifications")]
    [ProducesResponseType(typeof(IReadOnlyList<NotificationItemDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<NotificationItemDto>> GetNotifications([FromQuery] string? userId = null)
        => Ok(_service.GetNotifications(ResolveUserId(userId)));

    [HttpPatch("notifications/{id}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkNotificationRead(string id, CancellationToken cancellationToken)
        => await _service.MarkNotificationReadAsync(id, cancellationToken) ? NoContent() : NotFound();

    [HttpPatch("notifications/read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAllNotificationsRead([FromQuery] string? userId, CancellationToken cancellationToken)
    {
        await _service.MarkAllNotificationsReadAsync(ResolveUserId(userId), cancellationToken);
        return NoContent();
    }

    // ── 11. Chat Messages ──────────────────────────────────────────

    [HttpGet("chat-messages")]
    [ProducesResponseType(typeof(IReadOnlyList<ChatMessageDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<IReadOnlyList<ChatMessageDto>> GetChatMessages([FromQuery] string? threadId)
    {
        if (string.IsNullOrWhiteSpace(threadId))
            return BadRequest(new { error = "The threadId query parameter is required." });
        return Ok(_service.GetChatMessages(threadId));
    }

    [HttpPost("chat-messages")]
    [ProducesResponseType(typeof(ChatMessageDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> SendChatMessage([FromBody] CreateChatMessageRequest request, CancellationToken cancellationToken)
    {
        var dto = await _service.SendChatMessageAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetChatMessages), new { threadId = dto.ThreadId }, dto);
    }
}
