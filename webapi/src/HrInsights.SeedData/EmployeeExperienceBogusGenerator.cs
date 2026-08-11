using HrInsights.Contracts.EmployeeExperience;

namespace HrInsights.SeedData;

public sealed class EmployeeExperienceBogusGenerator
{
    private static readonly List<SelfServiceRequestDto> _selfServiceRequests =
    [
        new("ssr_1024", "emp_4521", "Ava Thompson", "address-change", "Update home address",
            "Moving to Austin, TX effective 07-15-2026. Please update payroll and benefits records.",
            "in-progress", "medium", "u_ops_07",
            "2026-06-13T10:15:00-04:00", "2026-06-20T11:02:00-04:00", ["doc_88"]),
        new("ssr_1025", "emp_4521", "Ava Thompson", "equipment", "Replacement laptop battery",
            "Battery draining within 2 hours; need a replacement under warranty.",
            "submitted", "high", null,
            "2026-06-21T08:00:00-04:00", null, []),
        new("ssr_1026", "emp_4521", "Ava Thompson", "benefits", "Add dependent to health plan",
            "Newborn dependent added; please enroll effective 01-07-2026.",
            "in-review", "medium", "u_ops_04",
            "2026-06-18T14:30:00+05:30", "2026-06-19T09:10:00+05:30", []),
        new("ssr_1027", "emp_4521", "Ava Thompson", "payroll", "Missing June overtime",
            "Overtime from 2026-06-10 was not reflected in the latest paystub.",
            "resolved", "high", "u_pay_02",
            "2026-06-12T08:00:00-04:00", "2026-06-17T16:45:00-04:00", []),
        new("ssr_1028", "emp_4521", "Ava Thompson", "leave-request", "Parental leave — Aug 2026",
            "Requesting 6 weeks parental leave starting 03-08-2026.",
            "in-progress", "medium", "u_ops_07",
            "2026-06-15T11:00:00-04:00", "2026-06-21T10:00:00-04:00", []),
        new("ssr_1029", "emp_4521", "Ava Thompson", "other", "Update emergency contact",
            "New emergency contact: Maria Becker, +1 512 555 0148.",
            "submitted", "low", null,
            "2026-06-22T07:30:00-04:00", null, []),
        new("ssr_1030", "emp_4521", "Ava Thompson", "equipment", "Second monitor for home office",
            "Requesting an additional 27\" monitor under the remote work stipend.",
            "rejected", "low", "u_it_03",
            "2026-06-05T09:00:00+05:30", "2026-06-07T15:00:00+05:30", []),
        new("ssr_1031", "emp_4521", "Ava Thompson", "benefits", "FSA contribution change",
            "Increase FSA contribution to $2,600 for the remainder of 2026.",
            "in-review", "low", "u_ops_04",
            "2026-06-19T12:45:00-04:00", "2026-06-22T08:00:00-04:00", []),
        new("ssr_1032", "emp_4521", "Ava Thompson", "payroll", "Update direct deposit details",
            "Switching to a new checking account for salary deposits starting next pay cycle.",
            "resolved", "medium", "u_pay_02",
            "2026-06-01T09:00:00-04:00", "2026-06-04T14:20:00-04:00", ["doc_101"]),
        new("ssr_1033", "emp_4521", "Ava Thompson", "leave-request", "Bereavement leave request",
            "Requesting 3 days bereavement leave for a family member starting 30-06-2026.",
            "submitted", "high", null,
            "2026-06-23T13:15:00-04:00", null, []),
        new("ssr_1034", "emp_4521", "Ava Thompson", "equipment", "Request ergonomic chair",
            "Current chair is causing back strain; need an ergonomic replacement approved by doctor.",
            "in-progress", "medium", "u_it_03",
            "2026-06-10T10:00:00-04:00", "2026-06-15T09:30:00-04:00", ["doc_102"]),
        new("ssr_1035", "emp_4521", "Ava Thompson", "benefits", "Update 401(k) contribution",
            "Increase 401(k) contribution from 6% to 10% effective July 2026.",
            "resolved", "low", "u_ops_04",
            "2026-06-08T08:30:00-04:00", "2026-06-12T11:45:00-04:00", []),
        new("ssr_1036", "emp_4521", "Ava Thompson", "payroll", "Expense reimbursement missing",
            "Travel expenses from the May client trip were not reimbursed on the latest payslip.",
            "in-review", "medium", "u_pay_02",
            "2026-06-16T15:45:00-04:00", "2026-06-20T10:00:00-04:00", ["doc_103", "doc_104"]),
        new("ssr_1037", "emp_4521", "Ava Thompson", "equipment", "VPN access not working",
            "Unable to connect to corporate VPN from home office since 2026-06-18.",
            "rejected", "high", "u_it_01",
            "2026-06-18T11:00:00-04:00", "2026-06-21T16:00:00-04:00", []),
        new("ssr_1038", "emp_4521", "Ava Thompson", "leave-request", "Work-from-home extension",
            "Requesting to extend WFH arrangement through 31-12-2026 due to relocation plans.",
            "submitted", "low", null,
            "2026-06-20T09:45:00+05:30", null, []),
        new("ssr_1039", "emp_4521", "Ava Thompson", "other", "Name change after marriage",
            "Updated legal name is Ava Lee-Thompson; please reflect across HR systems.",
            "in-progress", "medium", "u_ops_07",
            "2026-06-14T08:00:00-04:00", "2026-06-19T13:20:00-04:00", ["doc_105"]),
        new("ssr_1040", "emp_4521", "Ava Thompson", "benefits", "Enrollment in gym reimbursement",
            "Enrolling in the wellness benefit for monthly gym reimbursement up to $75.",
            "resolved", "low", "u_ops_04",
            "2026-06-02T10:30:00-04:00", "2026-06-06T09:15:00-04:00", []),
        new("ssr_1041", "emp_4521", "Ava Thompson", "payroll", "Tax withholding adjustment",
            "Need to update W-4 allowances following recent household income change.",
            "in-review", "high", "u_pay_02",
            "2026-06-17T14:00:00-04:00", "2026-06-21T08:45:00-04:00", ["doc_106"]),
        new("ssr_1042", "emp_4521", "Ava Thompson", "equipment", "Headset replacement",
            "Current headset microphone is no longer functional; affects daily client calls.",
            "submitted", "medium", null,
            "2026-06-23T09:30:00-04:00", null, []),
        new("ssr_1043", "emp_4521", "Ava Thompson", "leave-request", "Sick leave — doctor appointment",
            "Taking a half-day for a scheduled specialist appointment on 25-06-2026 afternoon.",
            "resolved", "low", "u_ops_07",
            "2026-06-24T07:00:00-04:00", "2026-06-24T09:00:00-04:00", []),
        new("ssr_1044", "emp_4521", "Ava Thompson", "payroll", "Relocation allowance inquiry",
            "Inquiring about relocation reimbursement eligibility for the upcoming office transfer.",
            "submitted", "medium", null,
            "2026-06-21T11:00:00+05:30", null, []),
        new("ssr_1045", "emp_4521", "Ava Thompson", "benefits", "Vision insurance enrollment",
            "Missed open enrollment; requesting a qualifying life event exception for vision plan.",
            "in-progress", "high", "u_ops_04",
            "2026-06-11T10:00:00-04:00", "2026-06-16T15:30:00-04:00", []),
        new("ssr_1046", "emp_4521", "Ava Thompson", "other", "Update personal pronouns",
            "Please update display name and pronouns in directory to she/her.",
            "resolved", "low", "u_ops_07",
            "2026-06-03T09:15:00-04:00", "2026-06-05T11:00:00-04:00", []),
        new("ssr_1047", "emp_4521", "Ava Thompson", "equipment", "Laptop screen flicker",
            "Screen flickers intermittently when docked to external monitor; affects presentations.",
            "in-review", "medium", "u_it_03",
            "2026-06-19T13:00:00-04:00", "2026-06-22T10:30:00-04:00", []),
        new("ssr_1048", "emp_4521", "Ava Thompson", "leave-request", "Jury duty leave",
            "Summoned for jury duty the week of 06-07-2026; requesting approved leave.",
            "submitted", "medium", null,
            "2026-06-22T16:00:00-04:00", null, ["doc_107"]),
    ];

    private static readonly List<PulseSurveyDto> _pulseSurveys =
    [
        new("pulse_2026_06", "camp-1", "Q2 Employee Engagement Survey", "active", "quarterly",
            new[] { "q_eng_1", "q_eng_2" }, 72m, 610, "2026-06-01T00:00:00Z", "2026-06-30T23:59:59Z",
            new ThemeSentimentDto[]
            {
                new("Work-Life Balance", 65, "Engineering"),
                new("Career Growth", 45, "Engineering"),
                new("Management", 72, "Sales"),
                new("Compensation", 38, "Marketing"),
            }),
        new("pulse_weekly_22", "camp-2", "Weekly Pulse Check", "active", "weekly",
            new[] { "q_pulse_1" }, 85m, 720, "2026-06-08T00:00:00Z", null,
            new ThemeSentimentDto[]
            {
                new("Work-Life Balance", 58, "Engineering"),
                new("Team Collaboration", 78, "HR"),
            }),
        new("pulse_manager_draft", "camp-3", "Manager Feedback", "draft", "one-time",
            new[] { "q_mgr_1" }, 0m, 0, "2026-07-01T00:00:00Z", "2026-07-31T23:59:59Z",
            Array.Empty<ThemeSentimentDto>()),
        new("pulse_Q1_archived", null, "Q1 Engagement Pulse", "closed", "quarterly",
            new[] { "q_q1_1" }, 64m, 540, "2026-03-01T00:00:00Z", "2026-03-31T23:59:59Z",
            new ThemeSentimentDto[]
            {
                new("Leadership Trust", 70, "Engineering"),
                new("Recognition", 55, "Marketing"),
            }),
    ];

    private static readonly List<PulseResponseDto> _pulseResponses =
    [
        new("resp_001", "pulse_2026_06", "emp_4521", "Engineering", 80m, "2026-06-10T14:22:00-04:00", "Roadmap visibility has improved this quarter."),
        new("resp_002", "pulse_2026_06", null, "Engineering", 25m, "2026-06-11T09:00:00-04:00", "Workload spikes are still common."),
        new("resp_003", "pulse_2026_06", "emp_4502", "HR", 74m, "2026-06-12T11:30:00+02:00", null),
        new("resp_004", "pulse_weekly_22", null, "Sales", 30m, "2026-06-15T18:05:00+05:30", "Quota pressure is high."),
        new("resp_005", "pulse_weekly_22", "emp_4530", "Engineering", 90m, "2026-06-16T10:10:00+05:30", "Great team collaboration this week."),
        new("resp_006", "pulse_2026_06", null, "Marketing", -10m, "2026-06-14T15:45:00-04:00", "Need clearer compensation bands."),
        new("resp_007", "pulse_weekly_22", null, "HR", 60m, "2026-06-17T08:00:00-04:00", null),
        new("resp_008", "pulse_2026_06", "emp_4490", "Engineering", 70m, "2026-06-18T13:30:00-04:00", "New learning stipend is appreciated."),
    ];

    private static readonly List<RecognitionDto> _recognitions =
    [
        new("rec_7782", "emp_4502", "Marcus Lee", "emp_4521", "Ava Thompson", "peer-shoutout",
            "Drove the Q2 release across the finish line.", "Innovation", "2026-06-20T16:05:00-04:00", "public"),
        new("rec_7783", "emp_4490", "John Williams", "emp_4530", "Priya Nair", "milestone",
            "5 years at the company — thank you for your leadership.", "Tenure", "2026-06-18T09:00:00+05:30", "team"),
        new("rec_7784", "emp_4521", "Ava Thompson", "emp_4490", "John Williams", "leadership",
            "Clear comms during the re-org.", null, "2026-06-21T11:00:00-04:00", "public"),
        new("rec_7785", "emp_4530", "Priya Nair", "emp_4555", "Sofia Garcia", "team-win",
            "Closed 3 enterprise deals in one week!", "Customer Focus", "2026-06-19T17:30:00-04:00", "public"),
        new("rec_7786", "emp_4560", "Liam Becker", "emp_4521", "Ava Thompson", "peer-shoutout",
            "Mentored two new hires with patience.", "Mentorship", "2026-06-22T08:30:00-04:00", "team"),
        new("rec_7787", "emp_4490", "John Williams", "emp_4555", "Sofia Garcia", "milestone",
            "Promoted to Senior AE — congrats!", "Growth", "2026-06-17T10:00:00-04:00", "public"),
    ];

    private static readonly List<CareerMilestoneDto> _milestones =
    [
        new("mil_301", "cdp_204", "Lead architecture review for payments", "2026-09-30", "in-progress", "doc_991"),
        new("mil_302", "cdp_204", "Mentor two junior engineers through onboarding", "2026-08-15", "completed", "doc_992"),
        new("mil_303", "cdp_204", "Publish a technical RFC on platform reliability", "2026-11-30", "not-started", null),
        new("mil_304", "cdp_204", "Present at an internal engineering forum", "2026-12-15", "not-started", null),
        new("mil_310", "cdp_205", "Define HR operations scorecard", "2026-05-31", "blocked", null),
        new("mil_311", "cdp_205", "Run quarterly HR retro", "2026-07-15", "not-started", null),
        new("mil_312", "cdp_205", "Propose recognition program refresh", "2026-08-30", "not-started", null),
    ];

    private static readonly List<CareerDevelopmentPlanDto> _careerPlans =
    [
        new("cdp_204", "emp_4521", "Ava Thompson", "emp_4490", "Senior Software Engineer", "Staff Engineer",
            "12-months", "on-track",
            new CareerMilestoneDto[]
            {
                new("mil_301", "cdp_204", "Lead architecture review for payments", "2026-09-30", "in-progress", "doc_991"),
                new("mil_302", "cdp_204", "Mentor two junior engineers through onboarding", "2026-08-15", "completed", "doc_992"),
                new("mil_303", "cdp_204", "Publish a technical RFC on platform reliability", "2026-11-30", "not-started", null),
                new("mil_304", "cdp_204", "Present at an internal engineering forum", "2026-12-15", "not-started", null),
            },
            "2026-06-10T00:00:00Z"),
        new("cdp_205", "emp_4502", "Marcus Lee", "emp_4490", "People Ops Manager", null,
            "6-months", "stalled",
            new CareerMilestoneDto[]
            {
                new("mil_310", "cdp_205", "Define HR operations scorecard", "2026-05-31", "blocked", null),
                new("mil_311", "cdp_205", "Run quarterly HR retro", "2026-07-15", "not-started", null),
                new("mil_312", "cdp_205", "Propose recognition program refresh", "2026-08-30", "not-started", null),
            },
            null),
    ];

    private static readonly List<LearningRecommendationDto> _learningRecommendations =
    [
        new("lr_55", "cdp_204", "emp_4521", "Advanced System Design", "Internal Academy", "course", "system-design",
            "Aligns with Staff Engineer milestone on platform reliability.", 0.92m, 12m, "suggested", "2026-06-21T09:00:00Z"),
        new("lr_56", "cdp_204", "emp_4521", "Mentoring Foundations", "LinkedIn Learning", "video", "mentoring",
            "Supports the mentoring milestone in your plan.", 0.78m, 3m, "in-progress", "2026-06-19T09:00:00Z"),
        new("lr_57", "cdp_204", "emp_4521", "Writing Effective RFCs", null, "article", "communication",
            "Prepares you for the upcoming RFC milestone.", 0.71m, 1m, "saved", "2026-06-20T09:00:00Z"),
        new("lr_58", "cdp_204", "emp_4521", "Staff Engineer Leadership Cohort", "Internal Academy", "mentoring", "leadership",
            "Cohort program for engineers targeting Staff level.", 1.0m, 16m, "suggested", "2026-06-22T09:00:00Z"),
        new("lr_59", null, "emp_4521", "Accessibility in Practice", "Deque University", "certification", "accessibility",
            "Recommended for all engineers building UI surfaces.", null, 8m, "suggested", "2026-06-18T09:00:00Z"),
        new("lr_60", "cdp_204", "emp_4521", "Reliability Engineering Project", null, "project", "reliability",
            "Hands-on platform reliability project.", 0.85m, 24m, "completed", "2026-06-01T09:00:00Z"),
        new("lr_61", "cdp_205", "emp_4502", "HR Analytics Fundamentals", "Coursera", "course", "analytics",
            "Supports the HR operations scorecard milestone.", 0.81m, 10m, "suggested", "2026-06-20T09:00:00Z"),
        new("lr_62", "cdp_205", "emp_4502", "Running Great Retros", "Internal Academy", "video", "facilitation",
            null, 0.6m, 2m, "dismissed", "2026-06-17T09:00:00Z"),
    ];

    private static readonly List<IssueReportDto> _issueReports =
    [
        new("iss_401", "emp_4521", "Ava Thompson", "system-rendering", "Paystub PDF renders blank",
            "Open paystub in Chrome and PDF is blank; works in Edge.", "/pay/stub/2026-05", "Chrome 125",
            new[] { "img_77" }, "submitted", "high", null, "2026-06-22T08:45:00-04:00", null),
        new("iss_402", "emp_4530", "Priya Nair", "access", "Cannot access benefits portal from EMEA",
            "SSO redirect loops when accessing benefits from India.", "/benefits", "Edge 124",
            Array.Empty<string>(), "acknowledged", "medium", "u_it_03", "2026-06-20T03:10:00+05:30", null),
        new("iss_403", "emp_4555", "Sofia Garcia", "performance", "Hiring pipeline loads slowly",
            "Pipeline view takes ~12s to load on slow connections.", "/hiring", null,
            Array.Empty<string>(), "in-progress", "medium", "u_it_03", "2026-06-18T15:00:00-04:00", null),
        new("iss_404", "emp_4560", "Liam Becker", "data-quality", "Headcount shows stale value",
            "Overview headcount was off by 5 for two days before refreshing.", "/", "Chrome 125",
            Array.Empty<string>(), "resolved", "low", "u_it_01", "2026-06-12T11:00:00-04:00", "2026-06-14T09:00:00-04:00"),
    ];

    private static readonly List<DelayConcernDto> _delayConcerns =
    [
        new("dly_209", "emp_4521", "Ava Thompson", "self-service", "ssr_1024", "Address change pending 9 days",
            "Submitted on 2026-06-13 and no HR update yet.", 9, 5, "open", "high", "2026-06-22T09:00:00-04:00"),
        new("dly_210", "emp_4502", "Marcus Lee", "self-service", "ssr_1025", "Laptop battery request pending",
            "No update after 1 day; blocking field work.", 1, 2, "acknowledged", "low", "2026-06-22T09:05:00-04:00"),
        new("dly_211", "emp_4530", "Priya Nair", "benefits", "ssr_1026", "Dependent enrollment pending 4 days",
            "Enrollment window closing soon.", 4, null, "open", "medium", "2026-06-22T09:10:00+05:30"),
    ];

    private static readonly List<KanbanItemDto> _kanbanItems =
    [
        new("kb_01", "self-service", "ssr_1024", "Address change pending", "in-progress", "u_ops_07", "medium", "2026-06-26",
            new[] { "payroll", "emea" }, "2026-06-22T10:00:00-04:00"),
        new("kb_02", "self-service", "ssr_1025", "Replacement laptop battery", "backlog", null, "high", "2026-06-24",
            new[] { "equipment" }, "2026-06-21T08:00:00-04:00"),
        new("kb_03", "self-service", "ssr_1026", "Add dependent to health plan", "backlog", "u_ops_04", "medium", "2026-06-30",
            new[] { "benefits" }, "2026-06-19T09:10:00+05:30"),
        new("kb_04", "self-service", "ssr_1027", "Missing June overtime", "done", "u_pay_02", "high", "2026-06-17",
            new[] { "payroll" }, "2026-06-17T16:45:00-04:00"),
        new("kb_05", "self-service", "ssr_1028", "Parental leave — Aug 2026", "in-review", "u_ops_07", "medium", "2026-07-15",
            new[] { "leave" }, "2026-06-21T10:00:00-04:00"),
        new("kb_06", "self-service", "ssr_1029", "Update emergency contact", "backlog", null, "low", null,
            new[] { "profile" }, "2026-06-22T07:30:00-04:00"),
        new("kb_07", "self-service", "ssr_1030", "Second monitor for home office", "done", "u_it_03", "low", "2026-06-07",
            new[] { "equipment" }, "2026-06-07T15:00:00+05:30"),
        new("kb_08", "self-service", "ssr_1031", "FSA contribution change", "backlog", "u_ops_04", "low", null,
            new[] { "benefits" }, "2026-06-22T08:00:00-04:00"),
        new("kb_09", "issue", "iss_401", "Paystub PDF renders blank", "backlog", null, "high", "2026-06-25",
            new[] { "system-rendering", "critical" }, "2026-06-22T08:45:00-04:00"),
        new("kb_10", "issue", "iss_402", "Cannot access benefits portal from EMEA", "in-progress", "u_it_03", "medium", "2026-06-27",
            new[] { "access", "emea" }, "2026-06-20T03:10:00+05:30"),
        new("kb_11", "issue", "iss_403", "Hiring pipeline loads slowly", "in-progress", "u_it_03", "medium", "2026-06-30",
            new[] { "performance" }, "2026-06-18T15:00:00-04:00"),
        new("kb_12", "issue", "iss_404", "Headcount shows stale value", "done", "u_it_01", "low", "2026-06-14",
            new[] { "data-quality" }, "2026-06-14T09:00:00-04:00"),
        new("kb_13", "delay", "dly_209", "Address change pending 9 days", "in-progress", "u_ops_07", "high", "2026-06-23",
            new[] { "delay", "high" }, "2026-06-22T09:00:00-04:00"),
        new("kb_14", "delay", "dly_210", "Laptop battery request pending", "in-review", "u_it_03", "low", "2026-06-24",
            new[] { "delay" }, "2026-06-22T09:05:00-04:00"),
        new("kb_15", "delay", "dly_211", "Dependent enrollment pending 4 days", "backlog", "u_ops_04", "medium", "2026-06-26",
            new[] { "delay", "benefits" }, "2026-06-22T09:10:00+05:30"),
        new("kb_16", "pulse-feedback", "pulse_2026_06", "Q2 Engagement Survey — review low-sentiment themes", "backlog", "u_ops_07", "medium", "2026-07-05",
            new[] { "feedback" }, "2026-06-18T13:30:00-04:00"),
        new("kb_17", "pulse-feedback", "pulse_weekly_22", "Weekly Pulse — follow up on Sales sentiment", "in-review", "u_ops_07", "low", "2026-06-28",
            new[] { "feedback", "sales" }, "2026-06-17T08:00:00-04:00"),
        new("kb_18", "career", "cdp_205", "Marcus Lee's career plan is stalled", "backlog", "emp_4490", "medium", "2026-07-01",
            new[] { "career" }, "2026-06-21T09:00:00Z"),
    ];

    private static readonly List<NotificationItemDto> _notifications =
    [
        new("not_9001", "emp_4521", "status-update", "Address change is in progress", "People Ops is reviewing your request.", "self-service", "ssr_1024", false, "2026-06-22T11:00:00-04:00"),
        new("not_9002", "emp_4521", "chat", "New message from People Ops", "Can you confirm your new ZIP code?", "self-service", "ssr_1024", false, "2026-06-22T11:05:00-04:00"),
        new("not_9003", "emp_4521", "mention", "You were recognized by Marcus Lee", "Drove the Q2 release across the finish line.", "recognition", "rec_7782", false, "2026-06-20T16:05:00-04:00"),
        new("not_9004", "emp_4521", "system", "New learning recommendation", "Advanced System Design matches your career plan.", "learning", "lr_55", true, "2026-06-21T09:00:00Z"),
        new("not_9005", "emp_4521", "status-update", "Overtime payroll resolved", "June overtime has been disbursed.", "self-service", "ssr_1027", true, "2026-06-17T16:45:00-04:00"),
        new("not_9006", "emp_4521", "system", "Pulse survey due soon", "Q2 Engagement Survey closes June 30.", "pulse-feedback", "pulse_2026_06", false, "2026-06-22T08:00:00-04:00"),
        new("not_9007", "emp_4502", "status-update", "Career plan is stalled", "Review milestones with your manager.", "career", "cdp_205", false, "2026-06-21T09:00:00Z"),
        new("not_9008", "emp_4521", "chat", "New message from IT Support", "We are looking into the paystub rendering issue.", "issue", "iss_401", true, "2026-06-22T09:30:00-04:00"),
        new("not_9009", "emp_4530", "mention", "Recognized by John Williams", "5 years at the company — thank you!", "recognition", "rec_7783", true, "2026-06-18T09:00:00+05:30"),
        new("not_9010", "emp_4521", "system", "Delay concern acknowledged", "People Ops is reviewing your address-change delay.", "delay", "dly_209", false, "2026-06-22T09:15:00-04:00"),
    ];

    private static readonly List<ChatMessageDto> _chatMessages =
    [
        new("msg_5500", "thread_ssr_1024", "emp_4521", "Ava Thompson", "u_ops_07",
            "Hi — can you confirm when my address change will be reviewed?", "2026-06-22T11:05:00-04:00", Array.Empty<string>()),
        new("msg_5501", "thread_ssr_1024", "u_ops_07", "People Ops", "emp_4521",
            "Hi Ava — it is in progress. Could you confirm your new ZIP code?", "2026-06-22T11:08:00-04:00", Array.Empty<string>()),
        new("msg_5502", "thread_ssr_1024", "emp_4521", "Ava Thompson", "u_ops_07",
            "Sure — 78701. Thanks!", "2026-06-22T11:10:00-04:00", Array.Empty<string>()),
        new("msg_5503", "thread_iss_401", "emp_4521", "Ava Thompson", "u_it_03",
            "The paystub PDF is still rendering blank in Chrome 125.", "2026-06-22T09:30:00-04:00", new[] { "img_77" }),
        new("msg_5504", "thread_iss_401", "u_it_03", "IT Support", "emp_4521",
            "Thanks — we are investigating. Can you try Edge in the meantime?", "2026-06-22T09:35:00-04:00", Array.Empty<string>()),
        new("msg_5505", "thread_iss_401", "emp_4521", "Ava Thompson", "u_it_03",
            "It works in Edge. I will use that for now.", "2026-06-22T09:40:00-04:00", Array.Empty<string>()),
        new("msg_5506", "thread_cdp_205", "emp_4490", "John Williams", "emp_4502",
            "Let us revisit your HR operations scorecard milestone this week.", "2026-06-21T09:05:00Z", Array.Empty<string>()),
        new("msg_5507", "thread_cdp_205", "emp_4502", "Marcus Lee", "emp_4490",
            "Sounds good — Thursday works for me.", "2026-06-21T09:10:00Z", Array.Empty<string>()),
    ];

    private int _nextId = 2000;
    private string NextId(string prefix) => $"{prefix}_{++_nextId}";

    // ── Self-Service ───────────────────────────────────────────────
    public IReadOnlyList<SelfServiceRequestDto> GetSelfServiceRequests()
        => _selfServiceRequests.ToList();

    public SelfServiceRequestDto AddSelfServiceRequest(CreateSelfServiceRequest request)
    {
        var dto = new SelfServiceRequestDto(
            Id: NextId("ssr"),
            EmployeeId: "emp_4521",
            EmployeeName: "Ava Thompson",
            Type: request.Type,
            Subject: request.Subject,
            Details: request.Details,
            Status: "submitted",
            Priority: request.Priority ?? "medium",
            AssignedTo: null,
            CreatedAt: DateTimeOffset.UtcNow.ToString("O"),
            UpdatedAt: null,
            Attachments: Array.Empty<string>());
        _selfServiceRequests.Add(dto);
        AddKanbanItem("self-service", dto.Id, dto.Subject, dto.Priority ?? "medium", new[] { dto.Type });
        return dto;
    }

    // ── Pulse Surveys ──────────────────────────────────────────────
    public IReadOnlyList<PulseSurveyDto> GetPulseSurveys()
        => _pulseSurveys.ToList();

    public IReadOnlyList<PulseResponseDto> GetPulseResponses(string pulseSurveyId)
        => _pulseResponses.Where(r => r.PulseSurveyId == pulseSurveyId).ToList();

    public PulseResponseDto AddPulseResponse(CreatePulseResponseRequest request)
    {
        var dto = new PulseResponseDto(
            Id: NextId("resp"),
            PulseSurveyId: request.PulseSurveyId,
            EmployeeId: "emp_4521",
            Department: "Engineering",
            Sentiment: request.Sentiment,
            SubmittedAt: DateTimeOffset.UtcNow.ToString("O"),
            Comment: request.Comment);
        _pulseResponses.Add(dto);
        var survey = _pulseSurveys.FirstOrDefault(s => s.Id == request.PulseSurveyId);
        if (survey is not null)
        {
            var idx = _pulseSurveys.IndexOf(survey);
            _pulseSurveys[idx] = survey with
            {
                TotalResponses = survey.TotalResponses + 1,
                ResponseRate = Math.Min(100m, survey.ResponseRate + 1),
            };
        }
        return dto;
    }

    // ── Recognitions ─────────────────────────────────────────────
    public IReadOnlyList<RecognitionDto> GetRecognitions()
        => _recognitions.ToList();

    public RecognitionDto AddRecognition(CreateRecognitionRequest request)
    {
        var dto = new RecognitionDto(
            Id: NextId("rec"),
            FromEmployeeId: "emp_4521",
            FromName: "Ava Thompson",
            ToEmployeeId: request.ToEmployeeId,
            ToName: request.ToName,
            Type: request.Type,
            Message: request.Message,
            Value: request.Value,
            CreatedAt: DateTimeOffset.UtcNow.ToString("O"),
            VisibleTo: request.VisibleTo);
        _recognitions.Add(dto);
        return dto;
    }

    // ── Career Plans ──────────────────────────────────────────────
    public IReadOnlyList<CareerDevelopmentPlanDto> GetCareerPlans()
        => _careerPlans.ToList();

    public CareerDevelopmentPlanDto? UpdateMilestone(string planId, string milestoneId, UpdateMilestoneRequest request)
    {
        var planIdx = _careerPlans.FindIndex(p => p.Id == planId);
        if (planIdx == -1) return null;

        var plan = _careerPlans[planIdx];
        var updatedMilestones = plan.Milestones.Select(m =>
            m.Id == milestoneId ? m with { Status = request.Status } : m).ToList();

        var statuses = updatedMilestones.Select(m => m.Status).ToList();
        var newPlanStatus = RecalcPlanStatus(statuses, plan.Status);

        var updatedPlan = plan with
        {
            Milestones = updatedMilestones,
            Status = newPlanStatus,
            LastReviewedAt = DateTimeOffset.UtcNow.ToString("O"),
        };
        _careerPlans[planIdx] = updatedPlan;
        return updatedPlan;
    }

    private static string RecalcPlanStatus(IReadOnlyList<string> statuses, string currentStatus)
    {
        if (statuses.All(s => s == "completed")) return "completed";
        if (statuses.Any(s => s == "blocked")) return "stalled";
        if (statuses.Any(s => s == "in-progress")) return "on-track";
        return currentStatus;
    }

    // ── Learning Recommendations ───────────────────────────────────
    public IReadOnlyList<LearningRecommendationDto> GetLearningRecommendations()
        => _learningRecommendations.ToList();

    public LearningRecommendationDto? UpdateLearningStatus(string id, UpdateLearningRequest request)
    {
        var idx = _learningRecommendations.FindIndex(l => l.Id == id);
        if (idx == -1) return null;
        var updated = _learningRecommendations[idx] with { Status = request.Status };
        _learningRecommendations[idx] = updated;
        return updated;
    }

    // ── Issues ──────────────────────────────────────────────────
    public IReadOnlyList<IssueReportDto> GetIssueReports()
        => _issueReports.ToList();

    public IssueReportDto AddIssueReport(CreateIssueReportRequest request)
    {
        var dto = new IssueReportDto(
            Id: NextId("iss"),
            ReportedBy: "emp_4521",
            ReportedByName: "Ava Thompson",
            Category: request.Category,
            Subject: request.Subject,
            Description: request.Description,
            Url: request.Url,
            Browser: request.Browser,
            Attachments: Array.Empty<string>(),
            Status: "submitted",
            Priority: request.Priority ?? "medium",
            AssignedTo: null,
            CreatedAt: DateTimeOffset.UtcNow.ToString("O"),
            ResolvedAt: null);
        _issueReports.Add(dto);
        AddKanbanItem("issue", dto.Id, dto.Subject, dto.Priority ?? "medium", new[] { dto.Category });
        return dto;
    }

    // ── Delays ───────────────────────────────────────────────────
    public IReadOnlyList<DelayConcernDto> GetDelayConcerns()
        => _delayConcerns.ToList();

    public DelayConcernDto AddDelayConcern(CreateDelayConcernRequest request)
    {
        var dto = new DelayConcernDto(
            Id: NextId("dly"),
            RaisedBy: "emp_4521",
            RaisedByName: "Ava Thompson",
            RelatedEntityType: request.RelatedEntityType,
            RelatedEntityId: request.RelatedEntityId,
            Subject: request.Subject,
            Details: request.Details,
            DaysWaiting: request.DaysWaiting,
            ExpectedSlackDays: request.ExpectedSlackDays,
            Status: "open",
            Severity: request.Severity ?? "medium",
            CreatedAt: DateTimeOffset.UtcNow.ToString("O"));
        _delayConcerns.Add(dto);
        AddKanbanItem("delay", dto.Id, dto.Subject, dto.Severity ?? "medium", new[] { "delay", dto.RelatedEntityType });
        return dto;
    }

    // ── Kanban ──────────────────────────────────────────────────
    public IReadOnlyList<KanbanItemDto> GetKanbanItems()
        => _kanbanItems.ToList();

    public KanbanItemDto? UpdateKanbanLane(string id, UpdateKanbanLaneRequest request)
    {
        var idx = _kanbanItems.FindIndex(k => k.Id == id);
        if (idx == -1) return null;
        var item = _kanbanItems[idx];
        var updated = item with { Lane = request.Lane, UpdatedAt = DateTimeOffset.UtcNow.ToString("O") };
        _kanbanItems[idx] = updated;
        SyncSourceStatus(item.SourceType, item.SourceId, request.Lane);
        return updated;
    }

    private void AddKanbanItem(string sourceType, string sourceId, string title, string priority, IReadOnlyList<string> tags)
    {
        _kanbanItems.Add(new KanbanItemDto(
            Id: NextId("kb"),
            SourceType: sourceType,
            SourceId: sourceId,
            Title: title,
            Lane: "backlog",
            AssigneeId: null,
            Priority: priority,
            DueDate: null,
            Tags: tags,
            UpdatedAt: DateTimeOffset.UtcNow.ToString("O")));
    }

    private void SyncSourceStatus(string sourceType, string sourceId, string lane)
    {
        var statusByLane = new Dictionary<string, string>
        {
            ["backlog"] = "submitted",
            ["in-progress"] = "in-progress",
            ["in-review"] = "in-review",
            ["done"] = "resolved",
        };
        if (!statusByLane.TryGetValue(lane, out var nextStatus)) return;

        if (sourceType == "self-service")
        {
            var idx = _selfServiceRequests.FindIndex(r => r.Id == sourceId);
            if (idx != -1)
            {
                var r = _selfServiceRequests[idx];
                _selfServiceRequests[idx] = r with { Status = nextStatus, UpdatedAt = DateTimeOffset.UtcNow.ToString("O") };
            }
        }
        else if (sourceType == "issue")
        {
            var idx = _issueReports.FindIndex(i => i.Id == sourceId);
            if (idx != -1)
            {
                var i = _issueReports[idx];
                _issueReports[idx] = i with
                {
                    Status = nextStatus,
                    ResolvedAt = lane == "done" ? DateTimeOffset.UtcNow.ToString("O") : i.ResolvedAt,
                };
            }
        }
        else if (sourceType == "delay")
        {
            var idx = _delayConcerns.FindIndex(d => d.Id == sourceId);
            if (idx != -1)
            {
                var d = _delayConcerns[idx];
                _delayConcerns[idx] = d with { Status = nextStatus };
            }
        }
    }

    // ── Notifications ─────────────────────────────────────────────
    public IReadOnlyList<NotificationItemDto> GetNotifications(string userId)
        => _notifications.Where(n => n.UserId == userId).ToList();

    public bool MarkNotificationRead(string id)
    {
        var idx = _notifications.FindIndex(n => n.Id == id);
        if (idx == -1) return false;
        _notifications[idx] = _notifications[idx] with { Read = true };
        return true;
    }

    public void MarkAllNotificationsRead(string userId)
    {
        for (int i = 0; i < _notifications.Count; i++)
        {
            if (_notifications[i].UserId == userId)
                _notifications[i] = _notifications[i] with { Read = true };
        }
    }

    // ── Chat Messages ───────────────────────────────────────────
    public IReadOnlyList<ChatMessageDto> GetChatMessages(string threadId)
        => _chatMessages.Where(m => m.ThreadId == threadId).ToList();

    public ChatMessageDto AddChatMessage(CreateChatMessageRequest request)
    {
        var dto = new ChatMessageDto(
            Id: NextId("msg"),
            ThreadId: request.ThreadId,
            FromId: "emp_4521",
            FromName: "Ava Thompson",
            ToId: request.ToId,
            Body: request.Body,
            SentAt: DateTimeOffset.UtcNow.ToString("O"),
            Attachments: Array.Empty<string>());
        _chatMessages.Add(dto);
        return dto;
    }
}
