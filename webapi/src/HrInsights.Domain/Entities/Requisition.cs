using HrInsights.Domain.Common;
using HrInsights.Domain.Enums;

namespace HrInsights.Domain.Entities;

/// <summary>
/// A hiring requisition that flows through the pipeline
/// (Needs Approval → Open → In Review → Offered → Hired).
/// </summary>
public sealed class Requisition : AuditableEntity<Guid>
{
    private Requisition()
        : base(Guid.Empty)
    {
        Title = string.Empty;
        Department = string.Empty;
        Location = string.Empty;
    }

    private Requisition(
        Guid id,
        string title,
        string department,
        string location,
        HiringPipelinePriority priority,
        HiringPipelineStatus status,
        int daysOpen,
        int hiredCount,
        int targetCount,
        DateTime createdAt)
        : base(id)
    {
        Title = title;
        Department = department;
        Location = location;
        Priority = priority;
        Status = status;
        DaysOpen = daysOpen;
        HiredCount = hiredCount;
        TargetCount = targetCount;
        CreatedAt = createdAt;
    }

    public string Title { get; private set; }
    public string Department { get; private set; }
    public string Location { get; private set; }
    public HiringPipelinePriority Priority { get; private set; }
    public HiringPipelineStatus Status { get; private set; }
    public int DaysOpen { get; private set; }
    public int HiredCount { get; private set; }
    public int TargetCount { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public void UpdateStage(HiringPipelineStatus status) => Status = status;

    public void UpdateProgress(int hiredCount, int daysOpen)
    {
        HiredCount = hiredCount;
        DaysOpen = daysOpen;
    }

    public static Requisition Create(
        string title,
        string department,
        string location,
        HiringPipelinePriority priority,
        HiringPipelineStatus status,
        int daysOpen,
        int hiredCount,
        int targetCount,
        DateTime createdAt)
        => new(Guid.NewGuid(), title, department, location, priority, status, daysOpen, hiredCount, targetCount, createdAt);

    public static Requisition Hydrate(
        Guid id,
        string title,
        string department,
        string location,
        HiringPipelinePriority priority,
        HiringPipelineStatus status,
        int daysOpen,
        int hiredCount,
        int targetCount,
        DateTime createdAt)
        => new(id, title, department, location, priority, status, daysOpen, hiredCount, targetCount, createdAt);
}
