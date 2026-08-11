using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class DelayConcernConfiguration : IEntityTypeConfiguration<DelayConcern>
{
    public void Configure(EntityTypeBuilder<DelayConcern> builder)
    {
        builder.ToTable("employee_experience_delay_concerns");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.RaisedBy).IsRequired().HasMaxLength(50);
        builder.Property(x => x.RaisedByName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.RelatedEntityType).IsRequired().HasMaxLength(50);
        builder.Property(x => x.RelatedEntityId).HasMaxLength(50);
        builder.Property(x => x.Subject).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Details).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.DaysWaiting).IsRequired();
        builder.Property(x => x.ExpectedSlackDays);
        builder.Property(x => x.Status).IsRequired().HasConversion<int>();
        builder.Property(x => x.Severity).IsRequired().HasConversion<int>();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.RaisedBy).HasDatabaseName("ix_ee_delays_raised_by");
        builder.HasIndex(x => x.Status).HasDatabaseName("ix_ee_delays_status");
        builder.HasIndex(x => new { x.Status, x.Severity }).HasDatabaseName("ix_ee_delays_status_severity");
    }
}
