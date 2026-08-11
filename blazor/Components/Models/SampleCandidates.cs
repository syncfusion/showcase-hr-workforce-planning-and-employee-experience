using System.Text;

namespace BlazorWebApp.Components.Models;

/// <summary>
/// Deterministic, self-contained candidate generator.
///
/// Port of <c>frontend/react/src/screens/HiringPipeline/sampleCandidates.ts</c>.
/// The original uses <c>@faker-js/faker</c> with a fixed seed for reproducible
/// dev output; this port reimplements a tiny faker-like helper (first/last
/// name, weighted array pick, integer, uuid-shaped id) so the Blazor sample
/// build does not need to take a dependency on Bogus just for one screen.
///
/// The shape of the data is byte-for-byte equivalent to the React sample —
/// same names list, same department/role matrix, same status weights, same
/// source list, same "spread timestamps across the last 6 months" rule.
/// </summary>
public static class SampleCandidates
{
    public static readonly string[] Sources = new[]
    {
        "LinkedIn",
        "Indeed",
        "DOU",
        "Djinni",
        "Referral",
        "Glassdoor",
        "AngelList",
        "Stack Overflow",
        "Company Website",
        "Recruiter Outreach",
    };

    // [status, weight] — a healthy funnel: lots of new, few at the end.
    private static readonly (string Status, double Weight)[] StatusWeights = new[]
    {
        ("new", 0.28),
        ("screening", 0.26),
        ("interview", 0.18),
        ("offer", 0.07),
        ("hired", 0.03),
        ("rejected", 0.18),
    };

    private static readonly string[] Departments = new[]
    {
        "Engineering", "Product", "Design", "Data", "Marketing", "Sales",
        "Customer Success", "People", "Finance", "Operations", "Security", "Platform",
    };

    private static readonly Dictionary<string, string[]> RolesByDepartment = new()
    {
        ["Engineering"] = new[]
        {
            "Senior Frontend Engineer", "Backend Engineer", "Staff Software Engineer",
            "Mobile Engineer (iOS)", "Mobile Engineer (Android)",
            "Engineering Manager", "Site Reliability Engineer",
        },
        ["Product"] = new[]
        {
            "Product Manager", "Senior Product Manager",
            "Product Analyst", "Technical Product Manager",
        },
        ["Design"] = new[]
        {
            "Product Designer", "Senior UX Researcher", "Brand Designer",
            "Design Systems Lead", "Motion Designer",
        },
        ["Data"] = new[]
        {
            "Data Scientist", "Analytics Engineer", "ML Engineer",
            "Data Platform Engineer", "BI Analyst",
        },
        ["Marketing"] = new[]
        {
            "Content Marketing Manager", "Growth Marketer", "SEO Specialist",
            "Field Marketing Lead", "Brand Strategist",
        },
        ["Sales"] = new[]
        {
            "Account Executive", "Sales Development Rep", "Enterprise AE",
            "Solutions Engineer", "Sales Operations Analyst",
        },
        ["Customer Success"] = new[]
        {
            "CS Manager", "Onboarding Specialist",
            "Customer Success Engineer", "Renewals Manager",
        },
        ["People"] = new[]
        {
            "Talent Acquisition Partner", "People Operations Lead",
            "Compensation Analyst", "L&D Specialist",
        },
        ["Finance"] = new[]
        {
            "Financial Analyst", "Controller", "FP&A Manager", "Treasury Analyst",
        },
        ["Operations"] = new[]
        {
            "Operations Manager", "Business Operations Analyst", "Workforce Planning Lead",
        },
        ["Security"] = new[]
        {
            "Security Engineer", "GRC Analyst",
            "Application Security Engineer", "Detection and Response Engineer",
        },
        ["Platform"] = new[]
        {
            "Platform Engineer", "Developer Experience Engineer",
            "Build Engineer", "Internal Tools Engineer",
        },
    };

    private static readonly string[] Locations = new[]
    {
        "Berlin, DE", "London, UK", "Lisbon, PT", "Amsterdam, NL",
        "Warsaw, PL", "Bucharest, RO", "Prague, CZ", "Madrid, ES",
        "Paris, FR", "Stockholm, SE", "Dublin, IE", "Kyiv, UA",
        "Tbilisi, GE", "Toronto, CA", "Austin, US", "Brooklyn, US",
        "Mexico City, MX", "Sao Paulo, BR", "Buenos Aires, AR",
        "Bangalore, IN", "Singapore", "Tokyo, JP", "Sydney, AU",
        "Cape Town, ZA", "Remote - EMEA", "Remote - Americas", "Remote - APAC",
    };

    private static readonly string[] FirstNames = new[]
    {
        "Aaron", "Abigail", "Adam", "Aiden", "Alex", "Alice", "Amelia", "Amir",
        "Andrew", "Anna", "Anthony", "Arjun", "Ava", "Avery", "Beatrice", "Ben",
        "Benjamin", "Bianca", "Brian", "Bruno", "Camila", "Carlos", "Carmen",
        "Caroline", "Casper", "Chloe", "Chris", "Christian", "Clara", "Cody",
        "Daisy", "Daniel", "David", "Diana", "Diego", "Dimitri", "Dora", "Eden",
        "Edward", "Elena", "Eli", "Eliana", "Elijah", "Ella", "Eloise", "Emil",
        "Emily", "Emma", "Eric", "Esme", "Ethan", "Eva", "Eve", "Felix",
        "Fiona", "Gabriel", "Gianna", "Grace", "Hannah", "Harper", "Harry",
        "Hazel", "Henry", "Hugo", "Ian", "Imani", "Ines", "Iris", "Isaac",
        "Isabel", "Ivy", "Jack", "Jacob", "Jade", "James", "Jane", "Jasmine",
        "Jason", "Javier", "Jay", "Jenna", "Jin", "Joel", "Johanna", "Jonah",
        "Julia", "Julian", "Kai", "Kara", "Kate", "Katherine", "Kavya", "Kira",
        "Klaus", "Layla", "Leo", "Leon", "Leah", "Levi", "Liam", "Lila",
        "Lina", "Logan", "Lola", "Lorenzo", "Lucas", "Lucy", "Luis", "Lukas",
        "Maddox", "Maeve", "Maya", "Maya", "Mei", "Mia", "Miles", "Mina",
        "Molly", "Nadia", "Nate", "Nathan", "Nia", "Nico", "Nina", "Noah",
        "Nora", "Nova", "Olive", "Olivia", "Omar", "Oscar", "Owen", "Paige",
        "Pamela", "Patrick", "Paul", "Penelope", "Peter", "Philip", "Priya",
        "Quinn", "Rafael", "Ravi", "Reba", "Reese", "Riley", "Rina", "Rita",
        "Robert", "Rohan", "Rosa", "Ruby", "Rudy", "Rumi", "Ruth", "Ryan",
        "Saoirse", "Sara", "Sarah", "Savannah", "Sean", "Selena", "Serena",
        "Sienna", "Silas", "Simon", "Sofia", "Sophia", "Stella", "Steve",
        "Sven", "Sylvia", "Tara", "Tariq", "Tess", "Theo", "Thomas", "Tia",
        "Tomas", "Tony", "Tova", "Trent", "Troy", "Ty", "Uma", "Valentina",
        "Vera", "Vicky", "Viktor", "Vince", "Viola", "Walter", "Wendy",
        "Wesley", "Will", "Willow", "Xander", "Yara", "Yasmin", "Yusuf",
        "Zach", "Zara", "Zayn", "Zoe",
    };

    private static readonly string[] LastNames = new[]
    {
        "Adams", "Ahmed", "Akin", "Alvarez", "Andersen", "Anderson", "Anand",
        "Antonov", "Arroyo", "Asante", "Auer", "Bailey", "Baker", "Barnes",
        "Bauer", "Beck", "Bell", "Berger", "Bernard", "Bishop", "Black",
        "Blair", "Bloom", "Bonnet", "Borges", "Bowen", "Boyd", "Brandt",
        "Brennan", "Brooks", "Brown", "Bryant", "Burns", "Butler", "Cabrera",
        "Caldwell", "Cameron", "Campbell", "Cardoso", "Carlsen", "Carrillo",
        "Carter", "Castillo", "Castro", "Chakraborty", "Chan", "Chapman",
        "Chase", "Chen", "Choi", "Chowdhury", "Christensen", "Clark", "Cohen",
        "Cole", "Coleman", "Collins", "Cook", "Cooper", "Cox", "Crawford",
        "Cruz", "Cunningham", "D'Souza", "Daniels", "Dasgupta", "Davenport",
        "Davidson", "Davis", "Dawson", "Day", "Dean", "Delgado", "Demir",
        "Diaz", "Dixon", "Doherty", "Dominguez", "Donnelly", "Doyle", "DuBois",
        "Duncan", "Dunn", "Edwards", "Elliott", "Ellis", "Eriksen", "Espinoza",
        "Evans", "Faber", "Fairchild", "Falk", "Faraday", "Farah", "Farrell",
        "Faulkner", "Feldman", "Fernandes", "Ferrari", "Fields", "Figueroa",
        "Fleming", "Flores", "Floyd", "Ford", "Foster", "Fowler", "Fox",
        "Frank", "Freeman", "Fuentes", "Gallagher", "Gallo", "Garcia", "Gardner",
        "Garrido", "George", "Gibson", "Gil", "Gillespie", "Glover", "Gold",
        "Gomez", "Gonzalez", "Goodman", "Gordon", "Gough", "Graham", "Grant",
        "Graves", "Gray", "Green", "Griffin", "Gross", "Gupta", "Gutierrez",
        "Haas", "Hale", "Hall", "Hamilton", "Hansen", "Hanson", "Harper",
        "Harris", "Harrison", "Hart", "Harvey", "Hassan", "Hawkins", "Hayes",
        "Henderson", "Hendricks", "Henry", "Hernandez", "Herrera", "Hicks",
        "Higgins", "Hill", "Hofer", "Hoffman", "Holm", "Holmes", "Holt", "Hoover",
        "Hopkins", "Horton", "Howard", "Howell", "Huber", "Hudson", "Hughes",
        "Hunt", "Hunter", "Hussain", "Ibarra", "Iglesias", "Ito", "Iyer",
        "Jackson", "Jacobs", "Jain", "James", "Jensen", "Jha", "Jimenez",
        "Johansson", "Johnson", "Johnston", "Jones", "Jordan", "Joseph",
        "Kapoor", "Karam", "Karpov", "Kato", "Kaur", "Kazan", "Keane",
        "Kelleher", "Keller", "Kelley", "Kelly", "Kennedy", "Khan", "Khatri",
        "Kim", "King", "Kirby", "Klein", "Knox", "Kowalski", "Krueger",
        "Kumar", "Kuznetsov", "Lacey", "Lakshmanan", "Lambert", "Lane", "Larsen",
        "Larson", "Lawrence", "Lawson", "Le", "Lee", "Lennon", "Leon", "Lewis",
        "Li", "Liang", "Lim", "Lin", "Lindberg", "Lindgren", "Lloyd", "Lopez",
        "Lowe", "Lowery", "Lucas", "Lund", "Lutz", "MacDonald", "Mackenzie",
        "Madsen", "Mahmood", "Maldonado", "Malik", "Mann", "Manning", "Marin",
        "Marino", "Marquez", "Marsh", "Marshall", "Martin", "Martinez", "Mason",
        "Mathur", "Matsuda", "Matthews", "Maxwell", "May", "Mayer", "McCall",
        "McCarthy", "McConnell", "McCormick", "McDonald", "McKay", "McKinney",
        "McLaughlin", "McMahon", "Medina", "Mehta", "Mendes", "Mendez", "Mendoza",
        "Mercer", "Meyer", "Miles", "Miller", "Mills", "Miranda", "Mishra",
        "Mitchell", "Mohan", "Mondragon", "Montgomery", "Moody", "Moon",
        "Moore", "Morales", "Moreno", "Morgan", "Morris", "Morrison", "Morrow",
        "Mueller", "Munoz", "Murphy", "Murray", "Myers", "Nair", "Nakamura",
        "Nakashima", "Nash", "Nath", "Navarro", "Naylor", "Ndoye", "Neal",
        "Nelson", "Newman", "Newton", "Ng", "Nguyen", "Nichols", "Nielsen",
        "Niemann", "Nixon", "Noble", "Nolan", "Norris", "Novak", "Novikov",
        "O'Brien", "O'Connor", "O'Neil", "O'Neill", "Ochoa", "Odegaard", "Oh",
        "Olsen", "Olson", "Omar", "Ortega", "Ortiz", "Osborne", "Ostrowski",
        "Owens", "Padilla", "Page", "Pal", "Palmer", "Park", "Parker", "Parrish",
        "Parsons", "Patel", "Patterson", "Patton", "Paul", "Payne", "Pearce",
        "Pearson", "Peck", "Pena", "Perez", "Perkins", "Perry", "Peters",
        "Petersen", "Peterson", "Pham", "Phelan", "Phillips", "Pillai", "Pinto",
        "Pittman", "Pope", "Porter", "Powell", "Powers", "Pradhan", "Pratt",
        "Preston", "Price", "Quintero", "Ramirez", "Ramos", "Ramsey", "Rao",
        "Rasmussen", "Ray", "Reed", "Reese", "Reeves", "Reid", "Reilly",
        "Reyes", "Reynolds", "Rhodes", "Richards", "Richardson", "Rios", "Rivas",
        "Rivera", "Roberts", "Robertson", "Robinson", "Rodriguez", "Rogers",
        "Rojas", "Roman", "Romero", "Rose", "Ross", "Rowe", "Roy", "Russell",
        "Russo", "Ryan", "Sadler", "Saito", "Salazar", "Salinas", "Sampson",
        "Sanchez", "Sanders", "Sandoval", "Santiago", "Santos", "Sato", "Saunders",
        "Schmidt", "Schneider", "Schultz", "Schwartz", "Scott", "Sellers",
        "Serrano", "Shah", "Sharma", "Sharp", "Shaw", "Shelton", "Shepherd",
        "Sherman", "Shields", "Short", "Silva", "Simmons", "Simpson", "Sims",
        "Singh", "Sinha", "Skinner", "Sloan", "Small", "Smith", "Snyder",
        "Solis", "Solomon", "Soto", "Spencer", "Stafford", "Stahl", "Stanton",
        "Stark", "Stein", "Stephens", "Stevens", "Stewart", "Stokes", "Stone",
        "Strong", "Suarez", "Sullivan", "Sutton", "Swanson", "Sweeney", "Tan",
        "Tanaka", "Tate", "Taylor", "Thackeray", "Thakur", "Thatcher", "Thomas",
        "Thompson", "Thorne", "Tian", "Todd", "Torres", "Tran", "Travis",
        "Trevino", "Trotter", "Truman", "Tucker", "Turner", "Underwood", "Vance",
        "Vargas", "Vasquez", "Vaughn", "Vazquez", "Vega", "Velasquez", "Vidal",
        "Vogel", "Wade", "Wagner", "Wainwright", "Walker", "Wall", "Wallace",
        "Walsh", "Walter", "Walters", "Walton", "Wang", "Ward", "Warner",
        "Warren", "Washington", "Watson", "Watts", "Weaver", "Webb", "Weber",
        "Weiss", "Welch", "Wells", "Werner", "West", "Whitaker", "White",
        "Whitfield", "Whitney", "Wiggins", "Wilcox", "Wilkerson", "Wilkins",
        "Williams", "Williamson", "Willis", "Wilson", "Winters", "Wolfe",
        "Wong", "Wood", "Woods", "Wright", "Wu", "Yamamoto", "Yang", "Yates",
        "Yoon", "York", "Young", "Zamora", "Zane", "Zapata", "Zhang", "Zhao",
        "Zimmerman", "Zuniga",
    };

    /// <summary>
    /// Generate <paramref name="count"/> deterministic candidates. The output
    /// is stable for a given <paramref name="seed"/>; the React side uses
    /// <c>faker.seed(20260423)</c> so the Blazor port uses the same default
    /// to produce an equivalent set.
    /// </summary>
    public static IReadOnlyList<Applicant> Generate(int count, int seed = 20260423)
    {
        var rng = new SeededRng(seed);
        var list = new List<Applicant>(count);
        for (int i = 0; i < count; i++)
        {
            var first = rng.Pick(FirstNames);
            var last = rng.Pick(LastNames);
            var dept = rng.Pick(Departments);
            var role = rng.Pick(RolesByDepartment[dept]);
            var status = rng.PickWeighted(StatusWeights);
            var location = rng.Pick(Locations);
            var source = rng.Pick(Sources);
            // Spread timestamps across the last 6 months so the relative-date
            // column is varied — same window the React generator uses.
            var daysAgo = rng.NextInt(0, 180);
            var minutesAgo = rng.NextInt(0, 60 * 24);
            var appliedAt = DateTimeOffset.UtcNow
                .AddDays(-daysAgo)
                .AddMinutes(-minutesAgo)
                .ToString("O");
            list.Add(new Applicant(
                Id: "cand-" + (i + 1).ToString("D4"),
                FullName: first + " " + last,
                Email: (first + "." + last).ToLowerInvariant() + "@example.com",
                Initials: (first[0].ToString() + last[0].ToString()).ToUpperInvariant(),
                Position: role,
                Department: dept,
                Location: location,
                Status: status,
                Source: source,
                AppliedAt: appliedAt,
                RequisitionId: null));
        }
        // Newest first.
        return list.OrderByDescending(a => a.AppliedAt).ToList();
    }

    /// <summary>
    /// Counts per status, computed from a list. Mirrors
    /// <c>fetchApplicantCounts</c> on the server, but computed locally so
    /// the offline sample still shows the right badge values.
    /// </summary>
    public static ApplicantCounts Count(IReadOnlyList<Applicant> items)
    {
        int Count(string s) => items.Count(a => string.Equals(a.Status, s, StringComparison.OrdinalIgnoreCase));
        return new ApplicantCounts(
            All: items.Count,
            New: Count("new"),
            Screening: Count("screening"),
            Interview: Count("interview"),
            Offer: Count("offer"),
            Hired: Count("hired"),
            Rejected: Count("rejected"));
    }

    /// <summary>
    /// Tiny seedable PRNG. Uses xoshiro256** under the hood, which is
    /// deterministic for a given seed and avoids <see cref="Random"/>'s
    /// process-wide lock contention. Good enough for sample data.
    /// </summary>
    private sealed class SeededRng
    {
        private ulong _s0, _s1, _s2, _s3;

        public SeededRng(int seed)
        {
            // SplitMix64 to expand the 32-bit seed into 256 bits of state.
            ulong s = (ulong)seed | 1UL;
            _s0 = NextSplitMix(ref s);
            _s1 = NextSplitMix(ref s);
            _s2 = NextSplitMix(ref s);
            _s3 = NextSplitMix(ref s);
        }

        private static ulong NextSplitMix(ref ulong s)
        {
            ulong z = (s += 0x9E3779B97F4A7C15UL);
            z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9UL;
            z = (z ^ (z >> 27)) * 0x94D049BB133111EBUL;
            return z ^ (z >> 31);
        }

        public ulong NextU64()
        {
            ulong result = RotL(_s1 * 5, 7) * 9;
            ulong t = _s1 << 17;
            _s2 ^= _s0;
            _s3 ^= _s1;
            _s1 ^= _s2;
            _s0 ^= _s3;
            _s2 ^= t;
            _s3 = RotL(_s3, 45);
            return result;
        }

        private static ulong RotL(ulong x, int k) => (x << k) | (x >> (64 - k));

        public double NextDouble() => (NextU64() >> 11) * (1.0 / (1UL << 53));

        public int NextInt(int minInclusive, int maxExclusive)
        {
            if (maxExclusive <= minInclusive) return minInclusive;
            var range = (ulong)(maxExclusive - minInclusive);
            return (int)(NextU64() % range) + minInclusive;
        }

        public T Pick<T>(T[] arr) => arr[NextInt(0, arr.Length)];

        public string PickWeighted((string Status, double Weight)[] arr)
        {
            var r = NextDouble();
            double acc = 0;
            for (int i = 0; i < arr.Length; i++)
            {
                acc += arr[i].Weight;
                if (r <= acc) return arr[i].Status;
            }
            return arr[^1].Status;
        }
    }
}
