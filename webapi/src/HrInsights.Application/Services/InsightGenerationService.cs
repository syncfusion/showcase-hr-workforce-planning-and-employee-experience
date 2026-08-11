using System.Text.Json;
using HrInsights.Application.Ai;
using HrInsights.Contracts.Dashboard;
using HrInsights.Domain.Entities;
using HrInsights.Infrastructure.Abstractions.Repositories;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HrInsights.Application.Services;

/// <summary>
/// Generates AI-powered employee insights from HR data using an LLM.
/// </summary>
public interface IInsightGenerationService
{
    /// <summary>
    /// Generates (or regenerates) an <see cref="AiInsightDto"/> for the given employee.
    /// </summary>
    /// <param name="employeeId">The employee identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The generated insight, or null if AI is disabled.</returns>
    Task<AiInsightDto?> GenerateEmployeeInsightAsync(string employeeId, CancellationToken cancellationToken = default);
}

public sealed class InsightGenerationService : IInsightGenerationService
{
    private readonly IAiClient _aiClient;
    private readonly IReadRepository<ActivityTimelineEvent, Guid> _timelineRepository;
    private readonly IReadRepository<PulseResponse, Guid> _pulseResponseRepository;
    private readonly IReadRepository<CareerDevelopmentPlan, Guid> _careerPlanRepository;
    private readonly IReadRepository<Recognition, Guid> _recognitionRepository;
    private readonly IReadRepository<SelfServiceRequest, Guid> _selfServiceRepository;
    private readonly IOptions<OpenAiOptions> _options;
    private readonly ILogger<InsightGenerationService> _logger;

    public InsightGenerationService(
        IAiClient aiClient,
        IReadRepository<ActivityTimelineEvent, Guid> timelineRepository,
        IReadRepository<PulseResponse, Guid> pulseResponseRepository,
        IReadRepository<CareerDevelopmentPlan, Guid> careerPlanRepository,
        IReadRepository<Recognition, Guid> recognitionRepository,
        IReadRepository<SelfServiceRequest, Guid> selfServiceRepository,
        IOptions<OpenAiOptions> options,
        ILogger<InsightGenerationService> logger)
    {
        _aiClient = aiClient;
        _timelineRepository = timelineRepository;
        _pulseResponseRepository = pulseResponseRepository;
        _careerPlanRepository = careerPlanRepository;
        _recognitionRepository = recognitionRepository;
        _selfServiceRepository = selfServiceRepository;
        _options = options;
        _logger = logger;
    }

    public async Task<AiInsightDto?> GenerateEmployeeInsightAsync(string employeeId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(employeeId))
        {
            throw new ArgumentException("Employee ID is required.", nameof(employeeId));
        }

        if (!_options.Value.Enabled)
        {
            _logger.LogInformation("AI insight generation is disabled. Skipping generation for {EmployeeId}.", employeeId);
            return null;
        }

        var context = await BuildContextAsync(employeeId, cancellationToken);
        var messages = CreatePromptMessages(context);
        var response = await _aiClient.GetChatCompletionAsync(messages, cancellationToken);

        if (string.IsNullOrWhiteSpace(response))
        {
            _logger.LogWarning("OpenAI returned empty content for employee {EmployeeId}.", employeeId);
            return null;
        }

        return ParseInsightResponse(employeeId, response);
    }

    private async Task<EmployeeInsightContext> BuildContextAsync(string employeeId, CancellationToken cancellationToken)
    {
        var timeline = (await _timelineRepository.ListAsync(cancellationToken: cancellationToken))
            .Take(10)
            .ToList();

        var pulseResponses = (await _pulseResponseRepository.ListAsync(cancellationToken: cancellationToken))
            .Where(r => string.Equals(r.EmployeeId, employeeId, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(r => r.SubmittedAt)
            .Take(5)
            .ToList();

        var careerPlan = (await _careerPlanRepository.ListAsync(cancellationToken: cancellationToken))
            .FirstOrDefault(p => string.Equals(p.EmployeeId, employeeId, StringComparison.OrdinalIgnoreCase));

        var recognitions = (await _recognitionRepository.ListAsync(cancellationToken: cancellationToken))
            .Where(r => string.Equals(r.ToEmployeeId, employeeId, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(r => r.CreatedAt)
            .Take(3)
            .ToList();

        var selfServiceRequests = (await _selfServiceRepository.ListAsync(cancellationToken: cancellationToken))
            .Where(r => string.Equals(r.EmployeeId, employeeId, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(r => r.CreatedAt)
            .Take(3)
            .ToList();

        return new EmployeeInsightContext(
            EmployeeId: employeeId,
            Timeline: timeline,
            PulseResponses: pulseResponses,
            CareerPlan: careerPlan,
            Recognitions: recognitions,
            SelfServiceRequests: selfServiceRequests);
    }

    private static IReadOnlyList<AiMessage> CreatePromptMessages(EmployeeInsightContext context)
    {
        var systemMessage = @"You are an expert HR analytics assistant embedded in a workforce planning dashboard.
Analyze the provided employee data and produce a concise, actionable insight for the manager.
Respond ONLY with a JSON object matching this schema:
{
  ""engagementDrop"": <integer between 0 and 100>,
  ""quarter"": ""Q#"",
  ""notes"": ""<2-3 sentence summary of the risk or opportunity, with specific reasoning>"",
  ""actions"": [
    { ""id"": ""<guid or short slug>"", ""label"": ""<action label>"" }
  ]
}
The actions array should contain 3-5 relevant, specific next steps a manager could take. Keep labels short (under 50 chars).";

        var sb = new System.Text.StringBuilder();
        sb.AppendLine($"Employee ID: {context.EmployeeId}");
        sb.AppendLine();
        sb.AppendLine("Recent activity timeline (company-wide, last 10 events):");
        foreach (var t in context.Timeline)
        {
            sb.AppendLine($"- {t.TimestampDisplay}: {t.Title} ({t.Description})");
        }
        sb.AppendLine();
        sb.AppendLine("Employee pulse responses (last 5):");
        foreach (var p in context.PulseResponses)
        {
            var comment = string.IsNullOrWhiteSpace(p.Comment) ? "" : $": {p.Comment}";
            sb.AppendLine($"- Sentiment {p.Sentiment:F2} at {p.SubmittedAt:u}{comment}");
        }
        sb.AppendLine();
        sb.AppendLine("Career development plan:");
        if (context.CareerPlan is null)
        {
            sb.AppendLine("None on file.");
        }
        else
        {
            sb.AppendLine($"- Current role: {context.CareerPlan.CurrentRole}");
            sb.AppendLine($"- Target role: {context.CareerPlan.TargetRole ?? "Not set"}");
            sb.AppendLine($"- Status: {context.CareerPlan.Status}");
            sb.AppendLine($"- Last reviewed: {context.CareerPlan.LastReviewedAt:u}");
        }
        sb.AppendLine();
        sb.AppendLine("Recent recognitions received:");
        foreach (var r in context.Recognitions)
        {
            sb.AppendLine($"- {r.Type} from {r.FromName}: {r.Message}");
        }
        sb.AppendLine();
        sb.AppendLine("Recent self-service requests:");
        foreach (var s in context.SelfServiceRequests)
        {
            sb.AppendLine($"- {s.Type}: {s.Subject} ({s.Status})");
        }

        var userMessage = sb.ToString();

        return new List<AiMessage>
        {
            new(AiMessageRole.System, systemMessage),
            new(AiMessageRole.User, userMessage)
        };
    }

    private static AiInsightDto ParseInsightResponse(string employeeId, string response)
    {
        var json = response.Trim();

        // Some models return the JSON wrapped in a markdown fence.
        if (json.StartsWith("```", StringComparison.Ordinal))
        {
            var lines = json.Split(new[] { '\n' }, StringSplitOptions.RemoveEmptyEntries);
            json = string.Join("\n", lines.Skip(1).Take(lines.Length - 2));
        }

        var parsed = JsonSerializer.Deserialize<GeneratedInsightJson>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        });

        if (parsed is null)
        {
            throw new InvalidOperationException("Failed to deserialize generated insight from LLM response.");
        }

        var actions = parsed.Actions?
            .Select(a => new ActionLabelDto(a.Id ?? Guid.NewGuid().ToString(), a.Label ?? "Review"))
            .ToList()
            ?? new List<ActionLabelDto>();

        return new AiInsightDto(
            EmployeeId: employeeId,
            EngagementDrop: parsed.EngagementDrop,
            Quarter: parsed.Quarter ?? "Q3",
            Notes: parsed.Notes ?? "AI insight could not be generated.",
            Actions: actions.AsReadOnly());
    }

    private sealed record EmployeeInsightContext(
        string EmployeeId,
        IReadOnlyList<ActivityTimelineEvent> Timeline,
        IReadOnlyList<PulseResponse> PulseResponses,
        CareerDevelopmentPlan? CareerPlan,
        IReadOnlyList<Recognition> Recognitions,
        IReadOnlyList<SelfServiceRequest> SelfServiceRequests);

    private sealed class GeneratedInsightJson
    {
        public int EngagementDrop { get; set; }
        public string? Quarter { get; set; }
        public string? Notes { get; set; }
        public List<GeneratedActionJson>? Actions { get; set; }
    }

    private sealed class GeneratedActionJson
    {
        public string? Id { get; set; }
        public string? Label { get; set; }
    }
}
