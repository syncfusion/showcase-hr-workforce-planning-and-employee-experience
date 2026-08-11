using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class OverviewActionPlanConfiguration : IEntityTypeConfiguration<OverviewActionPlan>
{
    public void Configure(EntityTypeBuilder<OverviewActionPlan> builder)
    {
        builder.ToTable("overview_action_plans");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Category).IsRequired().HasMaxLength(100);
        builder.Property(x => x.StatusColor).IsRequired().HasMaxLength(50);
        builder.Property(x => x.StatusLabel).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Progress).IsRequired();

        builder.OwnsMany(x => x.Actions, owned =>
        {
            owned.ToTable("overview_action_items");
            owned.WithOwner().HasForeignKey("action_plan_id");
            owned.Property(x => x.Label).IsRequired().HasMaxLength(200);
            owned.Property(x => x.Status).IsRequired().HasMaxLength(50);
            owned.Property(x => x.Color).IsRequired().HasMaxLength(50);
            owned.Property(x => x.DueDate).IsRequired();
        });

        builder.Navigation(x => x.Actions).AutoInclude();
    }
}
