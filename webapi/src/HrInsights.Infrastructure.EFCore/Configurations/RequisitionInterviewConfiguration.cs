using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class RequisitionInterviewConfiguration : IEntityTypeConfiguration<RequisitionInterview>
{
    public void Configure(EntityTypeBuilder<RequisitionInterview> builder)
    {
        builder.ToTable("hiring_pipeline_interviews");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.RequisitionId).IsRequired();
        builder.Property(x => x.ApplicationId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Type).IsRequired().HasMaxLength(50);
        builder.Property(x => x.ScheduledStartUtc).IsRequired();
        builder.Property(x => x.ScheduledEndUtc).IsRequired();
        builder.Property(x => x.Interviewers).IsRequired().HasMaxLength(2000);

        builder.HasIndex(x => x.RequisitionId);
        builder.HasIndex(x => x.ApplicationId);
    }
}
