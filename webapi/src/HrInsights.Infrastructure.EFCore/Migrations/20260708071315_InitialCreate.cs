using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace HrInsights.Infrastructure.EFCore.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "hiring_pipeline_requisitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DaysOpen = table.Column<int>(type: "integer", nullable: false),
                    HiredCount = table.Column<int>(type: "integer", nullable: false),
                    TargetCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hiring_pipeline_requisitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "overview_action_plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    StatusColor = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StatusLabel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Progress = table.Column<int>(type: "integer", nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_overview_action_plans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "overview_activity_timeline_events",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TimestampDisplay = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_overview_activity_timeline_events", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "overview_ai_insights",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EngagementDrop = table.Column<int>(type: "integer", nullable: false),
                    Quarter = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Summary = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_overview_ai_insights", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "overview_kpi_cards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    CurrentValue = table.Column<double>(type: "double precision", nullable: false),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ChangePercent = table.Column<double>(type: "double precision", nullable: false),
                    Context = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ShowProgress = table.Column<bool>(type: "boolean", nullable: true),
                    ProgressValue = table.Column<int>(type: "integer", nullable: true),
                    Target = table.Column<int>(type: "integer", nullable: true),
                    Color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_overview_kpi_cards", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "overview_kpi_snapshots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Headcount = table.Column<int>(type: "integer", nullable: false),
                    OpenRoles = table.Column<int>(type: "integer", nullable: false),
                    AttritionRate = table.Column<double>(type: "double precision", nullable: true),
                    EngagementScore = table.Column<int>(type: "integer", nullable: false),
                    HeadcountChange = table.Column<int>(type: "integer", nullable: false),
                    OpenRolesChange = table.Column<int>(type: "integer", nullable: false),
                    EngagementChange = table.Column<int>(type: "integer", nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_overview_kpi_snapshots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "overview_requisitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Priority = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Candidates = table.Column<int>(type: "integer", nullable: false),
                    Stage = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TimeOpen = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_overview_requisitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "planning_snapshots",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PlanId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CapturedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SourceSystem = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_planning_snapshots", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "scenario_assumptions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ScenarioId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Value = table.Column<double>(type: "double precision", nullable: false),
                    Unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_scenario_assumptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "workforce_line_items",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ScenarioId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Function = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Region = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RoleFamily = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    CurrentHeadcount = table.Column<int>(type: "integer", nullable: false),
                    PlannedHeadcount = table.Column<int>(type: "integer", nullable: false),
                    OpenRoles = table.Column<int>(type: "integer", nullable: true),
                    CostCenter = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_workforce_line_items", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "workforce_plans",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PlanningPeriodStart = table.Column<DateOnly>(type: "date", nullable: false),
                    PlanningPeriodEnd = table.Column<DateOnly>(type: "date", nullable: false),
                    OwnerId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    LatestSnapshotAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_workforce_plans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "workforce_scenarios",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PlanId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    HeadcountTarget = table.Column<int>(type: "integer", nullable: false),
                    HiringTarget = table.Column<int>(type: "integer", nullable: true),
                    AttritionRate = table.Column<double>(type: "double precision", nullable: true),
                    BudgetImpact = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Confidence = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_workforce_scenarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "hiring_pipeline_interviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequisitionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ScheduledStartUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ScheduledEndUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Interviewers = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hiring_pipeline_interviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_hiring_pipeline_interviews_hiring_pipeline_requisitions_Req~",
                        column: x => x.RequisitionId,
                        principalTable: "hiring_pipeline_requisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "hiring_pipeline_offers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequisitionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Compensation = table.Column<decimal>(type: "numeric(14,2)", nullable: false),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_hiring_pipeline_offers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_hiring_pipeline_offers_hiring_pipeline_requisitions_Requisi~",
                        column: x => x.RequisitionId,
                        principalTable: "hiring_pipeline_requisitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "overview_action_items",
                columns: table => new
                {
                    action_plan_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Label = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_overview_action_items", x => new { x.action_plan_id, x.Id });
                    table.ForeignKey(
                        name: "FK_overview_action_items_overview_action_plans_action_plan_id",
                        column: x => x.action_plan_id,
                        principalTable: "overview_action_plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "overview_ai_insight_actions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ai_insight_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Label = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_overview_ai_insight_actions", x => new { x.ai_insight_id, x.Id });
                    table.ForeignKey(
                        name: "FK_overview_ai_insight_actions_overview_ai_insights_ai_insight~",
                        column: x => x.ai_insight_id,
                        principalTable: "overview_ai_insights",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "overview_kpi_trend_points",
                columns: table => new
                {
                    kpi_card_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MonthIndex = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_overview_kpi_trend_points", x => new { x.kpi_card_id, x.Id });
                    table.ForeignKey(
                        name: "FK_overview_kpi_trend_points_overview_kpi_cards_kpi_card_id",
                        column: x => x.kpi_card_id,
                        principalTable: "overview_kpi_cards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_hiring_pipeline_interviews_ApplicationId",
                table: "hiring_pipeline_interviews",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_hiring_pipeline_interviews_RequisitionId",
                table: "hiring_pipeline_interviews",
                column: "RequisitionId");

            migrationBuilder.CreateIndex(
                name: "IX_hiring_pipeline_offers_ApplicationId",
                table: "hiring_pipeline_offers",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_hiring_pipeline_offers_RequisitionId",
                table: "hiring_pipeline_offers",
                column: "RequisitionId");

            migrationBuilder.CreateIndex(
                name: "IX_hiring_pipeline_requisitions_Department",
                table: "hiring_pipeline_requisitions",
                column: "Department");

            migrationBuilder.CreateIndex(
                name: "IX_hiring_pipeline_requisitions_Location",
                table: "hiring_pipeline_requisitions",
                column: "Location");

            migrationBuilder.CreateIndex(
                name: "IX_hiring_pipeline_requisitions_Priority",
                table: "hiring_pipeline_requisitions",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_hiring_pipeline_requisitions_Status",
                table: "hiring_pipeline_requisitions",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "hiring_pipeline_interviews");

            migrationBuilder.DropTable(
                name: "hiring_pipeline_offers");

            migrationBuilder.DropTable(
                name: "overview_action_items");

            migrationBuilder.DropTable(
                name: "overview_activity_timeline_events");

            migrationBuilder.DropTable(
                name: "overview_ai_insight_actions");

            migrationBuilder.DropTable(
                name: "overview_kpi_snapshots");

            migrationBuilder.DropTable(
                name: "overview_kpi_trend_points");

            migrationBuilder.DropTable(
                name: "overview_requisitions");

            migrationBuilder.DropTable(
                name: "planning_snapshots");

            migrationBuilder.DropTable(
                name: "scenario_assumptions");

            migrationBuilder.DropTable(
                name: "workforce_line_items");

            migrationBuilder.DropTable(
                name: "workforce_plans");

            migrationBuilder.DropTable(
                name: "workforce_scenarios");

            migrationBuilder.DropTable(
                name: "hiring_pipeline_requisitions");

            migrationBuilder.DropTable(
                name: "overview_action_plans");

            migrationBuilder.DropTable(
                name: "overview_ai_insights");

            migrationBuilder.DropTable(
                name: "overview_kpi_cards");
        }
    }
}
