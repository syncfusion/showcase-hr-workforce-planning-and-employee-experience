using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class RequisitionOfferConfiguration : IEntityTypeConfiguration<RequisitionOffer>
{
    public void Configure(EntityTypeBuilder<RequisitionOffer> builder)
    {
        builder.ToTable("hiring_pipeline_offers");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.RequisitionId).IsRequired();
        builder.Property(x => x.ApplicationId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Compensation).IsRequired().HasColumnType("numeric(14,2)");
        builder.Property(x => x.Currency).IsRequired().HasMaxLength(10);
        builder.Property(x => x.StartDate).IsRequired();

        builder.HasIndex(x => x.RequisitionId);
        builder.HasIndex(x => x.ApplicationId);
    }
}
