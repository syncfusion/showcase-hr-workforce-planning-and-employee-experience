using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class ScenarioAssumptionConfiguration : IEntityTypeConfiguration<ScenarioAssumption>
{
    public void Configure(EntityTypeBuilder<ScenarioAssumption> builder)
    {
        builder.ToTable("scenario_assumptions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasMaxLength(100);
        builder.Property(x => x.ScenarioId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Category).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Value).IsRequired();
        builder.Property(x => x.Unit).IsRequired().HasMaxLength(20);
        builder.Property(x => x.Note).HasMaxLength(500);
    }
}
