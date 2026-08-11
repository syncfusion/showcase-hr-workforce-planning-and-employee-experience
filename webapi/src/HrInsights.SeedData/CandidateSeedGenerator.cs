using Bogus;
using HrInsights.Domain.Entities;
using HrInsights.Domain.Enums;

namespace HrInsights.SeedData;

/// <summary>
/// Generates hardcoded Candidate seed data using Bogus with a deterministic
/// seed so dev output is stable. Mirrors the candidate distribution and
/// source list the React mockup (<c>sampleCandidates.ts</c>) used to provide.
/// </summary>
public sealed class CandidateSeedGenerator
{
    // Same status weights as the React sampleCandidates.ts: a healthy funnel
    // with lots of new, few at the end.
    private static readonly (CandidateStatus Status, double Weight)[] StatusWeights =
    [
        (CandidateStatus.New, 0.28),
        (CandidateStatus.Screening, 0.26),
        (CandidateStatus.Interview, 0.18),
        (CandidateStatus.Offer, 0.07),
        (CandidateStatus.Hired, 0.03),
        (CandidateStatus.Rejected, 0.18),
    ];

    private static readonly string[] Sources =
    [
        "LinkedIn", "Indeed", "DOU", "Djinni", "Referral",
        "Glassdoor", "AngelList", "Stack Overflow", "Company Website", "Recruiter Outreach",
    ];

    private static readonly string[] Departments =
    [
        "Engineering", "Product", "Design", "Data", "Marketing",
        "Sales", "Customer Success", "People", "Finance", "Operations",
        "Security", "Platform",
    ];

    private static readonly Dictionary<string, string[]> RolesByDepartment = new()
    {
        ["Engineering"] = [
            "Senior Frontend Engineer", "Backend Engineer", "Staff Software Engineer",
            "Mobile Engineer (iOS)", "Mobile Engineer (Android)",
            "Engineering Manager", "Site Reliability Engineer",
        ],
        ["Product"] = [
            "Product Manager", "Senior Product Manager",
            "Product Analyst", "Technical Product Manager",
        ],
        ["Design"] = [
            "Product Designer", "Senior UX Researcher", "Brand Designer",
            "Design Systems Lead", "Motion Designer",
        ],
        ["Data"] = [
            "Data Scientist", "Analytics Engineer", "ML Engineer",
            "Data Platform Engineer", "BI Analyst",
        ],
        ["Marketing"] = [
            "Content Marketing Manager", "Growth Marketer", "SEO Specialist",
            "Field Marketing Lead", "Brand Strategist",
        ],
        ["Sales"] = [
            "Account Executive", "Sales Development Rep", "Enterprise AE",
            "Solutions Engineer", "Sales Operations Analyst",
        ],
        ["Customer Success"] = [
            "CS Manager", "Onboarding Specialist",
            "Customer Success Engineer", "Renewals Manager",
        ],
        ["People"] = [
            "Talent Acquisition Partner", "People Operations Lead",
            "Compensation Analyst", "L&D Specialist",
        ],
        ["Finance"] = [
            "Financial Analyst", "Controller", "FP&A Manager", "Treasury Analyst",
        ],
        ["Operations"] = [
            "Operations Manager", "Business Operations Analyst", "Workforce Planning Lead",
        ],
        ["Security"] = [
            "Security Engineer", "GRC Analyst",
            "Application Security Engineer", "Detection and Response Engineer",
        ],
        ["Platform"] = [
            "Platform Engineer", "Developer Experience Engineer",
            "Build Engineer", "Internal Tools Engineer",
        ],
    };

    private static readonly string[] Locations =
    [
        "Berlin, DE", "London, UK", "Lisbon, PT", "Amsterdam, NL", "Warsaw, PL",
        "Bucharest, RO", "Prague, CZ", "Madrid, ES", "Paris, FR", "Stockholm, SE",
        "Dublin, IE", "Kyiv, UA", "Tbilisi, GE", "Toronto, CA", "Austin, US",
        "Brooklyn, US", "Mexico City, MX", "Sao Paulo, BR", "Buenos Aires, AR",
        "Bangalore, IN", "Singapore", "Tokyo, JP", "Sydney, AU", "Cape Town, ZA",
        "Remote - EMEA", "Remote - Americas", "Remote - APAC",
    ];

    public IReadOnlyList<Candidate> CreateCandidates(
        IReadOnlyList<Requisition> requisitions,
        int count = 124)
    {
        // Same deterministic seed the React side used (faker.seed(20260423)).
        var faker = new Faker("en")
        {
            Random = new Randomizer(20260423),
        };

        var requisitionIds = requisitions
            .Select(r => (Guid?)r.Id)
            .ToList();

        var list = new List<Candidate>(count);
        for (var i = 0; i < count; i++)
        {
            var firstName = faker.Name.FirstName();
            var lastName = faker.Name.LastName();
            var fullName = $"{firstName} {lastName}";
            var department = faker.PickRandom(Departments);
            var position = faker.PickRandom(RolesByDepartment[department]);
            var status = PickStatus(faker);
            var location = faker.PickRandom(Locations);
            var source = faker.PickRandom(Sources);
            var requisitionId = requisitionIds.Count > 0
                ? faker.PickRandom(requisitionIds)
                : null;

            // Spread timestamps across the last 6 months so the relative-date
            // column in the React UI shows a varied mix.
            var daysAgo = faker.Random.Int(0, 180);
            var minutesAgo = faker.Random.Int(0, 60 * 24);
            var appliedAt = DateTime.UtcNow
                .AddDays(-daysAgo)
                .AddMinutes(-minutesAgo);

            list.Add(Candidate.Create(
                requisitionId: requisitionId,
                fullName: fullName,
                email: faker.Internet.Email(firstName, lastName).ToLowerInvariant(),
                position: position,
                department: department,
                location: location,
                source: source,
                status: status,
                appliedAtUtc: appliedAt));
        }

        // Newest first — same order as the React mockup.
        return list
            .OrderByDescending(c => c.AppliedAt)
            .ToList();
    }

    private static CandidateStatus PickStatus(Faker faker)
    {
        var r = faker.Random.Double(0, 1);
        var acc = 0d;
        foreach (var (status, weight) in StatusWeights)
        {
            acc += weight;
            if (r <= acc)
                return status;
        }
        return CandidateStatus.New;
    }
}
