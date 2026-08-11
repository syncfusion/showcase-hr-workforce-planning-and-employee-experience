using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

public sealed class ScenarioAssumption : AuditableEntity<string>
{
    private ScenarioAssumption()
        : base(string.Empty)
    {
        ScenarioId = string.Empty;
        Category = string.Empty;
        Unit = string.Empty;
        Note = string.Empty;
    }

    private ScenarioAssumption(
        string id,
        string scenarioId,
        string category,
        double value,
        string unit,
        string? note)
        : base(id)
    {
        ScenarioId = scenarioId;
        Category = category;
        Value = value;
        Unit = unit;
        Note = note ?? string.Empty;
    }

    public string ScenarioId { get; private set; }
    public string Category { get; private set; }
    public double Value { get; private set; }
    public string Unit { get; private set; }
    public string Note { get; private set; }

    public static ScenarioAssumption Create(
        string id,
        string scenarioId,
        string category,
        double value,
        string unit,
        string? note)
        => new(id, scenarioId, category, value, unit, note);
}
