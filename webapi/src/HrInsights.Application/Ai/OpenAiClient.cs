using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI;
using OpenAI.Chat;

namespace HrInsights.Application.Ai;

/// <summary>
/// Production implementation of <see cref="IAiClient"/> using the official OpenAI .NET SDK.
/// </summary>
public sealed class OpenAiClient : IAiClient
{
    private readonly IOptions<OpenAiOptions> _options;
    private readonly ILogger<OpenAiClient> _logger;

    public OpenAiClient(IOptions<OpenAiOptions> options, ILogger<OpenAiClient> logger)
    {
        _options = options;
        _logger = logger;
    }

    public async Task<string?> GetChatCompletionAsync(
        IReadOnlyList<AiMessage> messages,
        CancellationToken cancellationToken = default)
    {
        var options = _options.Value;

        if (!options.Enabled || string.IsNullOrWhiteSpace(options.ApiKey))
        {
            _logger.LogWarning("OpenAI client called while disabled or missing API key.");
            return null;
        }

        var clientOptions = new OpenAIClientOptions();
        if (!string.IsNullOrWhiteSpace(options.OrganizationId))
        {
            clientOptions.OrganizationId = options.OrganizationId;
        }

        if (!string.IsNullOrWhiteSpace(options.ProjectId))
        {
            clientOptions.ProjectId = options.ProjectId;
        }

        var client = new ChatClient(options.Model, new System.ClientModel.ApiKeyCredential(options.ApiKey), clientOptions);

        var chatMessages = messages.Select(m =>
        {
            return m.Role switch
            {
                AiMessageRole.System => new SystemChatMessage(m.Content) as ChatMessage,
                AiMessageRole.Assistant => new AssistantChatMessage(m.Content) as ChatMessage,
                _ => new UserChatMessage(m.Content) as ChatMessage,
            };
        }).ToList();

        _logger.LogDebug(
            "Sending chat completion request to OpenAI model {Model} with {MessageCount} messages.",
            options.Model,
            chatMessages.Count);

        var completion = await client.CompleteChatAsync(
            chatMessages,
            new ChatCompletionOptions
            {
                MaxOutputTokenCount = options.MaxTokens,
                Temperature = (float)options.Temperature,
            },
            cancellationToken);

        var content = completion.Value.Content.FirstOrDefault()?.Text;

        _logger.LogDebug(
            "Received chat completion. Finish reason: {FinishReason}. Has content: {HasContent}.",
            completion.Value.FinishReason,
            !string.IsNullOrWhiteSpace(content));

        return content;
    }
}
