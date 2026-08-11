using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class PulseResponseConfiguration : IEntityTypeConfiguration<PulseResponse>
{
    public void Configure(EntityTypeBuilder<PulseResponse> builder)
    {
        builder.ToTable("employee_experience_pulse_responses");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.EmployeeId).HasMaxLength(50);
        builder.Property(x => x.Department).HasMaxLength(100);
        builder.Property(x => x.Sentiment).HasColumnType("numeric(6,2)");
        builder.Property(x => x.SubmittedAt).IsRequired();
        builder.Property(x => x.Comment).HasMaxLength(2000);

        builder.HasIndex(x => x.PulseSurveyId).HasDatabaseName("ix_ee_pulse_responses_survey_id");
        builder.HasIndex(x => x.EmployeeId).HasDatabaseName("ix_ee_pulse_responses_employee_id");
        builder.HasIndex(x => x.SubmittedAt).HasDatabaseName("ix_ee_pulse_responses_submitted_at");
    }
}
