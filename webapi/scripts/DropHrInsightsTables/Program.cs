using Npgsql;

var dbName = args.Length > 0 ? args[0] : "hrinsights_pipeline";
var connString = $"Host=localhost;Port=5432;Database={dbName};Username=your_username;Password=your_password;Include Error Detail=true;";
Console.WriteLine($"Targeting database: {dbName}");

var tables = new[]
{
    "overview_kpi_trend_points",
    "overview_kpi_cards",
    "overview_ai_insight_actions",
    "overview_ai_insights",
    "overview_action_items",
    "overview_action_plans",
    "overview_activity_timeline_events",
    "overview_requisitions",
    "overview_kpi_snapshots",
    "hiring_pipeline_interviews",
    "hiring_pipeline_offers",
    "hiring_pipeline_requisitions",
    "scenario_assumptions",
    "workforce_scenarios",
    "workforce_line_items",
    "workforce_plans",
    "planning_snapshots",
    "__EFMigrationsHistory"
};

await using var conn = new NpgsqlConnection(connString);
await conn.OpenAsync();

foreach (var t in tables)
{
    try
    {
        await using var cmd = new NpgsqlCommand($"DROP TABLE IF EXISTS \"{t}\" CASCADE;", conn);
        await cmd.ExecuteNonQueryAsync();
        Console.WriteLine($"dropped (or missing): {t}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"FAILED {t}: {ex.Message}");
    }
}

Console.WriteLine("Done.");
