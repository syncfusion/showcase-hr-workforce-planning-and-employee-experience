using HrInsights.Domain.Common;
using HrInsights.Domain.Enums;

namespace HrInsights.Domain.Entities;

/// <summary>
/// A pulse engagement survey campaign (weekly, monthly, quarterly, one-time).
/// </summary>
public sealed class PulseSurvey : AuditableEntity<Guid>
{
    private List<PulseThemeSentiment> _themes = new();

    private PulseSurvey() : base(Guid.Empty)
    {
        Title = string.Empty;
    }

    private PulseSurvey(
        Guid id,
        string? campaignId,
        string title,
        PulseSurveyStatus status,
        PulseSurveyCadence? cadence,
        decimal responseRate,
        int totalResponses,
        DateTime openAtUtc,
        DateTime? closeAtUtc)
        : base(id)
    {
        CampaignId = campaignId;
        Title = title;
        Status = status;
        Cadence = cadence;
        ResponseRate = responseRate;
        TotalResponses = totalResponses;
        OpenAt = openAtUtc;
        CloseAt = closeAtUtc;
    }

    public string? CampaignId { get; private set; }
    public string Title { get; private set; }
    public PulseSurveyStatus Status { get; private set; }
    public PulseSurveyCadence? Cadence { get; private set; }
    public decimal ResponseRate { get; private set; }
    public int TotalResponses { get; private set; }
    public DateTime OpenAt { get; private set; }
    public DateTime? CloseAt { get; private set; }

    /// <summary>Comma-separated list of question refs (e.g. "q_eng_1,q_eng_2").</summary>
    public string QuestionRefsCsv { get; private set; } = string.Empty;

    public IReadOnlyList<string> GetQuestionRefs()
        => string.IsNullOrWhiteSpace(QuestionRefsCsv)
            ? Array.Empty<string>()
            : QuestionRefsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    public void SetQuestionRefs(IEnumerable<string> refs)
        => QuestionRefsCsv = string.Join(',', refs ?? Array.Empty<string>());

    public List<PulseThemeSentiment> Themes
    {
        get => _themes;
        private set => _themes = value ?? new List<PulseThemeSentiment>();
    }

    public void SetThemes(IEnumerable<PulseThemeSentiment> themes)
        => _themes = new List<PulseThemeSentiment>(themes ?? Array.Empty<PulseThemeSentiment>());

    public void RegisterResponse(decimal sentiment, DateTime submittedAtUtc)
    {
        TotalResponses += 1;
        ResponseRate = Math.Min(100m, ResponseRate + 1m);
    }

    public static PulseSurvey Create(
        string? campaignId,
        string title,
        PulseSurveyStatus status,
        PulseSurveyCadence? cadence,
        IEnumerable<string> questionRefs,
        decimal responseRate,
        int totalResponses,
        DateTime openAtUtc,
        DateTime? closeAtUtc,
        IEnumerable<PulseThemeSentiment> themes)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.", nameof(title));
        var survey = new PulseSurvey(
            Guid.NewGuid(),
            campaignId,
            title.Trim(),
            status,
            cadence,
            responseRate,
            totalResponses,
            DateTime.SpecifyKind(openAtUtc, DateTimeKind.Utc),
            closeAtUtc.HasValue ? DateTime.SpecifyKind(closeAtUtc.Value, DateTimeKind.Utc) : null);
        survey.SetQuestionRefs(questionRefs);
        survey.SetThemes(themes);
        return survey;
    }
}
