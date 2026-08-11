using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class PlanningSnapshotConfiguration : IEntityTypeConfiguration<PlanningSnapshot>
{
    public void Configure(EntityTypeBuilder<PlanningSnapshot> builder)
    {
        builder.ToTable("planning_snapshots");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasMaxLength(100);
        builder.Property(x => x.PlanId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.CapturedAt).IsRequired();
        builder.Property(x => x.CreatedBy).IsRequired().HasMaxLength(100);
        builder.Property(x => x.SourceSystem).IsRequired().HasMaxLength(100);
    }
}
