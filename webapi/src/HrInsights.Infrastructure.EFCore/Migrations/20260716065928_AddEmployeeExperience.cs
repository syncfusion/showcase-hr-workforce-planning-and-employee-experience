using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrInsights.Infrastructure.EFCore.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeExperience : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "employee_experience_career_plans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EmployeeName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ManagerId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CurrentRole = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TargetRole = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Horizon = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    LastReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee_experience_career_plans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "employee_experience_chat_messages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ThreadId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FromId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FromName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ToId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Body = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AttachmentsCsv = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee_experience_chat_messages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "employee_experience_delay_concerns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RaisedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RaisedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    RelatedEntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RelatedEntityId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Subject = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Details = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    DaysWaiting = table.Column<int>(type: "integer", nullable: false),
                    ExpectedSlackDays = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Severity = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee_experience_delay_concerns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "employee_experience_issue_reports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReportedBy = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ReportedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Subject = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Browser = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    AssignedTo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AttachmentsCsv = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee_experience_issue_reports", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "employee_experience_kanban_items",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SourceId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Lane = table.Column<int>(type: "integer", nullable: false),
                    AssigneeId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TagsCsv = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee_experience_kanban_items", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "employee_experience_learning_recommendations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CareerPlanId = table.Column<Guid>(type: "uuid", nullable: true),
                    EmployeeId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Provider = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Format = table.Column<int>(type: "integer", nullable: false),
                    SkillTag = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    MatchScore = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    EstHours = table.Column<decimal>(type: "numeric(6,2)", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    SuggestedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee_experience_learning_recommendations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "employee_experience_notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Body = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    RelatedEntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    RelatedEntityId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Read = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee_experience_notifications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "employee_experience_pulse_responses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PulseSurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Sentiment = table.Column<decimal>(type: "numeric(6,2)", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Comment = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee_experience_pulse_responses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "employee_experience_pulse_surveys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CampaignId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Cadence = table.Column<int>(type: "integer", nullable: true),
                    ResponseRate = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    TotalResponses = table.Column<int>(type: "integer", nullable: false),
                    OpenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CloseAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    QuestionRefsCsv = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee_experience_pulse_surveys", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "employee_experience_recognitions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FromEmployeeId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FromName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ToEmployeeId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ToName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Value = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    VisibleTo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee_experience_recognitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "employee_experience_self_service_requests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EmployeeName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Subject = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Details = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    AssignedTo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AttachmentsCsv = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee_experience_self_service_requests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "employee_experience_career_plan_milestones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CareerPlanId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TargetDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    EvidenceLink = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee_experience_career_plan_milestones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_employee_experience_career_plan_milestones_employee_experie~",
                        column: x => x.CareerPlanId,
                        principalTable: "employee_experience_career_plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "employee_experience_pulse_survey_themes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PulseSurveyId = table.Column<Guid>(type: "uuid", nullable: false),
                    Theme = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Sentiment = table.Column<int>(type: "integer", nullable: false),
                    Department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedOnUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_employee_experience_pulse_survey_themes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_employee_experience_pulse_survey_themes_employee_experience~",
                        column: x => x.PulseSurveyId,
                        principalTable: "employee_experience_pulse_surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_ee_milestones_plan_id",
                table: "employee_experience_career_plan_milestones",
                column: "CareerPlanId");

            migrationBuilder.CreateIndex(
                name: "ix_ee_career_plans_employee_id",
                table: "employee_experience_career_plans",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "ix_ee_career_plans_manager_id",
                table: "employee_experience_career_plans",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "ix_ee_career_plans_status",
                table: "employee_experience_career_plans",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "ix_ee_chat_sent_at",
                table: "employee_experience_chat_messages",
                column: "SentAt");

            migrationBuilder.CreateIndex(
                name: "ix_ee_chat_thread_id",
                table: "employee_experience_chat_messages",
                column: "ThreadId");

            migrationBuilder.CreateIndex(
                name: "ix_ee_delays_raised_by",
                table: "employee_experience_delay_concerns",
                column: "RaisedBy");

            migrationBuilder.CreateIndex(
                name: "ix_ee_delays_status",
                table: "employee_experience_delay_concerns",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "ix_ee_delays_status_severity",
                table: "employee_experience_delay_concerns",
                columns: new[] { "Status", "Severity" });

            migrationBuilder.CreateIndex(
                name: "ix_ee_issues_category",
                table: "employee_experience_issue_reports",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "ix_ee_issues_reported_by",
                table: "employee_experience_issue_reports",
                column: "ReportedBy");

            migrationBuilder.CreateIndex(
                name: "ix_ee_issues_status",
                table: "employee_experience_issue_reports",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "ix_ee_issues_status_priority",
                table: "employee_experience_issue_reports",
                columns: new[] { "Status", "Priority" });

            migrationBuilder.CreateIndex(
                name: "ix_ee_kanban_lane",
                table: "employee_experience_kanban_items",
                column: "Lane");

            migrationBuilder.CreateIndex(
                name: "ix_ee_kanban_source",
                table: "employee_experience_kanban_items",
                columns: new[] { "SourceType", "SourceId" });

            migrationBuilder.CreateIndex(
                name: "ix_ee_kanban_source_type",
                table: "employee_experience_kanban_items",
                column: "SourceType");

            migrationBuilder.CreateIndex(
                name: "ix_ee_learning_career_plan_id",
                table: "employee_experience_learning_recommendations",
                column: "CareerPlanId");

            migrationBuilder.CreateIndex(
                name: "ix_ee_learning_employee_id",
                table: "employee_experience_learning_recommendations",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "ix_ee_learning_status",
                table: "employee_experience_learning_recommendations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "ix_ee_notifications_created_at",
                table: "employee_experience_notifications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "ix_ee_notifications_user",
                table: "employee_experience_notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "ix_ee_notifications_user_read",
                table: "employee_experience_notifications",
                columns: new[] { "UserId", "Read" });

            migrationBuilder.CreateIndex(
                name: "ix_ee_pulse_responses_employee_id",
                table: "employee_experience_pulse_responses",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "ix_ee_pulse_responses_submitted_at",
                table: "employee_experience_pulse_responses",
                column: "SubmittedAt");

            migrationBuilder.CreateIndex(
                name: "ix_ee_pulse_responses_survey_id",
                table: "employee_experience_pulse_responses",
                column: "PulseSurveyId");

            migrationBuilder.CreateIndex(
                name: "ix_ee_pulse_themes_survey_id",
                table: "employee_experience_pulse_survey_themes",
                column: "PulseSurveyId");

            migrationBuilder.CreateIndex(
                name: "ix_ee_pulse_surveys_open_at",
                table: "employee_experience_pulse_surveys",
                column: "OpenAt");

            migrationBuilder.CreateIndex(
                name: "ix_ee_pulse_surveys_status",
                table: "employee_experience_pulse_surveys",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "ix_ee_recognitions_created_at",
                table: "employee_experience_recognitions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "ix_ee_recognitions_from",
                table: "employee_experience_recognitions",
                column: "FromEmployeeId");

            migrationBuilder.CreateIndex(
                name: "ix_ee_recognitions_to",
                table: "employee_experience_recognitions",
                column: "ToEmployeeId");

            migrationBuilder.CreateIndex(
                name: "ix_ee_self_service_employee_id",
                table: "employee_experience_self_service_requests",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "ix_ee_self_service_status",
                table: "employee_experience_self_service_requests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "ix_ee_self_service_status_priority",
                table: "employee_experience_self_service_requests",
                columns: new[] { "Status", "Priority" });

            migrationBuilder.CreateIndex(
                name: "ix_ee_self_service_type",
                table: "employee_experience_self_service_requests",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "employee_experience_career_plan_milestones");

            migrationBuilder.DropTable(
                name: "employee_experience_chat_messages");

            migrationBuilder.DropTable(
                name: "employee_experience_delay_concerns");

            migrationBuilder.DropTable(
                name: "employee_experience_issue_reports");

            migrationBuilder.DropTable(
                name: "employee_experience_kanban_items");

            migrationBuilder.DropTable(
                name: "employee_experience_learning_recommendations");

            migrationBuilder.DropTable(
                name: "employee_experience_notifications");

            migrationBuilder.DropTable(
                name: "employee_experience_pulse_responses");

            migrationBuilder.DropTable(
                name: "employee_experience_pulse_survey_themes");

            migrationBuilder.DropTable(
                name: "employee_experience_recognitions");

            migrationBuilder.DropTable(
                name: "employee_experience_self_service_requests");

            migrationBuilder.DropTable(
                name: "employee_experience_career_plans");

            migrationBuilder.DropTable(
                name: "employee_experience_pulse_surveys");
        }
    }
}
