using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class CareerDevelopmentPlanConfiguration : IEntityTypeConfiguration<CareerDevelopmentPlan>
{
    public void Configure(EntityTypeBuilder<CareerDevelopmentPlan> builder)
    {
        builder.ToTable("employee_experience_career_plans");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.EmployeeId).IsRequired().HasMaxLength(50);
        builder.Property(x => x.EmployeeName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ManagerId).IsRequired().HasMaxLength(50);
        builder.Property(x => x.CurrentRole).IsRequired().HasMaxLength(200);
        builder.Property(x => x.TargetRole).HasMaxLength(200);
        builder.Property(x => x.Horizon).IsRequired().HasConversion<int>();
        builder.Property(x => x.Status).IsRequired().HasConversion<int>();
        builder.Property(x => x.LastReviewedAt);

        builder.HasIndex(x => x.EmployeeId).HasDatabaseName("ix_ee_career_plans_employee_id");
        builder.HasIndex(x => x.ManagerId).HasDatabaseName("ix_ee_career_plans_manager_id");
        builder.HasIndex(x => x.Status).HasDatabaseName("ix_ee_career_plans_status");

        // Milestones are owned entities (PK is the Guid on the entity, FK is the plan id).
        builder.OwnsMany(x => x.Milestones, owned =>
        {
            owned.ToTable("employee_experience_career_plan_milestones");
            owned.WithOwner().HasForeignKey(x => x.CareerPlanId);
            owned.HasKey(x => x.Id);
            owned.Property(x => x.CareerPlanId).IsRequired();
            owned.Property(x => x.Title).IsRequired().HasMaxLength(200);
            owned.Property(x => x.TargetDate).IsRequired();
            owned.Property(x => x.Status).IsRequired().HasConversion<int>();
            owned.Property(x => x.EvidenceLink).HasMaxLength(500);
            owned.HasIndex(x => x.CareerPlanId).HasDatabaseName("ix_ee_milestones_plan_id");
        });
        builder.Navigation(x => x.Milestones).AutoInclude();
    }
}
