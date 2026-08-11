// Real HTTP service for the Employee Experience screen.
//
// BaseAddress is configured in Program.cs:
//   builder.Services.AddHttpClient<IEmployeeExperienceService, EmployeeExperienceService>(
//       c => c.BaseAddress = new Uri(builder.Configuration["Api:BaseUrl"] ?? "https://localhost:59527"))
//
// All endpoint shapes, request bodies, and response types are defined in
//   src/datamodels/employee-experience.txt
// and implemented by
//   backend/src/SalesCrm.Api/Controllers/EmployeeExperienceController.cs
//
// The DTOs in `Components/Models/EmployeeExperience.cs` mirror the
// controller's wire format 1:1 via [JsonPropertyName] attributes, so
// System.Net.Http.Json deserializes the responses directly into records.

using System.Net.Http.Json;
using BlazorWebApp.Components.Models;

namespace BlazorWebApp.Services;

public interface IEmployeeExperienceService
{
    // 1. Self-service
    Task<IReadOnlyList<SelfServiceRequest>> GetSelfServiceRequestsAsync(string? employeeId = null, CancellationToken ct = default);
    Task<SelfServiceRequest> CreateSelfServiceRequestAsync(SelfServiceRequestInput input, CancellationToken ct = default);

    // 2. Pulse surveys
    Task<IReadOnlyList<PulseSurvey>> GetPulseSurveysAsync(CancellationToken ct = default);

    // 3. Pulse responses
    Task<IReadOnlyList<PulseResponse>> GetPulseResponsesAsync(string pulseSurveyId, CancellationToken ct = default);
    Task<PulseResponse> SubmitPulseResponseAsync(string pulseSurveyId, decimal sentiment, string? comment = null, CancellationToken ct = default);

    // 4. Recognitions
    Task<IReadOnlyList<Recognition>> GetRecognitionsAsync(CancellationToken ct = default);
    Task<Recognition> CreateRecognitionAsync(RecognitionInput input, CancellationToken ct = default);

    // 5. Career plans
    Task<IReadOnlyList<CareerDevelopmentPlan>> GetCareerPlansAsync(string? employeeId = null, CancellationToken ct = default);
    Task<CareerDevelopmentPlan?> UpdateMilestoneStatusAsync(string planId, string milestoneId, string status, CancellationToken ct = default);

    // 6. Learning recommendations
    Task<IReadOnlyList<LearningRecommendation>> GetLearningRecommendationsAsync(string? employeeId = null, CancellationToken ct = default);
    Task<LearningRecommendation?> UpdateLearningStatusAsync(string id, string status, CancellationToken ct = default);

    // 7. Issue reports
    Task<IReadOnlyList<IssueReport>> GetIssueReportsAsync(string? reportedBy = null, CancellationToken ct = default);
    Task<IssueReport> CreateIssueReportAsync(IssueReportInput input, CancellationToken ct = default);

    // 8. Delay concerns
    Task<IReadOnlyList<DelayConcern>> GetDelayConcernsAsync(string? raisedBy = null, CancellationToken ct = default);
    Task<DelayConcern> CreateDelayConcernAsync(DelayConcernInput input, CancellationToken ct = default);

    // 9. Kanban
    Task<IReadOnlyList<KanbanItem>> GetKanbanItemsAsync(CancellationToken ct = default);
    Task<KanbanItem?> MoveKanbanItemAsync(string id, string lane, CancellationToken ct = default);

    // 10. Notifications
    Task<IReadOnlyList<NotificationItem>> GetNotificationsAsync(string? userId = null, CancellationToken ct = default);
    Task MarkNotificationReadAsync(string id, CancellationToken ct = default);
    Task MarkAllNotificationsReadAsync(string? userId = null, CancellationToken ct = default);

    // 11. Chat messages
    Task<IReadOnlyList<ChatMessage>> GetChatMessagesAsync(string threadId, CancellationToken ct = default);
    Task<ChatMessage> SendChatMessageAsync(string threadId, string body, string? toId = null, CancellationToken ct = default);
}

public sealed class EmployeeExperienceService : IEmployeeExperienceService
{
    private readonly HttpClient _http;

    public EmployeeExperienceService(HttpClient http)
    {
        _http = http;
    }

    // ── 1. Self-Service ─────────────────────────────────────────────

    public async Task<IReadOnlyList<SelfServiceRequest>> GetSelfServiceRequestsAsync(string? employeeId = null, CancellationToken ct = default)
        => await _http.GetFromJsonAsync<List<SelfServiceRequest>>(WithUserQuery("self-service", employeeId), ct) ?? new();

    public async Task<SelfServiceRequest> CreateSelfServiceRequestAsync(SelfServiceRequestInput input, CancellationToken ct = default)
    {
        var response = await _http.PostAsJsonAsync("api/employee-experience/self-service", input, cancellationToken: ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<SelfServiceRequest>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Empty response from POST /api/employee-experience/self-service");
    }

    // ── 2. Pulse Surveys ────────────────────────────────────────────

    public async Task<IReadOnlyList<PulseSurvey>> GetPulseSurveysAsync(CancellationToken ct = default)
        => await _http.GetFromJsonAsync<List<PulseSurvey>>("api/employee-experience/pulse-surveys", ct) ?? new();

    // ── 3. Pulse Responses ──────────────────────────────────────────

    public async Task<IReadOnlyList<PulseResponse>> GetPulseResponsesAsync(string pulseSurveyId, CancellationToken ct = default)
    {
        var qs = $"?pulseSurveyId={Uri.EscapeDataString(pulseSurveyId)}";
        return await _http.GetFromJsonAsync<List<PulseResponse>>($"api/employee-experience/pulse-responses{qs}", ct) ?? new();
    }

    public async Task<PulseResponse> SubmitPulseResponseAsync(string pulseSurveyId, decimal sentiment, string? comment = null, CancellationToken ct = default)
    {
        var payload = new PulseResponseInput(pulseSurveyId, sentiment, comment);
        var response = await _http.PostAsJsonAsync("api/employee-experience/pulse-responses", payload, cancellationToken: ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<PulseResponse>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Empty response from POST pulse-responses");
    }

    // ── 4. Recognitions ─────────────────────────────────────────────

    public async Task<IReadOnlyList<Recognition>> GetRecognitionsAsync(CancellationToken ct = default)
        => await _http.GetFromJsonAsync<List<Recognition>>("api/employee-experience/recognitions", ct) ?? new();

    public async Task<Recognition> CreateRecognitionAsync(RecognitionInput input, CancellationToken ct = default)
    {
        var response = await _http.PostAsJsonAsync("api/employee-experience/recognitions", input, cancellationToken: ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<Recognition>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Empty response from POST recognitions");
    }

    // ── 5. Career Plans ─────────────────────────────────────────────

    public async Task<IReadOnlyList<CareerDevelopmentPlan>> GetCareerPlansAsync(string? employeeId = null, CancellationToken ct = default)
        => await _http.GetFromJsonAsync<List<CareerDevelopmentPlan>>(WithUserQuery("career-plans", employeeId), ct) ?? new();

    public async Task<CareerDevelopmentPlan?> UpdateMilestoneStatusAsync(string planId, string milestoneId, string status, CancellationToken ct = default)
    {
        var path = $"api/employee-experience/career-plans/{Uri.EscapeDataString(planId)}/milestones/{Uri.EscapeDataString(milestoneId)}";
        var response = await _http.PatchAsJsonAsync(path, new UpdateMilestoneInput(status), cancellationToken: ct);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<CareerDevelopmentPlan>(cancellationToken: ct);
    }

    // ── 6. Learning Recommendations ─────────────────────────────────

    public async Task<IReadOnlyList<LearningRecommendation>> GetLearningRecommendationsAsync(string? employeeId = null, CancellationToken ct = default)
        => await _http.GetFromJsonAsync<List<LearningRecommendation>>(WithUserQuery("learning-recommendations", employeeId), ct) ?? new();

    public async Task<LearningRecommendation?> UpdateLearningStatusAsync(string id, string status, CancellationToken ct = default)
    {
        var path = $"api/employee-experience/learning-recommendations/{Uri.EscapeDataString(id)}";
        var response = await _http.PatchAsJsonAsync(path, new UpdateLearningInput(status), cancellationToken: ct);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<LearningRecommendation>(cancellationToken: ct);
    }

    // ── 7. Issue Reports ────────────────────────────────────────────

    public async Task<IReadOnlyList<IssueReport>> GetIssueReportsAsync(string? reportedBy = null, CancellationToken ct = default)
        => await _http.GetFromJsonAsync<List<IssueReport>>(WithUserQuery("issues", reportedBy, "reportedBy"), ct) ?? new();

    public async Task<IssueReport> CreateIssueReportAsync(IssueReportInput input, CancellationToken ct = default)
    {
        var response = await _http.PostAsJsonAsync("api/employee-experience/issues", input, cancellationToken: ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<IssueReport>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Empty response from POST issues");
    }

    // ── 8. Delay Concerns ───────────────────────────────────────────

    public async Task<IReadOnlyList<DelayConcern>> GetDelayConcernsAsync(string? raisedBy = null, CancellationToken ct = default)
        => await _http.GetFromJsonAsync<List<DelayConcern>>(WithUserQuery("delays", raisedBy, "raisedBy"), ct) ?? new();

    public async Task<DelayConcern> CreateDelayConcernAsync(DelayConcernInput input, CancellationToken ct = default)
    {
        var response = await _http.PostAsJsonAsync("api/employee-experience/delays", input, cancellationToken: ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<DelayConcern>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Empty response from POST delays");
    }

    // ── 9. Kanban ───────────────────────────────────────────────────

    public async Task<IReadOnlyList<KanbanItem>> GetKanbanItemsAsync(CancellationToken ct = default)
        => await _http.GetFromJsonAsync<List<KanbanItem>>("api/employee-experience/kanban", ct) ?? new();

    public async Task<KanbanItem?> MoveKanbanItemAsync(string id, string lane, CancellationToken ct = default)
    {
        var path = $"api/employee-experience/kanban/{Uri.EscapeDataString(id)}/lane";
        var response = await _http.PatchAsJsonAsync(path, new UpdateKanbanLaneInput(lane), cancellationToken: ct);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound) return null;
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<KanbanItem>(cancellationToken: ct);
    }

    // ── 10. Notifications ───────────────────────────────────────────

    public async Task<IReadOnlyList<NotificationItem>> GetNotificationsAsync(string? userId = null, CancellationToken ct = default)
        => await _http.GetFromJsonAsync<List<NotificationItem>>(WithUserQuery("notifications", userId), ct) ?? new();

    public async Task MarkNotificationReadAsync(string id, CancellationToken ct = default)
    {
        var path = $"api/employee-experience/notifications/{Uri.EscapeDataString(id)}/read";
        var response = await _http.PatchAsync(path, content: null, cancellationToken: ct);
        response.EnsureSuccessStatusCode();
    }

    public async Task MarkAllNotificationsReadAsync(string? userId = null, CancellationToken ct = default)
    {
        var response = await _http.PatchAsync(WithUserQuery("notifications/read-all", userId), content: null, cancellationToken: ct);
        response.EnsureSuccessStatusCode();
    }

    // ── 11. Chat Messages ───────────────────────────────────────────

    public async Task<IReadOnlyList<ChatMessage>> GetChatMessagesAsync(string threadId, CancellationToken ct = default)
    {
        var qs = $"?threadId={Uri.EscapeDataString(threadId)}";
        return await _http.GetFromJsonAsync<List<ChatMessage>>($"api/employee-experience/chat-messages{qs}", ct) ?? new();
    }

    public async Task<ChatMessage> SendChatMessageAsync(string threadId, string body, string? toId = null, CancellationToken ct = default)
    {
        var payload = new ChatMessageInput(threadId, body, toId);
        var response = await _http.PostAsJsonAsync("api/employee-experience/chat-messages", payload, cancellationToken: ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<ChatMessage>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Empty response from POST chat-messages");
    }

    // ── Helpers ─────────────────────────────────────────────────────

    /// <summary>
    /// Appends a user-identifier query parameter to a list endpoint. The
    /// controller treats the param as optional — see ResolveUserId in
    /// EmployeeExperienceController.cs — so this is best-effort: omit the
    /// param entirely when the caller has no employee/user context.
    /// </summary>
    private static string WithUserQuery(string path, string? userId, string paramName = "userId")
    {
        if (string.IsNullOrWhiteSpace(userId)) return $"api/employee-experience/{path}";
        return $"api/employee-experience/{path}?{paramName}={Uri.EscapeDataString(userId)}";
    }
}
