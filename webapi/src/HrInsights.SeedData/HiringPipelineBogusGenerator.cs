using HrInsights.Contracts.HiringPipeline;

namespace HrInsights.SeedData;

/// <summary>
/// Provides pre-baked requisition data for the hiring-pipeline API.
/// </summary>
public sealed class HiringPipelineBogusGenerator
{
    private static readonly List<RequisitionDto> _requisitions =
    [
        new("req-1", "Senior Frontend Engineer",   "Engineering", "Remote",       "high",   "open",           12, 0, 2, "2026-06-05T00:00:00Z"),
        new("req-2", "Backend Engineer",             "Engineering", "New York",     "medium", "in_review",      8,  0, 3, "2026-06-10T00:00:00Z"),
        new("req-3", "Product Manager",              "Engineering", "San Francisco","high",   "needs_approval", 0,  0, 1, "2026-06-17T00:00:00Z"),
        new("req-4", "HR Business Partner",          "HR",          "Chicago",      "low",    "offered",        25, 0, 1, "2026-05-23T00:00:00Z"),
        new("req-5", "Account Executive",            "Sales",       "Remote",       "medium", "hired",          30, 1, 2, "2026-05-18T00:00:00Z"),
        new("req-6", "Marketing Specialist",         "Marketing",   "Austin",       "low",    "open",           5,  0, 1, "2026-06-12T00:00:00Z")
    ];

    public IReadOnlyList<RequisitionDto> GetRequisitions()
        => _requisitions.ToList();

    public RequisitionDto? GetById(string id)
        => _requisitions.FirstOrDefault(r => r.Id == id);

    public void Add(RequisitionDto dto)
        => _requisitions.Add(dto);

    public bool UpdateStatus(string id, string status)
    {
        var idx = _requisitions.FindIndex(r => r.Id == id);
        if (idx == -1) return false;
        var current = _requisitions[idx];
        _requisitions[idx] = current with { Status = status };
        return true;
    }
}
