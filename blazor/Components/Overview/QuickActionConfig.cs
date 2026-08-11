// Quick Action CTA definitions, peer directory, and label-to-kind
// mapping used by the DetailPanel sidebar in the Overview screen.
//
// Mirrors src/screens/Overview/components/DetailPanel.tsx so the Blazor
// port stays in lock-step with the React client. All five Quick Action
// flows (Schedule 1:1, Send Recognition, Assign Training, Request Pulse
// Check, Copy Employee Email) plus a generic "message" fallback for
// AI-supplied actions that don't map to a known form are handled here.

using BlazorWebApp.Components.Models;

namespace BlazorWebApp.Components.Overview;

/// <summary>
/// Distinguishes the five Quick Action flows. <see cref="Clipboard"/>
/// fires the side-effect immediately; every other kind opens the
/// <see cref="QuickActionDialog"/> modal with a form tailored to the
/// kind. <see cref="Message"/> is the generic fallback for AI-supplied
/// actions whose label doesn't map to a known kind — it shows a
/// read-only message preview and copies the body to the clipboard on
/// submit.
/// </summary>
public enum QuickActionKind
{
    Schedule1on1,
    Recognition,
    Training,
    Pulse,
    Clipboard,
    Message,
}

/// <summary>
/// One Quick Action button. The default list comes from
/// <see cref="QuickActionConfig.DefaultActions"/>; AI-supplied actions
/// replace them when an insight is on screen, with a label-based kind
/// resolved by <see cref="QuickActionConfig.MapLabelToKind"/>.
/// </summary>
public sealed record QuickAction(
    string Id,
    string Label,
    QuickActionKind Kind,
    string? Value = null,
    string? Title = null,
    string? Body = null);

/// <summary>
/// Result of a Quick Action dialog submission. <see cref="ClipboardText"/>
/// is only populated for <see cref="QuickActionKind.Message"/> CTAs
/// where the body was just copied to the clipboard.
/// </summary>
public sealed record QuickActionResult(
    QuickActionKind Kind,
    string Message,
    string? ClipboardText = null);

/// <summary>
/// Shared peer directory — mirrors <c>RecognitionSection.PEERS</c> so
/// the two screens agree on the same set of demo employees.
/// </summary>
public sealed record PeerOption(string Id, string Name);

public static class QuickActionConfig
{
    public static readonly IReadOnlyList<PeerOption> PeerDirectory = new PeerOption[]
    {
        new("emp_4502", "Marcus Lee"),
        new("emp_4530", "Priya Nair"),
        new("emp_4490", "John Williams"),
        new("emp_4555", "Sofia Garcia"),
        new("emp_4560", "Liam Becker"),
    };

    public static readonly IReadOnlyDictionary<string, string> HeaderForKind =
        new Dictionary<string, string>
        {
            [nameof(QuickActionKind.Schedule1on1)] = "Schedule 1:1",
            [nameof(QuickActionKind.Recognition)] = "Send Recognition",
            [nameof(QuickActionKind.Training)] = "Assign Training",
            [nameof(QuickActionKind.Pulse)] = "Request Pulse Check",
        };

    public static readonly IReadOnlyList<CourseOption> TrainingCourses = new CourseOption[]
    {
        new("leadership-101", "Leadership 101"),
        new("feedback-coaching", "Feedback & Coaching"),
        new("effective-1on1s", "Effective 1:1s"),
        new("psychological-safety", "Psychological Safety"),
        new("difficult-conversations", "Difficult Conversations"),
    };

    public static readonly IReadOnlyList<CadenceOption> PulseCadences = new CadenceOption[]
    {
        new("one-time", "One-time"),
        new("weekly", "Weekly"),
        new("biweekly", "Bi-weekly"),
        new("monthly", "Monthly"),
    };

    public static readonly IReadOnlyList<string> RecognitionTypes = new[]
    {
        "peer-shoutout", "milestone", "leadership", "team-win",
    };

    public static readonly IReadOnlyList<string> RecognitionValues = new[]
    {
        "Innovation", "Customer Focus", "Mentorship", "Tenure", "Growth", "Teamwork", "Integrity",
    };

    public static readonly IReadOnlyList<string> RecognitionVisibilities = new[]
    {
        "public", "team", "private",
    };

    /// <summary>
    /// The five always-rendered Quick Action buttons. Shown when no AI
    /// insight is on screen, so the sidebar is interactive from first
    /// paint. <c>Copy Employee Email</c> uses <see cref="QuickActionKind.Clipboard"/>
    /// and writes the value to the clipboard immediately.
    /// </summary>
    public static readonly IReadOnlyList<QuickAction> DefaultActions = new QuickAction[]
    {
        new("qa-1on1", "Schedule 1:1", QuickActionKind.Schedule1on1),
        new("qa-recognize", "Send Recognition", QuickActionKind.Recognition),
        new("qa-training", "Assign Training", QuickActionKind.Training),
        new("qa-pulse", "Request Pulse Check", QuickActionKind.Pulse),
        new("qa-copy", "Copy Employee Email", QuickActionKind.Clipboard, Value: "{employee.email}"),
    };

    /// <summary>
    /// Map an AI-supplied action's free-form <paramref name="label"/> back
    /// to a known <see cref="QuickActionKind"/> so the proper form
    /// opens instead of the generic message preview. Keyword match on
    /// the first word / first line is enough — the AI prompt asks for
    /// short verb-led labels. Returns <c>null</c> when the label
    /// doesn't map to any known kind, so the caller can fall back to
    /// <see cref="QuickActionKind.Message"/>.
    /// </summary>
    public static QuickActionKind? MapLabelToKind(string? label)
    {
        if (string.IsNullOrWhiteSpace(label)) return null;
        var l = label.Trim().ToLowerInvariant();
        if (System.Text.RegularExpressions.Regex.IsMatch(l, @"\b(1[:.\- ]?1|one[-\s]?on[-\s]?one|meeting|catch[-\s]?up|1on1)\b"))
        {
            return QuickActionKind.Schedule1on1;
        }
        if (System.Text.RegularExpressions.Regex.IsMatch(l, @"\b(recogni[sz]e|recognition|kudos|thank|appreciat|praise|shout[-\s]?out)\b"))
        {
            return QuickActionKind.Recognition;
        }
        if (System.Text.RegularExpressions.Regex.IsMatch(l, @"\b(training|course|learn|enroll|workshop|coaching|mentor)\b"))
        {
            return QuickActionKind.Training;
        }
        if (System.Text.RegularExpressions.Regex.IsMatch(l, @"\b(pulse|survey|check[-\s]?in|feedback|nps)\b"))
        {
            return QuickActionKind.Pulse;
        }
        return null;
    }

    /// <summary>
    /// Build the rendered action list. Prefer AI-supplied actions
    /// (mapped to a known form when the label matches one of the
    /// Quick Action kinds; falling back to a generic <see cref="QuickActionKind.Message"/>
    /// dialog when it doesn't), and use the default CTA list when no
    /// AI insight is present so the section is never empty.
    /// </summary>
    public static IReadOnlyList<QuickAction> ResolveActions(AiInsightAction[]? aiActions)
    {
        if (aiActions is { Length: > 0 })
        {
            return aiActions
                .Select(a => new QuickAction(
                    Id: a.Id,
                    Label: a.Label,
                    Kind: MapLabelToKind(a.Label) ?? QuickActionKind.Message))
                .ToList();
        }
        return DefaultActions;
    }

    /// <summary>
    /// Resolve the default employee for any CTA that needs a recipient.
    /// Prefers the AI insight's <c>EmployeeId</c> if it matches the peer
    /// directory, else the first peer. Keeps the dialog's dropdown
    /// pre-selected to the right person.
    /// </summary>
    public static string ResolveDefaultEmployeeId(AiInsight? insight)
    {
        if (insight is not null)
        {
            var match = PeerDirectory.FirstOrDefault(p =>
                string.Equals(p.Id, insight.EmployeeId, StringComparison.OrdinalIgnoreCase));
            if (match is not null) return match.Id;
        }
        return PeerDirectory[0].Id;
    }

    public sealed record CourseOption(string Value, string Label);
    public sealed record CadenceOption(string Value, string Label);
}
