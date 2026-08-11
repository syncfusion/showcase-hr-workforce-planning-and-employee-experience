using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;
using HrInsights.Domain.Enums;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class RequisitionConfiguration : IEntityTypeConfiguration<Requisition>
{
    public void Configure(EntityTypeBuilder<Requisition> builder)
    {
        builder.ToTable("hiring_pipeline_requisitions");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Department).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Location).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Priority).IsRequired().HasConversion<int>();
        builder.Property(x => x.Status).IsRequired().HasConversion<int>();
        builder.Property(x => x.DaysOpen).IsRequired();
        builder.Property(x => x.HiredCount).IsRequired();
        builder.Property(x => x.TargetCount).IsRequired();
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasIndex(x => x.Department);
        builder.HasIndex(x => x.Location);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.Priority);

        builder.HasMany<RequisitionInterview>()
            .WithOne()
            .HasForeignKey(x => x.RequisitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany<RequisitionOffer>()
            .WithOne()
            .HasForeignKey(x => x.RequisitionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
