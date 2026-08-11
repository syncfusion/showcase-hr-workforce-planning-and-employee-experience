using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class ActivityTimelineEventConfiguration : IEntityTypeConfiguration<ActivityTimelineEvent>
{
    public void Configure(EntityTypeBuilder<ActivityTimelineEvent> builder)
    {
        builder.ToTable("overview_activity_timeline_events");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Category).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Date).IsRequired();
        builder.Property(x => x.TimestampDisplay).IsRequired().HasMaxLength(50);
    }
}
