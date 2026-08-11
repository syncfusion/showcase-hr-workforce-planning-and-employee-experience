using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

public sealed class PlanningSnapshot : AuditableEntity<string>
{
    private PlanningSnapshot()
        : base(string.Empty)
    {
        PlanId = string.Empty;
        CreatedBy = string.Empty;
        SourceSystem = string.Empty;
    }

    private PlanningSnapshot(
        string id,
        string planId,
        DateTimeOffset capturedAt,
        string createdBy,
        string sourceSystem)
        : base(id)
    {
        PlanId = planId;
        CapturedAt = capturedAt;
        CreatedBy = createdBy;
        SourceSystem = sourceSystem;
    }

    public string PlanId { get; private set; }
    public DateTimeOffset CapturedAt { get; private set; }
    public string CreatedBy { get; private set; }
    public string SourceSystem { get; private set; }

    public static PlanningSnapshot Create(
        string id,
        string planId,
        DateTimeOffset capturedAt,
        string createdBy,
        string sourceSystem)
        => new(id, planId, capturedAt, createdBy, sourceSystem);
}
