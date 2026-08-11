namespace HrInsights.SeedData;

public static class DeterministicIds
{
    private static Guid[] CreateSeries(int offset)
    {
        var values = new Guid[64];
        for (var i = 0; i < values.Length; i++)
        {
            values[i] = new Guid($"{offset + i:D8}-0000-0000-0000-000000000000");
        }

        return values;
    }
}
