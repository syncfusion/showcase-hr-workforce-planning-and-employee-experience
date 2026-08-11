using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class LearningRecommendationConfiguration : IEntityTypeConfiguration<LearningRecommendation>
{
    public void Configure(EntityTypeBuilder<LearningRecommendation> builder)
    {
        builder.ToTable("employee_experience_learning_recommendations");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.EmployeeId).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Provider).HasMaxLength(200);
        builder.Property(x => x.Format).IsRequired().HasConversion<int>();
        builder.Property(x => x.SkillTag).HasMaxLength(100);
        builder.Property(x => x.Reason).HasMaxLength(500);
        builder.Property(x => x.MatchScore).HasColumnType("numeric(5,2)");
        builder.Property(x => x.EstHours).HasColumnType("numeric(6,2)");
        builder.Property(x => x.Status).IsRequired().HasConversion<int>();
        builder.Property(x => x.SuggestedAt).IsRequired();

        builder.HasIndex(x => x.EmployeeId).HasDatabaseName("ix_ee_learning_employee_id");
        builder.HasIndex(x => x.Status).HasDatabaseName("ix_ee_learning_status");
        builder.HasIndex(x => x.CareerPlanId).HasDatabaseName("ix_ee_learning_career_plan_id");
    }
}
