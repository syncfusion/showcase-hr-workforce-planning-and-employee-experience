using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class OverviewAiInsightConfiguration : IEntityTypeConfiguration<OverviewAiInsight>
{
    public void Configure(EntityTypeBuilder<OverviewAiInsight> builder)
    {
        builder.ToTable("overview_ai_insights");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.EmployeeId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.EngagementDrop).IsRequired();
        builder.Property(x => x.Quarter).IsRequired().HasMaxLength(10);
        builder.Property(x => x.Notes).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.Summary).IsRequired().HasMaxLength(2000);

        builder.OwnsMany(x => x.Actions, owned =>
        {
            owned.ToTable("overview_ai_insight_actions");
            owned.WithOwner().HasForeignKey("ai_insight_id");
            owned.Property(x => x.Id).HasMaxLength(50).IsRequired();
            owned.Property(x => x.Label).IsRequired().HasMaxLength(200);
        });

        builder.Navigation(x => x.Actions).AutoInclude();
    }
}
