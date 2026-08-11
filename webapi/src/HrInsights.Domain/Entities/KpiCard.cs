using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

/// <summary>
/// Trend point for a KPI card time-series chart.
/// </summary>
public sealed class KpiTrendPoint
{
    public KpiTrendPoint(int monthIndex, double value)
    {
        MonthIndex = monthIndex;
        Value = value;
    }

    public int MonthIndex { get; }
    public double Value { get; }
}

/// <summary>
/// KPI card with trend data shown in the Overview dashboard.
/// </summary>
public sealed class KpiCard : AuditableEntity<Guid>
{
    private List<KpiTrendPoint> _trend = new();

    private KpiCard()
        : base(Guid.Empty)
    {
        Title = string.Empty;
        Context = string.Empty;
    }

    private KpiCard(Guid id, string title, double currentValue, string unit, double changePercent)
        : base(id)
    {
        Title = title;
        CurrentValue = currentValue;
        Unit = unit;
        ChangePercent = changePercent;
    }

    public string Title { get; private set; }
    public double CurrentValue { get; private set; }
    public string Unit { get; private set; } = string.Empty;
    public double ChangePercent { get; private set; }
    public string Context { get; set; } = string.Empty;
    public bool? ShowProgress { get; set; }
    public int? ProgressValue { get; set; }
    public int? Target { get; set; }
    public string Color { get; set; } = string.Empty;

    public List<KpiTrendPoint> Trend
    {
        get => _trend;
        private set => _trend = value ?? new List<KpiTrendPoint>();
    }

    public void SetTrend(IEnumerable<KpiTrendPoint> trend)
    {
        _trend = new List<KpiTrendPoint>(trend);
    }

    public static KpiCard Create(string title, double currentValue, string unit, double changePercent)
        => new(Guid.NewGuid(), title, currentValue, unit, changePercent);
}
