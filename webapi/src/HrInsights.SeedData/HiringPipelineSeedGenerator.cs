using HrInsights.Domain.Entities;
using HrInsights.Domain.Enums;

namespace HrInsights.SeedData;

/// <summary>
/// Generates hardcoded Hiring Pipeline seed data matching the original mock values
/// in <see cref="HiringPipelineBogusGenerator"/>. Used by <see cref="DatabaseSeeder"/>
/// to populate the PostgreSQL tables on application start.
/// </summary>
public sealed class HiringPipelineSeedGenerator
{
    public IReadOnlyList<Requisition> CreateRequisitions()
    {
        return
        [
            CreateRequisition(
                "Senior Frontend Engineer", "Engineering", "Remote",
                HiringPipelinePriority.High, HiringPipelineStatus.Open,
                daysOpen: 12, hiredCount: 0, targetCount: 2,
                createdAt: new DateTime(2026, 6, 5, 0, 0, 0, DateTimeKind.Utc)),

            CreateRequisition(
                "Backend Engineer", "Engineering", "New York",
                HiringPipelinePriority.Medium, HiringPipelineStatus.InReview,
                daysOpen: 8, hiredCount: 0, targetCount: 3,
                createdAt: new DateTime(2026, 6, 10, 0, 0, 0, DateTimeKind.Utc)),

            CreateRequisition(
                "Product Manager", "Engineering", "San Francisco",
                HiringPipelinePriority.High, HiringPipelineStatus.NeedsApproval,
                daysOpen: 0, hiredCount: 0, targetCount: 1,
                createdAt: new DateTime(2026, 6, 17, 0, 0, 0, DateTimeKind.Utc)),

            CreateRequisition(
                "HR Business Partner", "HR", "Chicago",
                HiringPipelinePriority.Low, HiringPipelineStatus.Offered,
                daysOpen: 25, hiredCount: 0, targetCount: 1,
                createdAt: new DateTime(2026, 5, 23, 0, 0, 0, DateTimeKind.Utc)),

            CreateRequisition(
                "Account Executive", "Sales", "Remote",
                HiringPipelinePriority.Medium, HiringPipelineStatus.Hired,
                daysOpen: 30, hiredCount: 1, targetCount: 2,
                createdAt: new DateTime(2026, 5, 18, 0, 0, 0, DateTimeKind.Utc)),

            CreateRequisition(
                "Marketing Specialist", "Marketing", "Austin",
                HiringPipelinePriority.Low, HiringPipelineStatus.Open,
                daysOpen: 5, hiredCount: 0, targetCount: 1,
                createdAt: new DateTime(2026, 6, 12, 0, 0, 0, DateTimeKind.Utc)),
        ];
    }

    public IReadOnlyList<RequisitionInterview> CreateInterviews(IReadOnlyList<Requisition> requisitions)
    {
        // Match interviews to a few requisitions by title to keep seed deterministic.
        var interviewRows = new List<RequisitionInterview>();
        var backend = requisitions.FirstOrDefault(r => r.Title == "Backend Engineer");
        if (backend is not null)
        {
            interviewRows.Add(RequisitionInterview.Create(
                backend.Id,
                applicationId: "app-1001",
                type: "technical",
                scheduledStartUtc: DateTime.UtcNow.AddDays(1).AddHours(1),
                scheduledEndUtc: DateTime.UtcNow.AddDays(1).AddHours(2),
                interviewers: new[] { "lead-anna", "eng-marcus" }));
        }

        var hr = requisitions.FirstOrDefault(r => r.Title == "HR Business Partner");
        if (hr is not null)
        {
            interviewRows.Add(RequisitionInterview.Create(
                hr.Id,
                applicationId: "app-1002",
                type: "panel",
                scheduledStartUtc: DateTime.UtcNow.AddDays(2).AddHours(3),
                scheduledEndUtc: DateTime.UtcNow.AddDays(2).AddHours(4),
                interviewers: new[] { "hr-priya", "dir-leo" }));
        }

        return interviewRows;
    }

    public IReadOnlyList<RequisitionOffer> CreateOffers(IReadOnlyList<Requisition> requisitions)
    {
        var offerRows = new List<RequisitionOffer>();
        var hr = requisitions.FirstOrDefault(r => r.Title == "HR Business Partner");
        if (hr is not null)
        {
            offerRows.Add(RequisitionOffer.Create(
                hr.Id,
                applicationId: "app-1002",
                compensation: 95000m,
                currency: "USD",
                startDate: DateTime.UtcNow.AddDays(14)));
        }

        var ae = requisitions.FirstOrDefault(r => r.Title == "Account Executive");
        if (ae is not null)
        {
            offerRows.Add(RequisitionOffer.Create(
                ae.Id,
                applicationId: "app-1003",
                compensation: 120000m,
                currency: "USD",
                startDate: DateTime.UtcNow.AddDays(-7)));
        }

        return offerRows;
    }

    private static Requisition CreateRequisition(
        string title,
        string department,
        string location,
        HiringPipelinePriority priority,
        HiringPipelineStatus status,
        int daysOpen,
        int hiredCount,
        int targetCount,
        DateTime createdAt)
        => Requisition.Create(title, department, location, priority, status, daysOpen, hiredCount, targetCount, createdAt);
}
