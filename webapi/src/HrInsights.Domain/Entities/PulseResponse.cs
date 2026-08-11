using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

/// <summary>
/// An individual employee's response to a pulse survey.
/// </summary>
public sealed class PulseResponse : AuditableEntity<Guid>
{
    private PulseResponse() : base(Guid.Empty)
    {
    }

    private PulseResponse(
        Guid id,
        Guid pulseSurveyId,
        string? employeeId,
        string? department,
        decimal sentiment,
        DateTime submittedAtUtc,
        string? comment)
        : base(id)
    {
        PulseSurveyId = pulseSurveyId;
        EmployeeId = employeeId;
        Department = department;
        Sentiment = sentiment;
        SubmittedAt = submittedAtUtc;
        Comment = comment;
    }

    public Guid PulseSurveyId { get; private set; }
    public string? EmployeeId { get; private set; }
    public string? Department { get; private set; }
    public decimal Sentiment { get; private set; }
    public DateTime SubmittedAt { get; private set; }
    public string? Comment { get; private set; }

    public static PulseResponse Create(
        Guid pulseSurveyId,
        string? employeeId,
        string? department,
        decimal sentiment,
        DateTime submittedAtUtc,
        string? comment)
        => new(
            Guid.NewGuid(),
            pulseSurveyId,
            employeeId,
            department,
            sentiment,
            DateTime.SpecifyKind(submittedAtUtc, DateTimeKind.Utc),
            comment);
}
