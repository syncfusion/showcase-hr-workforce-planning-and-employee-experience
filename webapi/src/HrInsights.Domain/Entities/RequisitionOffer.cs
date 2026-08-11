using HrInsights.Domain.Common;

namespace HrInsights.Domain.Entities;

/// <summary>
/// A recorded offer for an application on a requisition.
/// </summary>
public sealed class RequisitionOffer : AuditableEntity<Guid>
{
    private RequisitionOffer()
        : base(Guid.Empty)
    {
        ApplicationId = string.Empty;
        Currency = string.Empty;
    }

    private RequisitionOffer(
        Guid id,
        Guid requisitionId,
        string applicationId,
        decimal compensation,
        string currency,
        DateTime startDate)
        : base(id)
    {
        RequisitionId = requisitionId;
        ApplicationId = applicationId;
        Compensation = compensation;
        Currency = currency;
        StartDate = startDate;
    }

    public Guid RequisitionId { get; private set; }
    public string ApplicationId { get; private set; }
    public decimal Compensation { get; private set; }
    public string Currency { get; private set; }
    public DateTime StartDate { get; private set; }

    public static RequisitionOffer Create(
        Guid requisitionId,
        string applicationId,
        decimal compensation,
        string currency,
        DateTime startDate)
        => new(Guid.NewGuid(), requisitionId, applicationId, compensation, currency, startDate);
}
