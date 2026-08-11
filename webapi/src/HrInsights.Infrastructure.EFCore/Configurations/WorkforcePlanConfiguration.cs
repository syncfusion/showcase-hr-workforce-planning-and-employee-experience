using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class WorkforcePlanConfiguration : IEntityTypeConfiguration<WorkforcePlan>
{
    public void Configure(EntityTypeBuilder<WorkforcePlan> builder)
    {
        builder.ToTable("workforce_plans");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasMaxLength(100);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(50);
        builder.Property(x => x.OwnerId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Currency).IsRequired().HasMaxLength(10);
        builder.Property(x => x.PlanningPeriodStart).IsRequired();
        builder.Property(x => x.PlanningPeriodEnd).IsRequired();
        builder.Property(x => x.LatestSnapshotAt);
    }
}
