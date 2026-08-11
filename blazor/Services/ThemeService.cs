using Microsoft.JSInterop;

namespace BlazorWebApp.Services;

/// <summary>
/// Port of <c>src/theme/ThemeProvider.tsx</c>. Manages the active theme
/// (<c>light | dark | system</c>) and the resolved theme (always
/// <c>light | dark</c>). Persists to <c>localStorage</c> under the key
/// <c>healthops-theme</c> and applies the theme to
/// <c>document.documentElement[data-theme]</c> + <c>document.body.e-dark-mode</c>.
/// </summary>
public sealed class ThemeService : IAsyncDisposable
{
    public const string StorageKey = "healthops-theme";

    public enum ThemeMode { Light, Dark, System }
    public enum ResolvedTheme { Light, Dark }

    private readonly IJSRuntime _js;
    private readonly DotNetObjectReference<ThemeService> _selfRef;
    private IJSObjectReference? _module;

    public ThemeService(IJSRuntime js)
    {
        _js = js;
        _selfRef = DotNetObjectReference.Create(this);
    }

    public ThemeMode Mode { get; private set; } = ThemeMode.Light;
    public ResolvedTheme Resolved { get; private set; } = ResolvedTheme.Light;
    public event Action? Changed;

    /// <summary>
    /// Reads the persisted mode, applies the resolved theme to the document,
    /// and wires the <c>prefers-color-scheme</c> media-query listener.
    /// Mirrors <c>initTheme()</c> in the React source. Must be called from
    /// <c>OnAfterRenderAsync(firstRender: true)</c>.
    /// </summary>
    public async Task InitializeAsync()
    {
        _module = await _js.InvokeAsync<IJSObjectReference>(
            "import", "./_content/BlazorWebApp/theme.js");

        var stored = await _module.InvokeAsync<string?>("readStored", StorageKey);
        Mode = ParseMode(stored);
        Resolved = Resolve(Mode);
        await ApplyAsync(Resolved);

        await _module.InvokeVoidAsync("subscribe", _selfRef, StorageKey);
        Changed?.Invoke();
    }

    public async Task SetModeAsync(ThemeMode mode)
    {
        Mode = mode;
        if (_module is not null)
        {
            await _module.InvokeVoidAsync("writeStored", StorageKey, ModeToString(mode));
        }
        Resolved = Resolve(Mode);
        await ApplyAsync(Resolved);
        Changed?.Invoke();
    }

    [JSInvokable]
    public async Task OnSystemThemeChangedAsync(bool isDark)
    {
        if (Mode != ThemeMode.System) return;
        Resolved = isDark ? ResolvedTheme.Dark : ResolvedTheme.Light;
        await ApplyAsync(Resolved);
        Changed?.Invoke();
    }

    private static ThemeMode ParseMode(string? value) => value switch
    {
        "dark" => ThemeMode.Dark,
        "system" => ThemeMode.System,
        _ => ThemeMode.Light,
    };

    private static string ModeToString(ThemeMode mode) => mode switch
    {
        ThemeMode.Dark => "dark",
        ThemeMode.System => "system",
        _ => "light",
    };

    private static ResolvedTheme Resolve(ThemeMode mode) => mode switch
    {
        ThemeMode.Dark => ResolvedTheme.Dark,
        ThemeMode.System => ThemeService_HostEnv.IsDarkPreferred()
            ? ResolvedTheme.Dark
            : ResolvedTheme.Light,
        _ => ResolvedTheme.Light,
    };

    private async Task ApplyAsync(ResolvedTheme theme)
    {
        if (_module is null) return;
        await _module.InvokeVoidAsync("apply", theme == ResolvedTheme.Dark ? "dark" : "light");
    }

    /// <summary>
    /// Maps the resolved page theme to the matching Syncfusion chart
    /// <c>Theme</c> enum value. Charts do not auto-react to
    /// <c>body.e-dark-mode</c>; they only flip when their <c>Theme</c> prop
    /// is rebound, so the page should set <c>SfChart.Theme</c> to the
    /// value returned here and re-render on <see cref="Changed"/>.
    /// </summary>
    public Syncfusion.Blazor.Theme ChartTheme =>
        Resolved == ResolvedTheme.Dark
            ? Syncfusion.Blazor.Theme.TailwindDark
            : Syncfusion.Blazor.Theme.Tailwind;

    public async ValueTask DisposeAsync()
    {
        if (_module is not null)
        {
            try { await _module.DisposeAsync(); } catch { /* ignore */ }
        }
        _selfRef.Dispose();
    }
}

/// <summary>
/// Tiny host-env helper so <see cref="ThemeService"/> can resolve
/// <c>system</c> on the server before the JS module loads.
/// Kept in its own class to keep <see cref="ThemeService"/> testable.
/// </summary>
internal static class ThemeService_HostEnv
{
    public static bool IsDarkPreferred() => false;
}
