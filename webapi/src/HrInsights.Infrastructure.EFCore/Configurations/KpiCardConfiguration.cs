using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class KpiCardConfiguration : IEntityTypeConfiguration<KpiCard>
{
    public void Configure(EntityTypeBuilder<KpiCard> builder)
    {
        builder.ToTable("overview_kpi_cards");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(150);
        builder.Property(x => x.CurrentValue).IsRequired();
        builder.Property(x => x.Unit).IsRequired().HasMaxLength(20);
        builder.Property(x => x.ChangePercent).IsRequired();
        builder.Property(x => x.Context).HasMaxLength(200);
        builder.Property(x => x.Color).HasMaxLength(50);

        builder.OwnsMany(x => x.Trend, owned =>
        {
            owned.ToTable("overview_kpi_trend_points");
            owned.WithOwner().HasForeignKey("kpi_card_id");
            owned.Property(x => x.MonthIndex).IsRequired();
            owned.Property(x => x.Value).IsRequired();
        });

        builder.Navigation(x => x.Trend).AutoInclude();
    }
}
