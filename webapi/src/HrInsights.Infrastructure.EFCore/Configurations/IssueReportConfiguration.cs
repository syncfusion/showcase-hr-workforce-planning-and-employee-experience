using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class IssueReportConfiguration : IEntityTypeConfiguration<IssueReport>
{
    public void Configure(EntityTypeBuilder<IssueReport> builder)
    {
        builder.ToTable("employee_experience_issue_reports");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ReportedBy).IsRequired().HasMaxLength(50);
        builder.Property(x => x.ReportedByName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Category).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Subject).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(4000);
        builder.Property(x => x.Url).HasMaxLength(500);
        builder.Property(x => x.Browser).HasMaxLength(100);
        builder.Property(x => x.Status).IsRequired().HasConversion<int>();
        builder.Property(x => x.Priority).IsRequired().HasConversion<int>();
        builder.Property(x => x.AssignedTo).HasMaxLength(50);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.ResolvedAt);
        builder.Property(x => x.AttachmentsCsv).HasMaxLength(2000);

        builder.HasIndex(x => x.ReportedBy).HasDatabaseName("ix_ee_issues_reported_by");
        builder.HasIndex(x => x.Status).HasDatabaseName("ix_ee_issues_status");
        builder.HasIndex(x => x.Category).HasDatabaseName("ix_ee_issues_category");
        builder.HasIndex(x => new { x.Status, x.Priority }).HasDatabaseName("ix_ee_issues_status_priority");
    }
}
