namespace HrInsights.Application.Ai;

/// <summary>
/// Minimal abstraction over an LLM chat completion API.
/// </summary>
public interface IAiClient
{
    /// <summary>
    /// Sends a chat conversation to the LLM and returns the assistant's text reply.
    /// </summary>
    /// <param name="messages">System + user messages in order.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The assistant message content, or null if the model returned no content.</returns>
    Task<string?> GetChatCompletionAsync(
        IReadOnlyList<AiMessage> messages,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// A single message in an LLM chat conversation.
/// </summary>
public sealed record AiMessage(AiMessageRole Role, string Content);

public enum AiMessageRole
{
    System,
    User,
    Assistant
}
