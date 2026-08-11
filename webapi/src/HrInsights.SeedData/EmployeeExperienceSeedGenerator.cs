using HrInsights.Domain.Entities;
using HrInsights.Domain.Enums;

namespace HrInsights.SeedData;

/// <summary>
/// Generates hardcoded Employee Experience seed data matching the original
/// mock values in <see cref="EmployeeExperienceBogusGenerator"/>. The data is
/// materialized as domain entities (with stable Guids) so the rows are
/// upserted into PostgreSQL on application start.
/// </summary>
public sealed class EmployeeExperienceSeedGenerator
{
    // Fixed, well-known Guids so a re-seed of an existing database is
    // deterministic and doesn't keep inserting duplicates. The wire DTOs
    // surface these as their "Id" field, replacing the original string ids.
    private static readonly Guid Pulse202606 = Guid.Parse("11111111-1111-1111-1111-000000000001");
    private static readonly Guid PulseWeekly22 = Guid.Parse("11111111-1111-1111-1111-000000000002");
    private static readonly Guid PulseManagerDraft = Guid.Parse("11111111-1111-1111-1111-000000000003");
    private static readonly Guid PulseQ1Archived = Guid.Parse("11111111-1111-1111-1111-000000000004");

    private static readonly Guid Cdp204 = Guid.Parse("22222222-2222-2222-2222-000000000001");
    private static readonly Guid Cdp205 = Guid.Parse("22222222-2222-2222-2222-000000000002");

    public IReadOnlyList<SelfServiceRequest> CreateSelfServiceRequests()
    {
        return
        [
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000001"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "address-change", subject: "Update home address",
                details: "Moving to Austin, TX effective 07-15-2026. Please update payroll and benefits records.",
                status: SelfServiceRequestStatus.InProgress,
                priority: SelfServiceRequestPriority.Medium,
                assignedTo: "u_ops_07",
                createdAtUtc: new DateTime(2026, 6, 13, 14, 15, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 20, 15, 2, 0, DateTimeKind.Utc),
                attachmentsCsv: "doc_88"),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000002"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "equipment", subject: "Replacement laptop battery",
                details: "Battery draining within 2 hours; need a replacement under warranty.",
                status: SelfServiceRequestStatus.Submitted,
                priority: SelfServiceRequestPriority.High,
                assignedTo: null,
                createdAtUtc: new DateTime(2026, 6, 21, 12, 0, 0, DateTimeKind.Utc),
                updatedAtUtc: null,
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000003"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "benefits", subject: "Add dependent to health plan",
                details: "Newborn dependent added; please enroll effective 01-07-2026.",
                status: SelfServiceRequestStatus.InReview,
                priority: SelfServiceRequestPriority.Medium,
                assignedTo: "u_ops_04",
                createdAtUtc: new DateTime(2026, 6, 18, 9, 0, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 19, 3, 40, 0, DateTimeKind.Utc),
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000004"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "payroll", subject: "Missing June overtime",
                details: "Overtime from 10-06-2026 was not reflected in the latest paystub.",
                status: SelfServiceRequestStatus.Resolved,
                priority: SelfServiceRequestPriority.High,
                assignedTo: "u_pay_02",
                createdAtUtc: new DateTime(2026, 6, 12, 12, 0, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 17, 20, 45, 0, DateTimeKind.Utc),
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000005"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "leave-request", subject: "Parental leave — Aug 2026",
                details: "Requesting 6 weeks parental leave starting 03-08-2026.",
                status: SelfServiceRequestStatus.InProgress,
                priority: SelfServiceRequestPriority.Medium,
                assignedTo: "u_ops_07",
                createdAtUtc: new DateTime(2026, 6, 15, 15, 0, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 21, 14, 0, 0, DateTimeKind.Utc),
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000006"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "other", subject: "Update emergency contact",
                details: "New emergency contact: Maria Becker, +1 512 555 0148.",
                status: SelfServiceRequestStatus.Submitted,
                priority: SelfServiceRequestPriority.Low,
                assignedTo: null,
                createdAtUtc: new DateTime(2026, 6, 22, 11, 30, 0, DateTimeKind.Utc),
                updatedAtUtc: null,
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000007"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "equipment", subject: "Second monitor for home office",
                details: "Requesting an additional 27\" monitor under the remote work stipend.",
                status: SelfServiceRequestStatus.Rejected,
                priority: SelfServiceRequestPriority.Low,
                assignedTo: "u_it_03",
                createdAtUtc: new DateTime(2026, 6, 5, 3, 30, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 7, 9, 30, 0, DateTimeKind.Utc),
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000008"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "benefits", subject: "FSA contribution change",
                details: "Increase FSA contribution to $2,600 for the remainder of 2026.",
                status: SelfServiceRequestStatus.InReview,
                priority: SelfServiceRequestPriority.Low,
                assignedTo: "u_ops_04",
                createdAtUtc: new DateTime(2026, 6, 19, 16, 45, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 22, 12, 0, 0, DateTimeKind.Utc),
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000009"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "payroll", subject: "Update direct deposit details",
                details: "Switching to a new checking account for salary deposits starting next pay cycle.",
                status: SelfServiceRequestStatus.Resolved,
                priority: SelfServiceRequestPriority.Medium,
                assignedTo: "u_pay_02",
                createdAtUtc: new DateTime(2026, 6, 1, 13, 0, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 4, 18, 20, 0, DateTimeKind.Utc),
                attachmentsCsv: "doc_101"),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000010"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "leave-request", subject: "Bereavement leave request",
                details: "Requesting 3 days bereavement leave for a family member starting 30-06-2026.",
                status: SelfServiceRequestStatus.Submitted,
                priority: SelfServiceRequestPriority.High,
                assignedTo: null,
                createdAtUtc: new DateTime(2026, 6, 23, 17, 15, 0, DateTimeKind.Utc),
                updatedAtUtc: null,
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000011"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "equipment", subject: "Request ergonomic chair",
                details: "Current chair is causing back strain; need an ergonomic replacement approved by doctor.",
                status: SelfServiceRequestStatus.InProgress,
                priority: SelfServiceRequestPriority.Medium,
                assignedTo: "u_it_03",
                createdAtUtc: new DateTime(2026, 6, 10, 14, 0, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 15, 13, 30, 0, DateTimeKind.Utc),
                attachmentsCsv: "doc_102"),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000012"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "benefits", subject: "Update 401(k) contribution",
                details: "Increase 401(k) contribution from 6% to 10% effective July 2026.",
                status: SelfServiceRequestStatus.Resolved,
                priority: SelfServiceRequestPriority.Low,
                assignedTo: "u_ops_04",
                createdAtUtc: new DateTime(2026, 6, 8, 12, 30, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 12, 15, 45, 0, DateTimeKind.Utc),
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000013"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "payroll", subject: "Expense reimbursement missing",
                details: "Travel expenses from the May client trip were not reimbursed on the latest payslip.",
                status: SelfServiceRequestStatus.InReview,
                priority: SelfServiceRequestPriority.Medium,
                assignedTo: "u_pay_02",
                createdAtUtc: new DateTime(2026, 6, 16, 19, 45, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 20, 14, 0, 0, DateTimeKind.Utc),
                attachmentsCsv: "doc_103,doc_104"),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000014"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "equipment", subject: "VPN access not working",
                details: "Unable to connect to corporate VPN from home office since 18-06-2026.",
                status: SelfServiceRequestStatus.Rejected,
                priority: SelfServiceRequestPriority.High,
                assignedTo: "u_it_01",
                createdAtUtc: new DateTime(2026, 6, 18, 15, 0, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 21, 20, 0, 0, DateTimeKind.Utc),
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000015"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "leave-request", subject: "Work-from-home extension",
                details: "Requesting to extend WFH arrangement through 31-12-2026 due to relocation plans.",
                status: SelfServiceRequestStatus.Submitted,
                priority: SelfServiceRequestPriority.Low,
                assignedTo: null,
                createdAtUtc: new DateTime(2026, 6, 20, 4, 15, 0, DateTimeKind.Utc),
                updatedAtUtc: null,
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000016"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "other", subject: "Name change after marriage",
                details: "Updated legal name is Ava Lee-Thompson; please reflect across HR systems.",
                status: SelfServiceRequestStatus.InProgress,
                priority: SelfServiceRequestPriority.Medium,
                assignedTo: "u_ops_07",
                createdAtUtc: new DateTime(2026, 6, 14, 12, 0, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 19, 17, 20, 0, DateTimeKind.Utc),
                attachmentsCsv: "doc_105"),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000017"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "benefits", subject: "Enrollment in gym reimbursement",
                details: "Enrolling in the wellness benefit for monthly gym reimbursement up to $75.",
                status: SelfServiceRequestStatus.Resolved,
                priority: SelfServiceRequestPriority.Low,
                assignedTo: "u_ops_04",
                createdAtUtc: new DateTime(2026, 6, 2, 14, 30, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 6, 13, 15, 0, DateTimeKind.Utc),
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000018"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "payroll", subject: "Tax withholding adjustment",
                details: "Need to update W-4 allowances following recent household income change.",
                status: SelfServiceRequestStatus.InReview,
                priority: SelfServiceRequestPriority.High,
                assignedTo: "u_pay_02",
                createdAtUtc: new DateTime(2026, 6, 17, 18, 0, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 21, 12, 45, 0, DateTimeKind.Utc),
                attachmentsCsv: "doc_106"),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000019"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "equipment", subject: "Headset replacement",
                details: "Current headset microphone is no longer functional; affects daily client calls.",
                status: SelfServiceRequestStatus.Submitted,
                priority: SelfServiceRequestPriority.Medium,
                assignedTo: null,
                createdAtUtc: new DateTime(2026, 6, 23, 13, 30, 0, DateTimeKind.Utc),
                updatedAtUtc: null,
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000020"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "leave-request", subject: "Sick leave — doctor appointment",
                details: "Taking a half-day for a scheduled specialist appointment on 25-06-2026 afternoon.",
                status: SelfServiceRequestStatus.Resolved,
                priority: SelfServiceRequestPriority.Low,
                assignedTo: "u_ops_07",
                createdAtUtc: new DateTime(2026, 6, 24, 11, 0, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 24, 13, 0, 0, DateTimeKind.Utc),
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000021"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "payroll", subject: "Relocation allowance inquiry",
                details: "Inquiring about relocation reimbursement eligibility for the upcoming office transfer.",
                status: SelfServiceRequestStatus.Submitted,
                priority: SelfServiceRequestPriority.Medium,
                assignedTo: null,
                createdAtUtc: new DateTime(2026, 6, 21, 5, 30, 0, DateTimeKind.Utc),
                updatedAtUtc: null,
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000022"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "benefits", subject: "Vision insurance enrollment",
                details: "Missed open enrollment; requesting a qualifying life event exception for vision plan.",
                status: SelfServiceRequestStatus.InProgress,
                priority: SelfServiceRequestPriority.High,
                assignedTo: "u_ops_04",
                createdAtUtc: new DateTime(2026, 6, 11, 14, 0, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 16, 19, 30, 0, DateTimeKind.Utc),
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000023"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "other", subject: "Update personal pronouns",
                details: "Please update display name and pronouns in directory to she/her.",
                status: SelfServiceRequestStatus.Resolved,
                priority: SelfServiceRequestPriority.Low,
                assignedTo: "u_ops_07",
                createdAtUtc: new DateTime(2026, 6, 3, 13, 15, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 5, 15, 0, 0, DateTimeKind.Utc),
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000024"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "equipment", subject: "Laptop screen flicker",
                details: "Screen flickers intermittently when docked to external monitor; affects presentations.",
                status: SelfServiceRequestStatus.InReview,
                priority: SelfServiceRequestPriority.Medium,
                assignedTo: "u_it_03",
                createdAtUtc: new DateTime(2026, 6, 19, 17, 0, 0, DateTimeKind.Utc),
                updatedAtUtc: new DateTime(2026, 6, 22, 14, 30, 0, DateTimeKind.Utc),
                attachmentsCsv: string.Empty),
            SelfServiceRequest.Hydrate(
                id: Guid.Parse("33333333-3333-3333-3333-000000000025"),
                employeeId: "emp_4521", employeeName: "Ava Thompson",
                type: "leave-request", subject: "Jury duty leave",
                details: "Summoned for jury duty the week of 2026-07-06; requesting approved leave.",
                status: SelfServiceRequestStatus.Submitted,
                priority: SelfServiceRequestPriority.Medium,
                assignedTo: null,
                createdAtUtc: new DateTime(2026, 6, 22, 20, 0, 0, DateTimeKind.Utc),
                updatedAtUtc: null,
                attachmentsCsv: "doc_107"),
        ];
    }

    public IReadOnlyList<PulseSurvey> CreatePulseSurveys()
    {
        var s1 = PulseSurvey.Create(
            campaignId: "camp-1", title: "Q2 Employee Engagement Survey",
            status: PulseSurveyStatus.Active, cadence: PulseSurveyCadence.Quarterly,
            questionRefs: ["q_eng_1", "q_eng_2"],
            responseRate: 72m, totalResponses: 610,
            openAtUtc: new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc),
            closeAtUtc: new DateTime(2026, 6, 30, 23, 59, 59, DateTimeKind.Utc),
            themes:
            [
                PulseThemeSentiment.Create(Pulse202606, "Work-Life Balance", 65, "Engineering"),
                PulseThemeSentiment.Create(Pulse202606, "Career Growth", 45, "Engineering"),
                PulseThemeSentiment.Create(Pulse202606, "Management", 72, "Sales"),
                PulseThemeSentiment.Create(Pulse202606, "Compensation", 38, "Marketing"),
            ]);

        var s2 = PulseSurvey.Create(
            campaignId: "camp-2", title: "Weekly Pulse Check",
            status: PulseSurveyStatus.Active, cadence: PulseSurveyCadence.Weekly,
            questionRefs: ["q_pulse_1"],
            responseRate: 85m, totalResponses: 720,
            openAtUtc: new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc),
            closeAtUtc: null,
            themes:
            [
                PulseThemeSentiment.Create(PulseWeekly22, "Work-Life Balance", 58, "Engineering"),
                PulseThemeSentiment.Create(PulseWeekly22, "Team Collaboration", 78, "HR"),
            ]);

        var s3 = PulseSurvey.Create(
            campaignId: "camp-3", title: "Manager Feedback",
            status: PulseSurveyStatus.Draft, cadence: PulseSurveyCadence.OneTime,
            questionRefs: ["q_mgr_1"],
            responseRate: 0m, totalResponses: 0,
            openAtUtc: new DateTime(2026, 7, 1, 0, 0, 0, DateTimeKind.Utc),
            closeAtUtc: new DateTime(2026, 7, 31, 23, 59, 59, DateTimeKind.Utc),
            themes: Array.Empty<PulseThemeSentiment>());

        var s4 = PulseSurvey.Create(
            campaignId: null, title: "Q1 Engagement Pulse",
            status: PulseSurveyStatus.Closed, cadence: PulseSurveyCadence.Quarterly,
            questionRefs: ["q_q1_1"],
            responseRate: 64m, totalResponses: 540,
            openAtUtc: new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
            closeAtUtc: new DateTime(2026, 3, 31, 23, 59, 59, DateTimeKind.Utc),
            themes:
            [
                PulseThemeSentiment.Create(PulseQ1Archived, "Leadership Trust", 70, "Engineering"),
                PulseThemeSentiment.Create(PulseQ1Archived, "Recognition", 55, "Marketing"),
            ]);

        return [SetId(s1, Pulse202606), SetId(s2, PulseWeekly22), SetId(s3, PulseManagerDraft), SetId(s4, PulseQ1Archived)];
    }

    public IReadOnlyList<PulseResponse> CreatePulseResponses()
    {
        return
        [
            PulseResponse.Create(Pulse202606, "emp_4521", "Engineering", 80m, new DateTime(2026, 6, 10, 18, 22, 0, DateTimeKind.Utc), "Roadmap visibility has improved this quarter."),
            PulseResponse.Create(Pulse202606, null, "Engineering", 25m, new DateTime(2026, 6, 11, 13, 0, 0, DateTimeKind.Utc), "Workload spikes are still common."),
            PulseResponse.Create(Pulse202606, "emp_4502", "HR", 74m, new DateTime(2026, 6, 12, 9, 30, 0, DateTimeKind.Utc), null),
            PulseResponse.Create(PulseWeekly22, null, "Sales", 30m, new DateTime(2026, 6, 15, 12, 35, 0, DateTimeKind.Utc), "Quota pressure is high."),
            PulseResponse.Create(PulseWeekly22, "emp_4530", "Engineering", 90m, new DateTime(2026, 6, 16, 4, 40, 0, DateTimeKind.Utc), "Great team collaboration this week."),
            PulseResponse.Create(Pulse202606, null, "Marketing", -10m, new DateTime(2026, 6, 14, 19, 45, 0, DateTimeKind.Utc), "Need clearer compensation bands."),
            PulseResponse.Create(PulseWeekly22, null, "HR", 60m, new DateTime(2026, 6, 17, 12, 0, 0, DateTimeKind.Utc), null),
            PulseResponse.Create(Pulse202606, "emp_4490", "Engineering", 70m, new DateTime(2026, 6, 18, 17, 30, 0, DateTimeKind.Utc), "New learning stipend is appreciated."),
        ];
    }

    public IReadOnlyList<Recognition> CreateRecognitions()
    {
        return
        [
            Recognition.Create("emp_4502", "Marcus Lee", "emp_4521", "Ava Thompson", "peer-shoutout",
                "Drove the Q2 release across the finish line.", "Innovation",
                new DateTime(2026, 6, 20, 20, 5, 0, DateTimeKind.Utc), "public"),
            Recognition.Create("emp_4490", "John Williams", "emp_4530", "Priya Nair", "milestone",
                "5 years at the company — thank you for your leadership.", "Tenure",
                new DateTime(2026, 6, 18, 3, 30, 0, DateTimeKind.Utc), "team"),
            Recognition.Create("emp_4521", "Ava Thompson", "emp_4490", "John Williams", "leadership",
                "Clear comms during the re-org.", null,
                new DateTime(2026, 6, 21, 15, 0, 0, DateTimeKind.Utc), "public"),
            Recognition.Create("emp_4530", "Priya Nair", "emp_4555", "Sofia Garcia", "team-win",
                "Closed 3 enterprise deals in one week!", "Customer Focus",
                new DateTime(2026, 6, 19, 21, 30, 0, DateTimeKind.Utc), "public"),
            Recognition.Create("emp_4560", "Liam Becker", "emp_4521", "Ava Thompson", "peer-shoutout",
                "Mentored two new hires with patience.", "Mentorship",
                new DateTime(2026, 6, 22, 12, 30, 0, DateTimeKind.Utc), "team"),
            Recognition.Create("emp_4490", "John Williams", "emp_4555", "Sofia Garcia", "milestone",
                "Promoted to Senior AE — congrats!", "Growth",
                new DateTime(2026, 6, 17, 14, 0, 0, DateTimeKind.Utc), "public"),
        ];
    }

    public IReadOnlyList<CareerDevelopmentPlan> CreateCareerPlans()
    {
        var plan204 = CareerDevelopmentPlan.Create(
            employeeId: "emp_4521", employeeName: "Ava Thompson",
            managerId: "emp_4490",
            currentRole: "Senior Software Engineer", targetRole: "Staff Engineer",
            horizon: CareerHorizon.TwelveMonths, status: CareerPlanStatus.OnTrack,
            milestones:
            [
                CareerMilestone.Create(Cdp204, "Lead architecture review for payments",
                    new DateOnly(2026, 9, 30), MilestoneStatus.InProgress, "doc_991"),
                CareerMilestone.Create(Cdp204, "Mentor two junior engineers through onboarding",
                    new DateOnly(2026, 8, 15), MilestoneStatus.Completed, "doc_992"),
                CareerMilestone.Create(Cdp204, "Publish a technical RFC on platform reliability",
                    new DateOnly(2026, 11, 30), MilestoneStatus.NotStarted, null),
                CareerMilestone.Create(Cdp204, "Present at an internal engineering forum",
                    new DateOnly(2026, 12, 15), MilestoneStatus.NotStarted, null),
            ],
            lastReviewedAtUtc: new DateTime(2026, 6, 10, 0, 0, 0, DateTimeKind.Utc));

        var plan205 = CareerDevelopmentPlan.Create(
            employeeId: "emp_4502", employeeName: "Marcus Lee",
            managerId: "emp_4490",
            currentRole: "People Ops Manager", targetRole: null,
            horizon: CareerHorizon.SixMonths, status: CareerPlanStatus.Stalled,
            milestones:
            [
                CareerMilestone.Create(Cdp205, "Define HR operations scorecard",
                    new DateOnly(2026, 5, 31), MilestoneStatus.Blocked, null),
                CareerMilestone.Create(Cdp205, "Run quarterly HR retro",
                    new DateOnly(2026, 7, 15), MilestoneStatus.NotStarted, null),
                CareerMilestone.Create(Cdp205, "Propose recognition program refresh",
                    new DateOnly(2026, 8, 30), MilestoneStatus.NotStarted, null),
            ],
            lastReviewedAtUtc: null);

        return [SetId(plan204, Cdp204), SetId(plan205, Cdp205)];
    }

    public IReadOnlyList<LearningRecommendation> CreateLearningRecommendations()
    {
        return
        [
            LearningRecommendation.Create(Cdp204, "emp_4521", "Advanced System Design", "Internal Academy", LearningFormat.Course, "system-design",
                "Aligns with Staff Engineer milestone on platform reliability.", 0.92m, 12m, LearningRecommendationStatus.Suggested,
                new DateTime(2026, 6, 21, 9, 0, 0, DateTimeKind.Utc)),
            LearningRecommendation.Create(Cdp204, "emp_4521", "Mentoring Foundations", "LinkedIn Learning", LearningFormat.Video, "mentoring",
                "Supports the mentoring milestone in your plan.", 0.78m, 3m, LearningRecommendationStatus.InProgress,
                new DateTime(2026, 6, 19, 9, 0, 0, DateTimeKind.Utc)),
            LearningRecommendation.Create(Cdp204, "emp_4521", "Writing Effective RFCs", null, LearningFormat.Article, "communication",
                "Prepares you for the upcoming RFC milestone.", 0.71m, 1m, LearningRecommendationStatus.Saved,
                new DateTime(2026, 6, 20, 9, 0, 0, DateTimeKind.Utc)),
            LearningRecommendation.Create(Cdp204, "emp_4521", "Staff Engineer Leadership Cohort", "Internal Academy", LearningFormat.Mentoring, "leadership",
                "Cohort program for engineers targeting Staff level.", 1.0m, 16m, LearningRecommendationStatus.Suggested,
                new DateTime(2026, 6, 22, 9, 0, 0, DateTimeKind.Utc)),
            LearningRecommendation.Create(null, "emp_4521", "Accessibility in Practice", "Deque University", LearningFormat.Certification, "accessibility",
                "Recommended for all engineers building UI surfaces.", null, 8m, LearningRecommendationStatus.Suggested,
                new DateTime(2026, 6, 18, 9, 0, 0, DateTimeKind.Utc)),
            LearningRecommendation.Create(Cdp204, "emp_4521", "Reliability Engineering Project", null, LearningFormat.Project, "reliability",
                "Hands-on platform reliability project.", 0.85m, 24m, LearningRecommendationStatus.Completed,
                new DateTime(2026, 6, 1, 9, 0, 0, DateTimeKind.Utc)),
            LearningRecommendation.Create(Cdp205, "emp_4502", "HR Analytics Fundamentals", "Coursera", LearningFormat.Course, "analytics",
                "Supports the HR operations scorecard milestone.", 0.81m, 10m, LearningRecommendationStatus.Suggested,
                new DateTime(2026, 6, 20, 9, 0, 0, DateTimeKind.Utc)),
            LearningRecommendation.Create(Cdp205, "emp_4502", "Running Great Retros", "Internal Academy", LearningFormat.Video, "facilitation",
                null, 0.6m, 2m, LearningRecommendationStatus.Dismissed,
                new DateTime(2026, 6, 17, 9, 0, 0, DateTimeKind.Utc)),
        ];
    }

    public IReadOnlyList<IssueReport> CreateIssueReports()
    {
        return
        [
            IssueReport.Create("emp_4521", "Ava Thompson", "system-rendering", "Paystub PDF renders blank",
                "Open paystub in Chrome and PDF is blank; works in Edge.", "/pay/stub/2026-05", "Chrome 125",
                IssueReportPriority.High, null,
                new DateTime(2026, 6, 22, 12, 45, 0, DateTimeKind.Utc), new[] { "img_77" }),
            IssueReport.Create("emp_4530", "Priya Nair", "access", "Cannot access benefits portal from EMEA",
                "SSO redirect loops when accessing benefits from India.", "/benefits", "Edge 124",
                IssueReportPriority.Medium, "u_it_03",
                new DateTime(2026, 6, 19, 21, 40, 0, DateTimeKind.Utc), Array.Empty<string>()),
            IssueReport.Create("emp_4555", "Sofia Garcia", "performance", "Hiring pipeline loads slowly",
                "Pipeline view takes ~12s to load on slow connections.", "/hiring", null,
                IssueReportPriority.Medium, "u_it_03",
                new DateTime(2026, 6, 18, 19, 0, 0, DateTimeKind.Utc), Array.Empty<string>()),
            IssueReport.Create("emp_4560", "Liam Becker", "data-quality", "Headcount shows stale value",
                "Overview headcount was off by 5 for two days before refreshing.", "/", "Chrome 125",
                IssueReportPriority.Low, "u_it_01",
                new DateTime(2026, 6, 12, 15, 0, 0, DateTimeKind.Utc), Array.Empty<string>()),
        ];
    }

    public IReadOnlyList<DelayConcern> CreateDelayConcerns()
    {
        return
        [
            DelayConcern.Create("emp_4521", "Ava Thompson", "self-service", "ssr_1024", "Address change pending 9 days",
                "Submitted on 2026-06-13 and no HR update yet.", 9, 5, DelayConcernSeverity.High,
                new DateTime(2026, 6, 22, 13, 0, 0, DateTimeKind.Utc)),
            DelayConcern.Create("emp_4502", "Marcus Lee", "self-service", "ssr_1025", "Laptop battery request pending",
                "No update after 1 day; blocking field work.", 1, 2, DelayConcernSeverity.Low,
                new DateTime(2026, 6, 22, 13, 5, 0, DateTimeKind.Utc)),
            DelayConcern.Create("emp_4530", "Priya Nair", "benefits", "ssr_1026", "Dependent enrollment pending 4 days",
                "Enrollment window closing soon.", 4, null, DelayConcernSeverity.Medium,
                new DateTime(2026, 6, 22, 3, 40, 0, DateTimeKind.Utc)),
        ];
    }

    public IReadOnlyList<KanbanItem> CreateKanbanItems()
    {
        // The IDs are seed-stable so the DTO surface looks the same as the
        // in-memory generator (we expose the Guid as a hex string).
        return
        [
            KanbanItem.Create("self-service", "ssr_1024", "Address change pending", KanbanLane.InProgress, "u_ops_07", KanbanPriority.Medium,
                new DateOnly(2026, 6, 26), new[] { "payroll", "emea" }, new DateTime(2026, 6, 22, 14, 0, 0, DateTimeKind.Utc)),
            KanbanItem.Create("self-service", "ssr_1025", "Replacement laptop battery", KanbanLane.Backlog, null, KanbanPriority.High,
                new DateOnly(2026, 6, 24), new[] { "equipment" }, new DateTime(2026, 6, 21, 12, 0, 0, DateTimeKind.Utc)),
            KanbanItem.Create("self-service", "ssr_1026", "Add dependent to health plan", KanbanLane.Backlog, "u_ops_04", KanbanPriority.Medium,
                new DateOnly(2026, 6, 30), new[] { "benefits" }, new DateTime(2026, 6, 19, 3, 40, 0, DateTimeKind.Utc)),
            KanbanItem.Create("self-service", "ssr_1027", "Missing June overtime", KanbanLane.Done, "u_pay_02", KanbanPriority.High,
                new DateOnly(2026, 6, 17), new[] { "payroll" }, new DateTime(2026, 6, 17, 20, 45, 0, DateTimeKind.Utc)),
            KanbanItem.Create("self-service", "ssr_1028", "Parental leave — Aug 2026", KanbanLane.InReview, "u_ops_07", KanbanPriority.Medium,
                new DateOnly(2026, 7, 15), new[] { "leave" }, new DateTime(2026, 6, 21, 14, 0, 0, DateTimeKind.Utc)),
            KanbanItem.Create("self-service", "ssr_1029", "Update emergency contact", KanbanLane.Backlog, null, KanbanPriority.Low,
                null, new[] { "profile" }, new DateTime(2026, 6, 22, 11, 30, 0, DateTimeKind.Utc)),
            KanbanItem.Create("self-service", "ssr_1030", "Second monitor for home office", KanbanLane.Done, "u_it_03", KanbanPriority.Low,
                new DateOnly(2026, 6, 7), new[] { "equipment" }, new DateTime(2026, 6, 7, 9, 30, 0, DateTimeKind.Utc)),
            KanbanItem.Create("self-service", "ssr_1031", "FSA contribution change", KanbanLane.Backlog, "u_ops_04", KanbanPriority.Low,
                null, new[] { "benefits" }, new DateTime(2026, 6, 22, 12, 0, 0, DateTimeKind.Utc)),
            KanbanItem.Create("issue", "iss_401", "Paystub PDF renders blank", KanbanLane.Backlog, null, KanbanPriority.High,
                new DateOnly(2026, 6, 25), new[] { "system-rendering", "critical" }, new DateTime(2026, 6, 22, 12, 45, 0, DateTimeKind.Utc)),
            KanbanItem.Create("issue", "iss_402", "Cannot access benefits portal from EMEA", KanbanLane.InProgress, "u_it_03", KanbanPriority.Medium,
                new DateOnly(2026, 6, 27), new[] { "access", "emea" }, new DateTime(2026, 6, 19, 21, 40, 0, DateTimeKind.Utc)),
            KanbanItem.Create("issue", "iss_403", "Hiring pipeline loads slowly", KanbanLane.InProgress, "u_it_03", KanbanPriority.Medium,
                new DateOnly(2026, 6, 30), new[] { "performance" }, new DateTime(2026, 6, 18, 19, 0, 0, DateTimeKind.Utc)),
            KanbanItem.Create("issue", "iss_404", "Headcount shows stale value", KanbanLane.Done, "u_it_01", KanbanPriority.Low,
                new DateOnly(2026, 6, 14), new[] { "data-quality" }, new DateTime(2026, 6, 14, 13, 0, 0, DateTimeKind.Utc)),
            KanbanItem.Create("delay", "dly_209", "Address change pending 9 days", KanbanLane.InProgress, "u_ops_07", KanbanPriority.High,
                new DateOnly(2026, 6, 23), new[] { "delay", "high" }, new DateTime(2026, 6, 22, 13, 0, 0, DateTimeKind.Utc)),
            KanbanItem.Create("delay", "dly_210", "Laptop battery request pending", KanbanLane.InReview, "u_it_03", KanbanPriority.Low,
                new DateOnly(2026, 6, 24), new[] { "delay" }, new DateTime(2026, 6, 22, 13, 5, 0, DateTimeKind.Utc)),
            KanbanItem.Create("delay", "dly_211", "Dependent enrollment pending 4 days", KanbanLane.Backlog, "u_ops_04", KanbanPriority.Medium,
                new DateOnly(2026, 6, 26), new[] { "delay", "benefits" }, new DateTime(2026, 6, 22, 3, 40, 0, DateTimeKind.Utc)),
            KanbanItem.Create("pulse-feedback", "pulse_2026_06", "Q2 Engagement Survey — review low-sentiment themes", KanbanLane.Backlog, "u_ops_07", KanbanPriority.Medium,
                new DateOnly(2026, 7, 5), new[] { "feedback" }, new DateTime(2026, 6, 18, 17, 30, 0, DateTimeKind.Utc)),
            KanbanItem.Create("pulse-feedback", "pulse_weekly_22", "Weekly Pulse — follow up on Sales sentiment", KanbanLane.InReview, "u_ops_07", KanbanPriority.Low,
                new DateOnly(2026, 6, 28), new[] { "feedback", "sales" }, new DateTime(2026, 6, 17, 12, 0, 0, DateTimeKind.Utc)),
            KanbanItem.Create("career", "cdp_205", "Marcus Lee's career plan is stalled", KanbanLane.Backlog, "emp_4490", KanbanPriority.Medium,
                new DateOnly(2026, 7, 1), new[] { "career" }, new DateTime(2026, 6, 21, 9, 0, 0, DateTimeKind.Utc)),
        ];
    }

    public IReadOnlyList<NotificationItem> CreateNotifications()
    {
        return
        [
            NotificationItem.Create("emp_4521", "status-update", "Address change is in progress", "People Ops is reviewing your request.", "self-service", "ssr_1024", false,
                new DateTime(2026, 6, 22, 15, 0, 0, DateTimeKind.Utc)),
            NotificationItem.Create("emp_4521", "chat", "New message from People Ops", "Can you confirm your new ZIP code?", "self-service", "ssr_1024", false,
                new DateTime(2026, 6, 22, 15, 5, 0, DateTimeKind.Utc)),
            NotificationItem.Create("emp_4521", "mention", "You were recognized by Marcus Lee", "Drove the Q2 release across the finish line.", "recognition", "rec_7782", false,
                new DateTime(2026, 6, 20, 20, 5, 0, DateTimeKind.Utc)),
            NotificationItem.Create("emp_4521", "system", "New learning recommendation", "Advanced System Design matches your career plan.", "learning", "lr_55", true,
                new DateTime(2026, 6, 21, 9, 0, 0, DateTimeKind.Utc)),
            NotificationItem.Create("emp_4521", "status-update", "Overtime payroll resolved", "June overtime has been disbursed.", "self-service", "ssr_1027", true,
                new DateTime(2026, 6, 17, 20, 45, 0, DateTimeKind.Utc)),
            NotificationItem.Create("emp_4521", "system", "Pulse survey due soon", "Q2 Engagement Survey closes June 30.", "pulse-feedback", "pulse_2026_06", false,
                new DateTime(2026, 6, 22, 12, 0, 0, DateTimeKind.Utc)),
            NotificationItem.Create("emp_4502", "status-update", "Career plan is stalled", "Review milestones with your manager.", "career", "cdp_205", false,
                new DateTime(2026, 6, 21, 9, 0, 0, DateTimeKind.Utc)),
            NotificationItem.Create("emp_4521", "chat", "New message from IT Support", "We are looking into the paystub rendering issue.", "issue", "iss_401", true,
                new DateTime(2026, 6, 22, 13, 30, 0, DateTimeKind.Utc)),
            NotificationItem.Create("emp_4530", "mention", "Recognized by John Williams", "5 years at the company — thank you!", "recognition", "rec_7783", true,
                new DateTime(2026, 6, 18, 3, 30, 0, DateTimeKind.Utc)),
            NotificationItem.Create("emp_4521", "system", "Delay concern acknowledged", "People Ops is reviewing your address-change delay.", "delay", "dly_209", false,
                new DateTime(2026, 6, 22, 13, 15, 0, DateTimeKind.Utc)),
        ];
    }

    public IReadOnlyList<ChatMessage> CreateChatMessages()
    {
        return
        [
            ChatMessage.Create("thread_ssr_1024", "emp_4521", "Ava Thompson", "u_ops_07",
                "Hi — can you confirm when my address change will be reviewed?",
                new DateTime(2026, 6, 22, 15, 5, 0, DateTimeKind.Utc), Array.Empty<string>()),
            ChatMessage.Create("thread_ssr_1024", "u_ops_07", "People Ops", "emp_4521",
                "Hi Ava — it is in progress. Could you confirm your new ZIP code?",
                new DateTime(2026, 6, 22, 15, 8, 0, DateTimeKind.Utc), Array.Empty<string>()),
            ChatMessage.Create("thread_ssr_1024", "emp_4521", "Ava Thompson", "u_ops_07",
                "Sure — 78701. Thanks!",
                new DateTime(2026, 6, 22, 15, 10, 0, DateTimeKind.Utc), Array.Empty<string>()),
            ChatMessage.Create("thread_iss_401", "emp_4521", "Ava Thompson", "u_it_03",
                "The paystub PDF is still rendering blank in Chrome 125.",
                new DateTime(2026, 6, 22, 13, 30, 0, DateTimeKind.Utc), new[] { "img_77" }),
            ChatMessage.Create("thread_iss_401", "u_it_03", "IT Support", "emp_4521",
                "Thanks — we are investigating. Can you try Edge in the meantime?",
                new DateTime(2026, 6, 22, 13, 35, 0, DateTimeKind.Utc), Array.Empty<string>()),
            ChatMessage.Create("thread_iss_401", "emp_4521", "Ava Thompson", "u_it_03",
                "It works in Edge. I will use that for now.",
                new DateTime(2026, 6, 22, 13, 40, 0, DateTimeKind.Utc), Array.Empty<string>()),
            ChatMessage.Create("thread_cdp_205", "emp_4490", "John Williams", "emp_4502",
                "Let us revisit your HR operations scorecard milestone this week.",
                new DateTime(2026, 6, 21, 9, 5, 0, DateTimeKind.Utc), Array.Empty<string>()),
            ChatMessage.Create("thread_cdp_205", "emp_4502", "Marcus Lee", "emp_4490",
                "Sounds good — Thursday works for me.",
                new DateTime(2026, 6, 21, 9, 10, 0, DateTimeKind.Utc), Array.Empty<string>()),
        ];
    }

    // The constructors create entities with random Guids; replace with the
    // seed-stable ids so the wire DTOs round-trip consistently. The base
    // entity exposes a seed-only SetIdInternal that is granted access via
    // [InternalsVisibleTo("HrInsights.SeedData")] on HrInsights.Domain.
    private static TEntity SetId<TEntity>(TEntity entity, Guid id)
        where TEntity : HrInsights.Domain.Common.EntityBase<Guid>
    {
        entity.SetIdInternal(id);
        return entity;
    }
}
