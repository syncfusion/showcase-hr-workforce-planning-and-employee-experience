using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class WorkforceScenarioConfiguration : IEntityTypeConfiguration<WorkforceScenario>
{
    public void Configure(EntityTypeBuilder<WorkforceScenario> builder)
    {
        builder.ToTable("workforce_scenarios");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasMaxLength(100);
        builder.Property(x => x.PlanId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Type).IsRequired().HasMaxLength(50);
        builder.Property(x => x.HeadcountTarget).IsRequired();
        builder.Property(x => x.HiringTarget);
        builder.Property(x => x.AttritionRate);
        builder.Property(x => x.BudgetImpact).HasColumnType("decimal(12,2)").IsRequired();
        builder.Property(x => x.Confidence).HasMaxLength(20);
    }
}
