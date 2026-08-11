namespace HrInsights.Application.Ai;

/// <summary>
/// Configuration options for the OpenAI-powered AI features.
/// </summary>
public sealed class OpenAiOptions
{
    public const string SectionName = "OpenAI";

    /// <summary>
    /// Whether AI features are enabled. When false, services fall back to seed/mock behavior.
    /// </summary>
    public bool Enabled { get; set; }

    /// <summary>
    /// OpenAI API key. In production, prefer Azure Key Vault / environment variables.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Model identifier to use for chat completions. Defaults to gpt-4o-mini for cost efficiency.
    /// </summary>
    public string Model { get; set; } = "gpt-4o-mini";

    /// <summary>
    /// Maximum tokens allowed per completion.
    /// </summary>
    public int MaxTokens { get; set; } = 1024;

    /// <summary>
    /// Sampling temperature.
    /// </summary>
    public double Temperature { get; set; } = 0.3;

    /// <summary>
    /// Optional organization identifier for the OpenAI API.
    /// </summary>
    public string? OrganizationId { get; set; }

    /// <summary>
    /// Optional project identifier for the OpenAI API.
    /// </summary>
    public string? ProjectId { get; set; }
}
