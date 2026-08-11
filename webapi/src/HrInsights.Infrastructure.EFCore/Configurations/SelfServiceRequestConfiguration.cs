using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class SelfServiceRequestConfiguration : IEntityTypeConfiguration<SelfServiceRequest>
{
    public void Configure(EntityTypeBuilder<SelfServiceRequest> builder)
    {
        builder.ToTable("employee_experience_self_service_requests");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.EmployeeId).IsRequired().HasMaxLength(50);
        builder.Property(x => x.EmployeeName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Type).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Subject).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Details).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.Status).IsRequired().HasConversion<int>();
        builder.Property(x => x.Priority).IsRequired().HasConversion<int>();
        builder.Property(x => x.AssignedTo).HasMaxLength(50);
        builder.Property(x => x.CreatedAt).IsRequired();
        builder.Property(x => x.UpdatedAt);
        builder.Property(x => x.AttachmentsCsv).HasMaxLength(2000);

        builder.HasIndex(x => x.EmployeeId).HasDatabaseName("ix_ee_self_service_employee_id");
        builder.HasIndex(x => x.Status).HasDatabaseName("ix_ee_self_service_status");
        builder.HasIndex(x => x.Type).HasDatabaseName("ix_ee_self_service_type");
        builder.HasIndex(x => new { x.Status, x.Priority }).HasDatabaseName("ix_ee_self_service_status_priority");
    }
}
