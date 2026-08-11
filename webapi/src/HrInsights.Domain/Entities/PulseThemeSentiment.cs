using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

/// <summary>
/// Theme-level sentiment aggregation row for a pulse survey
/// (e.g. "Work-Life Balance" → 65 in Engineering).
/// </summary>
public sealed class PulseThemeSentiment : AuditableEntity<Guid>
{
    private PulseThemeSentiment() : base(Guid.Empty)
    {
        Theme = string.Empty;
        Department = string.Empty;
    }

    private PulseThemeSentiment(Guid id, Guid pulseSurveyId, string theme, int sentiment, string department)
        : base(id)
    {
        PulseSurveyId = pulseSurveyId;
        Theme = theme;
        Sentiment = sentiment;
        Department = department;
    }

    public Guid PulseSurveyId { get; private set; }
    public string Theme { get; private set; }
    public int Sentiment { get; private set; }
    public string Department { get; private set; }

    public static PulseThemeSentiment Create(Guid pulseSurveyId, string theme, int sentiment, string department)
        => new(Guid.NewGuid(), pulseSurveyId, theme, sentiment, department);
}
