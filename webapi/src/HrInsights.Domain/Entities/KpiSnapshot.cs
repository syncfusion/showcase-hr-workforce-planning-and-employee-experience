using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

/// <summary>
/// Overall KPI snapshot shown at the top of the Overview dashboard.
/// </summary>
public sealed class KpiSnapshot : AuditableEntity<Guid>
{
    private KpiSnapshot()
        : base(Guid.Empty)
    {
    }

    private KpiSnapshot(Guid id, int headcount, int openRoles, double? attritionRate, int engagementScore)
        : base(id)
    {
        Headcount = headcount;
        OpenRoles = openRoles;
        AttritionRate = attritionRate;
        EngagementScore = engagementScore;
    }

    public int Headcount { get; private set; }
    public int OpenRoles { get; private set; }
    public double? AttritionRate { get; private set; }
    public int EngagementScore { get; private set; }
    // Display fields
    public int HeadcountChange { get; set; }
    public int OpenRolesChange { get; set; }
    public int EngagementChange { get; set; }

    public static KpiSnapshot Create(int headcount, int openRoles, double? attritionRate, int engagementScore)
        => new(Guid.NewGuid(), headcount, openRoles, attritionRate, engagementScore);
}
