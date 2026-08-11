using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class KanbanItemConfiguration : IEntityTypeConfiguration<KanbanItem>
{
    public void Configure(EntityTypeBuilder<KanbanItem> builder)
    {
        builder.ToTable("employee_experience_kanban_items");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.SourceType).IsRequired().HasMaxLength(50);
        builder.Property(x => x.SourceId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Lane).IsRequired().HasConversion<int>();
        builder.Property(x => x.AssigneeId).HasMaxLength(50);
        builder.Property(x => x.Priority).IsRequired().HasConversion<int>();
        builder.Property(x => x.DueDate);
        builder.Property(x => x.UpdatedAt).IsRequired();
        builder.Property(x => x.TagsCsv).HasMaxLength(2000);

        builder.HasIndex(x => x.Lane).HasDatabaseName("ix_ee_kanban_lane");
        builder.HasIndex(x => x.SourceType).HasDatabaseName("ix_ee_kanban_source_type");
        builder.HasIndex(x => new { x.SourceType, x.SourceId }).HasDatabaseName("ix_ee_kanban_source");
    }
}
