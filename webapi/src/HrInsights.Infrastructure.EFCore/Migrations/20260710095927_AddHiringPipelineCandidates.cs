using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrInsights.Infrastructure.EFCore.Migrations
{
    /// <inheritdoc />
    public partial class AddHiringPipelineCandidates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "hiring_pipeline_candidates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequisitionId = table.Column<Guid>(type: "uuid", nullable: true),
                    FullName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    Initials = table.Column<string>(type: "character varying(4)", maxLength: 4, nullable: false),
                    Position = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AppliedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hiring_pipeline_candidates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_hiring_pipeline_candidates_hiring_pipeline_requisitions_Req~",
                        column: x => x.RequisitionId,
                        principalTable: "hiring_pipeline_requisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "ix_hiring_pipeline_candidates_requisition_id",
                table: "hiring_pipeline_candidates",
                column: "RequisitionId");

            migrationBuilder.CreateIndex(
                name: "ix_hiring_pipeline_candidates_status_applied_at",
                table: "hiring_pipeline_candidates",
                columns: new[] { "Status", "AppliedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "hiring_pipeline_candidates");
        }
    }
}
