namespace HrInsights.Domain.Enums;

/// <summary>
/// Kanban lane a work item currently sits in.
/// </summary>
public enum KanbanLane
{
    Backlog = 0,
    InProgress = 1,
    InReview = 2,
    Done = 3,
}
