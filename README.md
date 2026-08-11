# HR Workforce Planning & Employee Experience

HR Workforce Planning & Employee Experience is a cross-framework enterprise showcase application built with a shared ASP.NET Core Web API and three Syncfusion-powered clients: Angular, React, and Blazor.

The application demonstrates how an HR organization can bring workforce planning, hiring pipeline management, employee experience, and AI-assisted guidance into one responsive workspace. It also shows how the same enterprise experience can be delivered consistently across different frontend stacks by using Syncfusion UI components and Syncfusion Code Studio.

> This is a showcase application with deterministic sample data. It is not intended to be used as a production HR system without adding production authentication, authorization, auditing, secrets management, and operational controls.

## What the showcase includes

- HR overview command center with KPIs (headcount, open roles, engagement, retention), priority requisitions, AI insight, action plans, and activity timeline
- Workforce planning with plan, scenario, baseline / growth / constrained / risk modeling, headcount vs planned, open roles, and budget impact by function × region
- Hiring pipeline with status tabs (new → screening → interview → offer → hired → rejected), per-status counts, candidate detail, interview scheduling, and offer tracking
- Employee experience hub with six sub-tabs: self-service, feedback (pulse surveys), recognition, career plans, learning, and a personal My Board (Kanban)
- Notifications and chat panel with issue reporting and delay concern escalation
- Responsive layouts, dark mode, loading states, error handling, and accessible navigation
- Swagger/OpenAPI documentation and deterministic PostgreSQL seed data

## Technology

| Layer | Technology |
| --- | --- |
| API | ASP.NET Core Web API on .NET 10 |
| Data | Entity Framework Core 10 and PostgreSQL (Npgsql) |
| Angular client | Angular 22, TypeScript, RxJS, Signals, Syncfusion Angular UI |
| React client | React 19, TypeScript, Vite, Syncfusion React UI |
| Blazor client | Blazor on .NET 10, Syncfusion Blazor UI |
| Seed data | [Bogus](https://github.com/bchavez/Bogus) with a fixed seed for deterministic output |
| Testing | .NET test projects (xUnit + `WebApplicationFactory<Program>`) and Angular Vitest tests |

The UI implementations use Syncfusion components such as DataGrid, Charts, Kanban, Scheduler, Sidebar, Tabs, Dialogs, Inputs, DropDowns, Buttons, ProgressBar, Notifications (Toast/Spinner), and AI AssistView.

## Why Syncfusion Code Studio and UI components?

This repository is a practical proof of how [Syncfusion Code Studio](https://www.syncfusion.com/code-studio/) and the [Syncfusion component ecosystem](https://www.syncfusion.com/) can accelerate component-rich enterprise development.

- Code Studio can help teams plan features, generate and refine code, debug issues, and create tests with awareness of the existing codebase.
- Production-oriented UI components reduce the amount of custom code required for advanced grids, charts, scheduling, Kanban workflows, dialogs, theming, and AI experiences.
- Similar component concepts across Angular, React, and Blazor make it easier to preserve business behavior while choosing the framework that best fits each team.
- Built-in capabilities such as filtering, grouping, paging, export, responsive rendering, accessibility, and theming help teams focus on business workflows rather than foundational UI infrastructure.

## Repository structure

```text
showcase-hr-workforce-planning-and-employee-experience/
├── webapi/                          # .NET 10 Web API
│   ├── src/
│   │   ├── HrInsights.Api/           # ASP.NET Core Web API host + controllers
│   │   ├── HrInsights.Application/    # Use-case services + DI
│   │   ├── HrInsights.Contracts/      # DTOs shared with the clients
│   │   ├── HrInsights.Domain/         # Entities, enums, common base types
│   │   ├── HrInsights.Infrastructure.Abstractions/  # Repository & service contracts
│   │   ├── HrInsights.Infrastructure.EFCore/        # EF Core 10 / Npgsql + migrations
│   │   └── HrInsights.SeedData/       # Deterministic Bogus-based seeders
│   ├── tests/                        # Unit, integration, and API tests
│   └── scripts/                      # Drop-tables helpers (csx + console)
├── angular/                          # Angular 22 client
├── react/                            # React 19 + Vite client
└── blazor/                           # Blazor on .NET 10 client

```

## Run locally

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- A current Node.js LTS release and npm
- PostgreSQL 14+ reachable on `localhost:5432`
- A valid Syncfusion license or trial where required

Create a PostgreSQL database named `HrInsights_pipeline`, then update the connection string in:

```text
webapi/src/HrInsights.Api/appsettings.json
```

Trust the local ASP.NET Core HTTPS certificate if needed:

```bash
dotnet dev-certs https --trust
```

### 1. Start the Web API

```bash
cd webapi
dotnet restore
dotnet run --project src/HrInsights.Api/HrInsights.Api.csproj
```

The API exposes:

- HTTPS — `https://localhost:59527` (Swagger UI at `/swagger`, OpenAPI at `/openapi/v1.json`)
- HTTP — `http://localhost:59528`

The development API applies EF Core migrations and refreshes the deterministic showcase data when it starts. Set `SeedDatabase` to `false` in `appsettings.json` to skip seeding.

### 2. Start a frontend

Angular:

```bash
cd angular
npm install
npm start
```

Open `http://localhost:4200`. Overview, Workforce Planning, and Hiring Pipeline use `https://localhost:59527`; Employee Experience uses `http://localhost:59528`.

React:

```bash
cd react
npm install
npm run dev
```

The React client reads `VITE_API_BASE_URL` from `.env.development` (defaults to the HTTP profile `http://localhost:59528`) and opens at `http://localhost:5173`.

Blazor:

```bash
cd blazor
dotnet run
```

Open `http://localhost:5088` (or the URL printed in the console). The `Api:BaseUrl` setting in `appsettings.json` / `appsettings.Development.json` controls which API profile is targeted.

## Pages

| Route | Page | Description |
| --- | --- | --- |
| `/` | **Overview** | HR command center: KPI cards (headcount, open roles, engagement, retention), priority requisitions, AI insight, action plans, and activity timeline. |
| `/workforce` | **Workforce Planning** | Headcount and budget scenario modeling. Pick a plan, compare baseline / growth / constrained / risk scenarios, and see current vs planned headcount, open roles, and budget impact by function × region. |
| `/hiring` | **Hiring Pipeline** | Candidate pipeline with status tabs (new → screening → interview → offer → hired → rejected), per-status counts, and the ability to schedule interviews and move/reject candidates. |
| `/experience` | **Employee Experience** | Six sub-tabs — **Self-Service**, **Feedback (pulse surveys)**, **Recognition**, **Career Plans**, **Learning**, **My Board (Kanban)** — plus a notifications and chat panel and dialogs to report issues or escalate delays. |

## API surface

Base URLs: `https://localhost:59527/api` (HTTPS profile) and `http://localhost:59528/api` (HTTP profile).

| Area | Prefix | Endpoints |
| --- | --- | --- |
| Overview | `/api/overview` | `GET /`, `/kpi`, `/kpi-cards`, `/requisitions`, `/activity-timeline`, `/ai-insights`, `/action-plans` |
| Workforce planning | `/api/workforce-planning` | `GET /plans`, `/scenarios`, `/line-items`, `/assumptions`, `/snapshots` |
| Hiring pipeline | `/api/hiring-pipeline` | `GET /requisitions`, `POST /requisitions`, `PATCH /requisitions/{id}/status`, `GET /interviews`, `POST /requisitions/{id}/interviews`, `POST /requisitions/{id}/offers`, `GET /candidates`, `GET /candidates/counts`, `PATCH /candidates/{id}/status`, `POST /candidates/{id}/reject`, `POST /interviews` |
| Employee experience | `/api/employee-experience` | self-service, pulse surveys / responses, recognitions, career plans / milestones, learning recommendations, issues, delay concerns, kanban, notifications, and chat |

The default `employeeId` falls back to the authenticated `NameIdentifier` claim, then to a hard-coded `emp_4521` (Ava Thompson) for unauthenticated demo calls.

## Build and test

```bash
# webapi
cd webapi
dotnet test HrInsights.sln

# Angular
cd ../angular
npm test
npm run build

# React
cd ../react
npm run build

# Blazor
cd ../blazor
dotnet build
```

## Resetting the local database

Two helpers live under `webapi/scripts/`:

- `DropHrInsightsTables.csx` — `dotnet script` script that drops every HrInsights application table and `__EFMigrationsHistory`, so the next `MigrateAsync()` re-creates everything from scratch.
- `DropHrInsightsTables/` — a runnable .NET 10 console alternative with the same effect.

Use these whenever you want to start from a clean schema without manually running `DROP TABLE` statements.

## Licensing

Syncfusion packages are governed by Syncfusion's licensing terms. Review the [Syncfusion licensing documentation](https://www.syncfusion.com/sales/licensing) before redistributing or deploying the applications. Publishing this source repository does not grant a license to Syncfusion products.

## Intended audience

This showcase is useful for engineering leaders, architects, product teams, and developers evaluating how a modern HR workforce planning and employee experience workspace can be implemented with a shared API and multiple enterprise web frameworks.
