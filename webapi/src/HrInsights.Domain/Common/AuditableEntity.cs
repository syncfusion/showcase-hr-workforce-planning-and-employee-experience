namespace HrInsights.Domain.Common;

public abstract class AuditableEntity<TId> : EntityBase<TId>
    where TId : notnull
{
    protected AuditableEntity()
    {
    }
    protected AuditableEntity(TId id) : base(id)
    {
    }

    public DateTime CreatedOnUtc { get; private set; }

    public DateTime? LastModifiedOnUtc { get; private set; }

    public DateTime? ArchivedOnUtc { get; private set; }

    public void MarkCreated(DateTime createdOnUtc)
    {
        CreatedOnUtc = createdOnUtc;
        LastModifiedOnUtc = createdOnUtc;
    }

    public void MarkModified(DateTime modifiedOnUtc)
    {
        LastModifiedOnUtc = modifiedOnUtc;
    }

    public void Archive(DateTime archivedOnUtc)
    {
        ArchivedOnUtc = archivedOnUtc;
        LastModifiedOnUtc = archivedOnUtc;
    }
}
