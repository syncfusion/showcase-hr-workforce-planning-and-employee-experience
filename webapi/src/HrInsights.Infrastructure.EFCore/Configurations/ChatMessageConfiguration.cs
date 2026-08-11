using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HrInsights.Domain.Entities;

namespace HrInsights.Infrastructure.EFCore.Configurations;

public sealed class ChatMessageConfiguration : IEntityTypeConfiguration<ChatMessage>
{
    public void Configure(EntityTypeBuilder<ChatMessage> builder)
    {
        builder.ToTable("employee_experience_chat_messages");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ThreadId).IsRequired().HasMaxLength(100);
        builder.Property(x => x.FromId).IsRequired().HasMaxLength(50);
        builder.Property(x => x.FromName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ToId).HasMaxLength(50);
        builder.Property(x => x.Body).IsRequired().HasMaxLength(4000);
        builder.Property(x => x.SentAt).IsRequired();
        builder.Property(x => x.AttachmentsCsv).HasMaxLength(2000);

        builder.HasIndex(x => x.ThreadId).HasDatabaseName("ix_ee_chat_thread_id");
        builder.HasIndex(x => x.SentAt).HasDatabaseName("ix_ee_chat_sent_at");
    }
}
