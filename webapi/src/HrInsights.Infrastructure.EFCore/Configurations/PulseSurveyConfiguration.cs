using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class PulseSurveyConfiguration : IEntityTypeConfiguration<PulseSurvey>
{
    public void Configure(EntityTypeBuilder<PulseSurvey> builder)
    {
        builder.ToTable("employee_experience_pulse_surveys");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CampaignId).HasMaxLength(100);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Status).IsRequired().HasConversion<int>();
        builder.Property(x => x.Cadence).HasConversion<int?>();
        builder.Property(x => x.ResponseRate).HasColumnType("numeric(5,2)");
        builder.Property(x => x.TotalResponses).IsRequired();
        builder.Property(x => x.OpenAt).IsRequired();
        builder.Property(x => x.CloseAt);
        builder.Property(x => x.QuestionRefsCsv).HasMaxLength(2000);

        builder.HasIndex(x => x.Status).HasDatabaseName("ix_ee_pulse_surveys_status");
        builder.HasIndex(x => x.OpenAt).HasDatabaseName("ix_ee_pulse_surveys_open_at");

        // Themes as owned entities with a real table.
        builder.OwnsMany(x => x.Themes, owned =>
        {
            owned.ToTable("employee_experience_pulse_survey_themes");
            owned.WithOwner().HasForeignKey(x => x.PulseSurveyId);
            owned.HasKey(x => x.Id);
            owned.Property(x => x.PulseSurveyId).IsRequired();
            owned.Property(x => x.Theme).IsRequired().HasMaxLength(100);
            owned.Property(x => x.Department).IsRequired().HasMaxLength(100);
            owned.Property(x => x.Sentiment).IsRequired();
            owned.HasIndex(x => x.PulseSurveyId).HasDatabaseName("ix_ee_pulse_themes_survey_id");
        });
        builder.Navigation(x => x.Themes).AutoInclude();
    }
}
