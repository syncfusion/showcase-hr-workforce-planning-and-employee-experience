using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class RecognitionConfiguration : IEntityTypeConfiguration<Recognition>
{
    public void Configure(EntityTypeBuilder<Recognition> builder)
    {
        builder.ToTable("employee_experience_recognitions");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.FromEmployeeId).IsRequired().HasMaxLength(50);
        builder.Property(x => x.FromName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ToEmployeeId).IsRequired().HasMaxLength(50);
        builder.Property(x => x.ToName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Type).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Message).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.Value).HasMaxLength(100);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.VisibleTo).IsRequired().HasMaxLength(50);

        builder.HasIndex(x => x.FromEmployeeId).HasDatabaseName("ix_ee_recognitions_from");
        builder.HasIndex(x => x.ToEmployeeId).HasDatabaseName("ix_ee_recognitions_to");
        builder.HasIndex(x => x.CreatedAt).HasDatabaseName("ix_ee_recognitions_created_at");
    }
}
