# HrInsights Backend

The .NET 10 backend for the **HR Workforce Planning & Employee Experience** showcase. It exposes a single ASP.NET Core Web API that powers the Angular, React, and Blazor front-ends with realistic, seeded data for four capability areas: **Overview**, **Workforce Planning**, **Hiring Pipeline**, and **Employee Experience**.

---

## Table of contents

- [Solution layout](#solution-layout)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Domain model](#domain-model)
- [HTTP API surface](#http-api-surface)
- [Data seeding](#data-seeding)
- [Database & EF Core migrations](#database--ef-core-migrations)
- [Configuration](#configuration)
- [Running the API](#running-the-api)
- [Authentication](#authentication)
- [CORS](#cors)
- [Testing](#testing)
- [Utility scripts](#utility-scripts)
- [Project conventions](#project-conventions)

---

## Solution layout

```
backend/
├── HrInsights.sln
├── README.md
├── scripts/
│   ├── DropHrInsightsTables.csx                      # dotnet-script one-shot reset
│   └── DropHrInsightsTables/                         # runnable .NET console equivalent
│       ├── DropHrInsightsTables.csproj
│       └── Program.cs
├── src/
│   ├── HrInsights.Api/                               # ASP.NET Core Web API host
│   │   ├── Controllers/                              # 4 feature controllers
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── appsettings.Development.json
│   ├── HrInsights.Application/                       # Use-case services + DI
│   │   ├── Services/
│   │   │   ├── OverviewService.cs
│   │   │   ├── WorkforcePlanningService.cs
│   │   │   ├── HiringPipelineService.cs
│   │   │   ├── EmployeeExperienceService.cs
│   │   │   └── EmployeeExperienceMappings.cs
│   │   └── DependencyInjection.cs
│   ├── HrInsights.Contracts/                         # DTOs shared with clients
│   │   ├── Dashboard/
│   │   ├── EmployeeExperience/
│   │   ├── HiringPipeline/
│   │   └── WorkforcePlanning/
│   ├── HrInsights.Domain/                            # Entities, enums, common base classes
│   │   ├── Common/
│   │   ├── Entities/
│   │   └── Enums/
│   ├── HrInsights.Infrastructure.Abstractions/       # Cross-cutting contracts
│   │   ├── Repositories/                             # IRepository, IReadRepository, IUnitOfWork, ...
│   │   └── Services/                                 # IDateTimeProvider, ICurrentUserService, ICrmSeedDataGenerator
│   ├── HrInsights.Infrastructure.EFCore/             # EF Core 10 / Npgsql implementation
│   │   ├── Configurations/                           # IEntityTypeConfiguration<> per entity
│   │   ├── Migrations/                               # EF Core migrations
│   │   ├── Persistence/                              # DbContext, design-time factory
│   │   ├── Repositories/                             # EFRepository, EFReadRepository, UnitOfWork
│   │   ├── Services/                                 # CrmSeedDataGenerator
│   │   └── DependencyInjection.cs
│   └── HrInsights.SeedData/                          # Deterministic Bogus-based seeders
│       ├── DatabaseSeeder.cs
│       ├── CrmSeedData.cs / CrmSeedOptions.cs
│       ├── DeterministicIds.cs
│       ├── Overview*SeedGenerator.cs / OverviewBogusGenerator.cs
│       ├── WorkforcePlanning*SeedGenerator.cs / WorkforcePlanningBogusGenerator.cs
│       ├── HiringPipeline*SeedGenerator.cs / HiringPipelineBogusGenerator.cs
│       ├── CandidateSeedGenerator.cs
│       ├── EmployeeExperience*SeedGenerator.cs / EmployeeExperienceBogusGenerator.cs
│       └── LookupJsonLoader.cs
└── tests/
    ├── HrInsights.UnitTests/                         # Domain + application unit tests
    ├── HrInsights.IntegrationTests/                  # End-to-end DB/API integration tests
    └── HrInsights.ApiTests/                          # WebApplicationFactory HTTP tests
```

---

## Technology stack

| Concern | Choice |
| --- | --- |
| Runtime | .NET 10 (`net10.0`) |
| Web framework | ASP.NET Core 10 (controllers, OpenAPI, ProblemDetails) |
| ORM | EF Core 10 with `Npgsql.EntityFrameworkCore.PostgreSQL` 10 |
| Database | PostgreSQL |
| Validation | `ProblemDetails` + `ModelState` (configured in `Program.cs`) |
| API docs | `Microsoft.AspNetCore.OpenApi` (`MapOpenApi`) |
| Test runtime | xUnit + `WebApplicationFactory<Program>` |
| Seed data | [Bogus](https://github.com/bchavez/Bogus) 35.6.5 with a fixed seed (`20260617`) |
| Auth | Bearer scheme + demo handler that always succeeds when an `Authorization` header is present |

---

## Architecture

The solution follows a layered, dependency-inverted design:

```
   ┌──────────────────────────────────────────────┐
   │            HrInsights.Api (Web)              │  Controllers, middleware, DI wiring
   └──────────────┬───────────────────────────────┘
                  │
   ┌──────────────▼───────────────────────────────┐
   │      HrInsights.Application (Use cases)      │  Service interfaces + orchestration
   └──────────────┬───────────────────────────────┘
                  │
   ┌──────────────▼───────────────────────────────┐
   │ HrInsights.Infrastructure.EFCore (Adapters)  │  EF Core DbContext, repositories, seeder
   └──────────────┬───────────────────────────────┘
                  │
   ┌──────────────▼───────────────────────────────┐
   │ HrInsights.Infrastructure.Abstractions       │  Repository / service contracts
   └──────────────┬───────────────────────────────┘
                  │
   ┌──────────────▼───────────────────────────────┐
   │   HrInsights.Domain   │   HrInsights.Contracts│  Entities & shared DTOs
   └──────────────────────────────────────────────┘
```

- `Domain` and `Contracts` have **no** external dependencies.
- `Application` depends on `Domain`, `Contracts`, `Infrastructure.Abstractions`, and `SeedData`.
- `Infrastructure.EFCore` depends on `Application`, `Domain`, and `Infrastructure.Abstractions`; it implements the repository / unit-of-work contracts and hosts the EF Core `DbContext` + migrations.
- `Api` composes the layers via `AddHrInsightsApplication()` and `AddHrInsightsInfrastructureEfCore(configuration)`.

---

## Domain model

`HrInsights.Domain` groups entities and enums by capability:

| Area | Entities | Enums |
| --- | --- | --- |
| Overview | `KpiSnapshot`, `KpiCard`, `OverviewRequisition`, `ActivityTimelineEvent`, `OverviewAiInsight`, `OverviewActionPlan` | — |
| Workforce planning | `WorkforcePlan`, `WorkforceScenario`, `WorkforceLineItem`, `ScenarioAssumption`, `PlanningSnapshot` | — |
| Hiring pipeline | `Requisition`, `RequisitionInterview`, `RequisitionOffer`, `Candidate` | `HiringPipelineStatus`, `HiringPipelinePriority`, `CandidateStatus` |
| Employee experience | `SelfServiceRequest`, `PulseSurvey`, `PulseResponse`, `PulseThemeSentiment`, `Recognition`, `CareerDevelopmentPlan`, `CareerMilestone`, `LearningRecommendation`, `IssueReport`, `DelayConcern`, `KanbanItem`, `NotificationItem`, `ChatMessage` | `SelfServiceRequestStatus`, `SelfServiceRequestPriority`, `PulseSurveyStatus`, `PulseSurveyCadence`, `CareerPlanStatus`, `CareerHorizon`, `MilestoneStatus`, `LearningFormat`, `LearningRecommendationStatus`, `IssueReportStatus`, `IssueReportPriority`, `DelayConcernStatus`, `DelayConcernSeverity`, `KanbanLane`, `KanbanPriority` |

Common base types live in `Domain/Common`:
- `EntityBase` — primary-key + audit fields.
- `AuditableEntity` — adds created/updated timestamps.

---

## HTTP API surface

All routes are JSON, version-free, and grouped under `/api/`. The OpenAPI document is exposed at `/openapi/v1.json` (and the Swagger UI in Development) via `MapOpenApi()`.

### Overview — `OverviewController` (`/api/overview`)

| Method | Route | Returns |
| --- | --- | --- |
| `GET` | `/` | `OverviewResponse` (KPI + cards + requisitions + timeline) |
| `GET` | `/kpi` | `KpiDto` |
| `GET` | `/kpi-cards` | `IReadOnlyList<KpiCardDto>` |
| `GET` | `/requisitions` | `IReadOnlyList<ActiveRequisitionDto>` |
| `GET` | `/activity-timeline` | `IReadOnlyList<ActivityTimelineEventDto>` |
| `GET` | `/ai-insights` | AI insight + action steps |
| `GET` | `/action-plans` | `IReadOnlyList<OverviewActionPlanDto>` |

### Workforce planning — `WorkforcePlanningController` (`/api/workforce-planning`)

| Method | Route | Returns |
| --- | --- | --- |
| `GET` | `/plans` | `IReadOnlyList<WorkforcePlanDto>` |
| `GET` | `/scenarios?planId=` | `IReadOnlyList<WorkforceScenarioDto>` |
| `GET` | `/line-items?scenarioId=` | `IReadOnlyList<WorkforceLineItemDto>` |
| `GET` | `/assumptions?scenarioId=` | `IReadOnlyList<ScenarioAssumptionDto>` |
| `GET` | `/snapshots?planId=` | `IReadOnlyList<PlanningSnapshotDto>` |

### Hiring pipeline — `HiringPipelineController` (`/api/hiring-pipeline`)

| Method | Route | Returns |
| --- | --- | --- |
| `GET` | `/requisitions?department=&location=&priority=` | `IReadOnlyList<RequisitionDto>` |
| `POST` | `/requisitions` | `201 Created` with `RequisitionDto` |
| `PATCH` | `/requisitions/{id}/status` | `204` / `404` |
| `GET` | `/interviews?requisitionId=` | `IReadOnlyList<InterviewDto>` |
| `POST` | `/requisitions/{id}/interviews` | Schedules an interview |
| `POST` | `/requisitions/{id}/offers` | Records an offer |
| `GET` | `/candidates` | `IReadOnlyList<CandidateDto>` |

### Employee experience — `EmployeeExperienceController` (`/api/employee-experience`)

| Method | Route | Returns |
| --- | --- | --- |
| `GET` | `/self-service?employeeId=` | `IReadOnlyList<SelfServiceRequestDto>` |
| `POST` | `/self-service` | Creates a request |
| `GET` | `/pulse/surveys` | `IReadOnlyList<PulseSurveyDto>` |
| `POST` | `/pulse/responses` | Records a pulse response |
| `GET` | `/recognitions?employeeId=` | `IReadOnlyList<RecognitionDto>` |
| `POST` | `/recognitions` | Creates a recognition |
| `GET` | `/career/plans?employeeId=` | Career plan + milestones |
| `PATCH` | `/career/milestones/{id}` | Updates a milestone |
| `GET` | `/learning/recommendations?employeeId=` | `IReadOnlyList<LearningRecommendationDto>` |
| `PATCH` | `/learning/recommendations/{id}` | Updates a learning item |
| `GET` | `/issues?employeeId=` | `IReadOnlyList<IssueReportDto>` |
| `POST` | `/issues` | Files an issue |
| `GET` | `/delays?employeeId=` | `IReadOnlyList<DelayConcernDto>` |
| `POST` | `/delays` | Files a delay concern |
| `GET` | `/kanban?employeeId=` | `IReadOnlyList<KanbanItemDto>` |
| `PATCH` | `/kanban/{id}/lane` | Moves a kanban item |
| `GET` | `/notifications?employeeId=` | `IReadOnlyList<NotificationItemDto>` |
| `GET` | `/chat?employeeId=&peerId=` | `IReadOnlyList<ChatMessageDto>` |
| `POST` | `/chat` | Sends a chat message |

> The default `employeeId` falls back to the authenticated `NameIdentifier` claim, then to a hard-coded `emp_4521` for unauthenticated demo calls.

---

## Data seeding

Seeding is deterministic so every front-end screenshot stays stable:

- A single seed value is configured via `CrmSeedOptions { Seed = 20260617 }`.
- The Bogus generators under `src/HrInsights.SeedData` (`OverviewBogusGenerator`, `WorkforcePlanningBogusGenerator`, `HiringPipelineBogusGenerator`, `EmployeeExperienceBogusGenerator`) and the `*SeedGenerator` orchestrators produce all the data needed to render the showcase.
- `DatabaseSeeder.Generate()` produces a `CrmSeedData` aggregate containing:
  - Overview: KPI snapshot, KPI cards, requisitions, activity timeline, AI insight, action plans.
  - Workforce planning: plans, scenarios, line items, scenario assumptions, planning snapshots.
  - Hiring pipeline: requisitions, interviews, offers, candidates.
  - Employee experience: self-service requests, pulse surveys + responses + theme sentiments, recognitions, career plans + milestones, learning recommendations, issues, delay concerns, kanban items, notifications, chat messages.
- `CrmSeedDataGenerator` (registered as `ICrmSeedDataGenerator`) persists the data via repositories when the API starts.
- Lookups are loaded from JSON via `LookupJsonLoader` for stable, locale-appropriate text.

Seeding runs automatically on startup when the `SeedDatabase` configuration value is `true` (the default in `Development`). Disable it in production by setting `SeedDatabase` to `false`.

---

## Database & EF Core migrations

- Connection string key: `HrInsightsDatabase` (Npgsql format).
- The `HrInsightsDbContext` is registered with `AddDbContext` in `Infrastructure.EFCore.DependencyInjection`.
- `Program.cs` calls `db.Database.MigrateAsync()` at startup, then optionally runs the seeder.
- Migrations live under `src/HrInsights.Infrastructure.EFCore/Migrations`:
  - `20260708071315_InitialCreate`
  - `20260710095927_AddHiringPipelineCandidates`
  - `20260713124633_StartnewHR`
  - `20260716065928_AddEmployeeExperience`

### Entity Framework Core CLI

The solution uses the [`dotnet-ef`](https://learn.microsoft.com/ef/core/cli/dotnet) global tool. Install it once per machine, then run all `dotnet ef` commands from the **repository root** (`backend/`) — pass `--project` and `--startup-project` so the tool can locate the EF Core project and the API host.

```powershell
# 1. Install (or update) the global tool — once per machine
dotnet tool install -g dotnet-ef
# dotnet tool update -g dotnet-ef   # use this if it is already installed

# 2. Create a new migration (run from the backend/ folder)
dotnet ef migrations add StartnewHR `
  --project src/HrInsights.Infrastructure.EFCore/HrInsights.Infrastructure.EFCore.csproj `
  --startup-project src/HrInsights.Api/HrInsights.Api.csproj

# 3. Apply migrations to the database configured in appsettings.json
dotnet ef database update `
  --project src/HrInsights.Infrastructure.EFCore/HrInsights.Infrastructure.EFCore.csproj `
  --startup-project src/HrInsights.Api/HrInsights.Api.csproj
```

Short form (uses the project names directly because the working directory already resolves them):

```powershell
dotnet tool install -g dotnet-ef

dotnet ef migrations add StartnewHR --project HrInsights.Infrastructure.EFCore --startup-project HrInsights.Api

dotnet ef database update --project HrInsights.Infrastructure.EFCore --startup-project HrInsights.Api
```

> A design-time factory (`SalesCrmDesignTimeDbContextFactory`) is included so `dotnet ef` works without launching the API.
>
> Tip: the API also calls `db.Database.MigrateAsync()` at startup, so running the API is enough in most cases — use the CLI when you need to script migrations or apply them to a non-development environment.

---

## Configuration

Configuration is loaded from `appsettings.json` + `appsettings.{Environment}.json` + environment variables, in that order.

| Key | Purpose | Default |
| --- | --- | --- |
| `ConnectionStrings:HrInsightsDatabase` | PostgreSQL connection string used by EF Core | `Host=localhost;Port=5432;Database=HrInsights_pipeline;Username=postgres;Password=Syncfusion@123;Include Error Detail=true;` |
| `SeedDatabase` | When `true`, the API runs `ICrmSeedDataGenerator.GenerateAsync()` after migrations | `true` in `Development`, override explicitly in other environments |

> **Do not commit production credentials.** The default password is suitable for local development only.

---

## Running the API

### Prerequisites

- .NET 10 SDK
- PostgreSQL 14+ reachable on `localhost:5432` (database `HrInsights_pipeline`, user `postgres`).

### Build everything

```powershell
cd "d:\Showcase app\hr-workforce planning-and-employee-experience\backend"
dotnet build HrInsights.sln
```

### Run the API

```powershell
dotnet run --project src/HrInsights.Api/HrInsights.Api.csproj
```

The default `launchSettings.json` exposes:

- HTTPS — `https://localhost:59527`
- HTTP — `http://localhost:59528`

Override the port with `--urls` if needed:

```powershell
dotnet run --project src/HrInsights.Api --urls http://localhost:5050
```

The first request will trigger EF Core migrations and the seeder, which can take a few seconds.

### Quick smoke test

```powershell
curl http://localhost:59528/api/overview/kpi
curl http://localhost:59528/api/hiring-pipeline/requisitions
curl http://localhost:59528/api/workforce-planning/plans
curl "http://localhost:59528/api/employee-experience/self-service?employeeId=emp_4521"
```

---

## Authentication

The API uses a **demo** authentication handler:

- A `Bearer` authentication scheme is registered in `Program.cs`.
- `DemoAuthenticationHandler` succeeds whenever an `Authorization` header is present, attaching a `demo-user` identity with the `crm.read` role.
- Unauthenticated requests are allowed but treated as the default showcase identity (`emp_4521`) by the employee-experience controller.

Swap `DemoAuthenticationHandler` for a real JWT / OAuth scheme before going to production.

---

## CORS

`Program.cs` defines a single named policy `AllowReactApp` that allows credentials and any header/method from these local front-end origins:

| Port | Frameworks |
| --- | --- |
| 5173 / 5174 / 5175 | Vite (React) |
| 4200 | Angular CLI |
| 5197 | Blazor Web App |

Add or remove origins here when wiring a new deployment target.

---

## Testing

Three test projects live under `tests/`:

| Project | Purpose |
| --- | --- |
| `HrInsights.UnitTests` | Pure unit tests for domain + application services (no I/O). |
| `HrInsights.IntegrationTests` | End-to-end tests against a real PostgreSQL test database. |
| `HrInsights.ApiTests` | HTTP-level tests built on `WebApplicationFactory<Program>`. |

Run them all:

```powershell
dotnet test HrInsights.sln
```

Run a single project:

```powershell
dotnet test tests/HrInsights.UnitTests/HrInsights.UnitTests.csproj
```

---

## Utility scripts

- `scripts/DropHrInsightsTables.csx` — `dotnet script` script that drops every HrInsights application table and `__EFMigrationsHistory`, so the next `MigrateAsync()` re-creates everything from scratch.

  ```powershell
  dotnet script scripts/DropHrInsightsTables.csx
  ```

- `scripts/DropHrInsightsTables/` — a runnable .NET 10 console alternative with the same effect:

  ```powershell
  dotnet run --project scripts/DropHrInsightsTables [databaseName]
  ```

Use these whenever you want to start from a clean schema without manually running `DROP TABLE` statements.

---

## Project conventions

- **Nullable reference types** are enabled across every project.
- **Implicit usings** are enabled in every `.csproj`.
- Controllers are sealed and tagged with `[Tags("Area")]` for nicer OpenAPI grouping.
- DTOs live in `HrInsights.Contracts`, entities live in `HrInsights.Domain`; services never expose entity types to controllers.
- `EmployeeExperienceMappings` centralises entity-to-DTO mapping for the largest feature surface.
- The `*SeedGenerator` classes orchestrate; the `*BogusGenerator` classes produce individual records. Both are deterministic thanks to a fixed `CrmSeedOptions.Seed`.
- The `HrInsightsDbContext` is exposed only through `IRepository<,>`, `IReadRepository<,>`, and `IUnitOfWork` from `HrInsights.Infrastructure.Abstractions`.

---

## License & support

This backend is part of the Syncfusion showcase collection. It is intended for demo and evaluation purposes. See the repository root [`README.md`](../README.md) for licensing, support, and contribution guidelines.
