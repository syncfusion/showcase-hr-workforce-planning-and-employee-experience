using System.Text.Json;

namespace HrInsights.SeedData;

public sealed class LookupJsonLoader
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly string _basePath;

    public LookupJsonLoader(string basePath)
    {
        _basePath = basePath;
    }

    public IReadOnlyList<T> Load<T>(string fileName)
    {
        var path = Path.Combine(_basePath, fileName);
        var json = File.ReadAllText(path);
        return JsonSerializer.Deserialize<List<T>>(json, SerializerOptions) ?? [];
    }
}
