using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;
using HrInsights.Domain.Enums;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class CandidateConfiguration : IEntityTypeConfiguration<Candidate>
{
    public void Configure(EntityTypeBuilder<Candidate> builder)
    {
        builder.ToTable("hiring_pipeline_candidates");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.RequisitionId);
        builder.Property(x => x.FullName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Email).IsRequired().HasMaxLength(320);
        builder.Property(x => x.Initials).IsRequired().HasMaxLength(4);
        builder.Property(x => x.Position).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Department).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Location).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Source).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Status).IsRequired().HasConversion<int>();
        builder.Property(x => x.AppliedAt).IsRequired();

        // Common query: list candidates by status ordered by most recently applied.
        builder.HasIndex(x => new { x.Status, x.AppliedAt })
            .HasDatabaseName("ix_hiring_pipeline_candidates_status_applied_at");

        builder.HasIndex(x => x.RequisitionId)
            .HasDatabaseName("ix_hiring_pipeline_candidates_requisition_id");

        // Optional FK to Requisition: do not cascade — keep historical applications
        // around if a requisition is removed.
        builder.HasOne<Requisition>()
            .WithMany()
            .HasForeignKey(x => x.RequisitionId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
