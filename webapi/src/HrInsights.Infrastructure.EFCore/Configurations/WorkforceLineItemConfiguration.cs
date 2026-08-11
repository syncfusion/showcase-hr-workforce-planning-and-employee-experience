using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class WorkforceLineItemConfiguration : IEntityTypeConfiguration<WorkforceLineItem>
{
    public void Configure(EntityTypeBuilder<WorkforceLineItem> builder)
    {
        builder.ToTable("workforce_line_items");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasMaxLength(100);
        builder.Property(x => x.ScenarioId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Function).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Region).IsRequired().HasMaxLength(100);
        builder.Property(x => x.RoleFamily).IsRequired().HasMaxLength(150);
        builder.Property(x => x.CurrentHeadcount).IsRequired();
        builder.Property(x => x.PlannedHeadcount).IsRequired();
        builder.Property(x => x.OpenRoles);
        builder.Property(x => x.CostCenter).HasMaxLength(50);
    }
}
