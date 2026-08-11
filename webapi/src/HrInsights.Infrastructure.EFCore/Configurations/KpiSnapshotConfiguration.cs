using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class KpiSnapshotConfiguration : IEntityTypeConfiguration<KpiSnapshot>
{
    public void Configure(EntityTypeBuilder<KpiSnapshot> builder)
    {
        builder.ToTable("overview_kpi_snapshots");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Headcount).IsRequired();
        builder.Property(x => x.HeadcountChange).IsRequired();
        builder.Property(x => x.OpenRoles).IsRequired();
        builder.Property(x => x.OpenRolesChange).IsRequired();
        builder.Property(x => x.EngagementScore).IsRequired();
        builder.Property(x => x.EngagementChange).IsRequired();
        builder.Property(x => x.AttritionRate);
    }
}
