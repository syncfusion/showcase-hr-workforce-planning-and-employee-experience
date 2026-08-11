using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

/// <summary>
/// A single message in a chat thread on the Employee Experience surface.
/// </summary>
public sealed class ChatMessage : AuditableEntity<Guid>
{
    private ChatMessage() : base(Guid.Empty)
    {
        ThreadId = string.Empty;
        FromId = string.Empty;
        FromName = string.Empty;
        Body = string.Empty;
    }

    private ChatMessage(
        Guid id,
        string threadId,
        string fromId,
        string fromName,
        string? toId,
        string body,
        DateTime sentAtUtc)
        : base(id)
    {
        ThreadId = threadId;
        FromId = fromId;
        FromName = fromName;
        ToId = toId;
        Body = body;
        SentAt = sentAtUtc;
    }

    public string ThreadId { get; private set; }
    public string FromId { get; private set; }
    public string FromName { get; private set; }
    public string? ToId { get; private set; }
    public string Body { get; private set; }
    public DateTime SentAt { get; private set; }
    public string? AttachmentsCsv { get; private set; } = string.Empty;

    public IReadOnlyList<string> GetAttachments()
        => string.IsNullOrWhiteSpace(AttachmentsCsv)
            ? Array.Empty<string>()
            : AttachmentsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    public void SetAttachments(IEnumerable<string> attachments)
        => AttachmentsCsv = string.Join(',', attachments ?? Array.Empty<string>());

    public static ChatMessage Create(
        string threadId,
        string fromId,
        string fromName,
        string? toId,
        string body,
        DateTime sentAtUtc,
        IEnumerable<string>? attachments = null)
    {
        if (string.IsNullOrWhiteSpace(threadId)) throw new ArgumentException("ThreadId is required.", nameof(threadId));
        if (string.IsNullOrWhiteSpace(fromId)) throw new ArgumentException("FromId is required.", nameof(fromId));
        if (string.IsNullOrWhiteSpace(body)) throw new ArgumentException("Body is required.", nameof(body));

        var msg = new ChatMessage(
            Guid.NewGuid(),
            threadId.Trim(),
            fromId.Trim(),
            fromName?.Trim() ?? string.Empty,
            toId?.Trim(),
            body.Trim(),
            DateTime.SpecifyKind(sentAtUtc, DateTimeKind.Utc));
        msg.SetAttachments(attachments ?? Array.Empty<string>());
        return msg;
    }
}
