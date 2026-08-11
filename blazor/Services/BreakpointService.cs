using Microsoft.JSInterop;

namespace BlazorWebApp.Services;

/// <summary>
/// Port of <c>src/hooks/useBreakpoint.ts</c>. Tracks the active responsive
/// bucket (<c>xs | sm | md | lg | xl</c>) via <c>matchMedia</c>.
/// </summary>
public sealed class BreakpointService : IAsyncDisposable
{
    public enum Breakpoint { Xs, Sm, Md, Lg, Xl }

    private static readonly (Breakpoint Bp, string Mq)[] Queries =
    {
        (Breakpoint.Xs, "(max-width: 480px)"),
        (Breakpoint.Sm, "(min-width: 481px) and (max-width: 768px)"),
        (Breakpoint.Md, "(min-width: 769px) and (max-width: 1024px)"),
        (Breakpoint.Lg, "(min-width: 1025px) and (max-width: 1280px)"),
        (Breakpoint.Xl, "(min-width: 1281px)"),
    };

    private readonly IJSRuntime _js;
    private readonly DotNetObjectReference<BreakpointService> _selfRef;
    private IJSObjectReference? _module;

    public BreakpointService(IJSRuntime js)
    {
        _js = js;
        _selfRef = DotNetObjectReference.Create(this);
    }

    public Breakpoint Current { get; private set; } = Breakpoint.Xl;
    public event Action? Changed;

    public bool IsCompact => Current is Breakpoint.Xs or Breakpoint.Sm;
    public bool IsMobile => Current == Breakpoint.Xs;
    public bool IsMediumOrUp => Current is Breakpoint.Md or Breakpoint.Lg or Breakpoint.Xl;
    public bool IsLargeOrUp => Current is Breakpoint.Lg or Breakpoint.Xl;

    public async Task InitializeAsync()
    {
        _module = await _js.InvokeAsync<IJSObjectReference>(
            "import", "./_content/BlazorWebApp/breakpoint.js");
        await _module.InvokeVoidAsync("subscribe", _selfRef);
    }

    [JSInvokable]
    public Task OnBreakpointChangedAsync(string bp)
    {
        if (Enum.TryParse<Breakpoint>(bp, ignoreCase: true, out var parsed)
            && parsed != Current)
        {
            Current = parsed;
            Changed?.Invoke();
        }
        return Task.CompletedTask;
    }

    public async ValueTask DisposeAsync()
    {
        if (_module is not null)
        {
            try { await _module.DisposeAsync(); } catch { /* ignore */ }
        }
        _selfRef.Dispose();
    }
}
