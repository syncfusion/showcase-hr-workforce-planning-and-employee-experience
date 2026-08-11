using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class NotificationItemConfiguration : IEntityTypeConfiguration<NotificationItem>
{
    public void Configure(EntityTypeBuilder<NotificationItem> builder)
    {
        builder.ToTable("employee_experience_notifications");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Type).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Body).HasMaxLength(2000);
        builder.Property(x => x.RelatedEntityType).HasMaxLength(50);
        builder.Property(x => x.RelatedEntityId).HasMaxLength(100);
        builder.Property(x => x.Read).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.UserId).HasDatabaseName("ix_ee_notifications_user");
        builder.HasIndex(x => new { x.UserId, x.Read }).HasDatabaseName("ix_ee_notifications_user_read");
        builder.HasIndex(x => x.CreatedAt).HasDatabaseName("ix_ee_notifications_created_at");
    }
}
