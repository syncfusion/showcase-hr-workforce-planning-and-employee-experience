using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class OverviewRequisitionConfiguration : IEntityTypeConfiguration<OverviewRequisition>
{
    public void Configure(EntityTypeBuilder<OverviewRequisition> builder)
    {
        builder.ToTable("overview_requisitions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Role).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Department).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Priority).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Stage).IsRequired().HasMaxLength(50);
        builder.Property(x => x.TimeOpen).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Candidates).IsRequired();
    }
}
