# Blazor Web App — HR Workforce Planning Hub

Blazor Server (.NET 10) showcase for the HR Insights suite. Standalone Syncfusion EJ2 Blazor components, talking to the .NET backend at the `Api:BaseUrl` configured in `appsettings*.json`.

## Configuration

The HTTP base URL is wired in `Program.cs` and resolved from configuration:

| Environment | File | `Api:BaseUrl` |
| --- | --- | --- |
| Production | `appsettings.json` | `https://localhost:59527` |
| Development | `appsettings.Development.json` | `http://localhost:59528` |

All four typed HttpClient services (`OverviewService`, `WorkforcePlanningService`, `HiringPipelineService`, `EmployeeExperienceService`) share the same `BaseAddress`.

## Pages

| Route | Page | Description |
| --- | --- | --- |
| `/` | **Overview** | HR command center: KPI cards (headcount, open roles, engagement, retention), priority requisitions, AI insight, action plans, and activity timeline. |
| `/workforce` | **Workforce Planning** | Headcount & budget scenario modeling. Pick a plan, compare baseline / growth / constrained / risk scenarios, and see current vs planned headcount, open roles, and budget impact by function × region. |
| `/hiring` | **Hiring Pipeline** | Candidate pipeline with status tabs (new → screening → interview → offer → hired → rejected), per-status counts, and the ability to schedule interviews and move/reject candidates. |
| `/experience` | **Employee Experience** | Six sub-tabs — **Self-Service**, **Feedback (pulse surveys)**, **Recognition**, **Career Plans**, **Learning**, **My Board (Kanban)** — plus a notifications & chat panel and dialogs to report issues or escalate delays. |

The page shell, sidebar nav (`SfSidebar`), theme switcher, and shared loading / empty / error states live in `Components/Layout/` and `Components/Shared/`. Domain DTOs: `Components/Models/`. HTTP wiring: `Services/`.

## API Endpoints

Base URL: `Api:BaseUrl` from `appsettings*.json` (e.g. `https://localhost:59527` or `http://localhost:59528`).

### Overview — `/api/overview`

| Method | Endpoint | Response |
| --- | --- | --- |
| GET | `/api/overview` | `OverviewResponse` — `{ kpi, kpiCards[], requisitions[], activityTimeline[], aiInsight, actionPlans[] }` |

### Workforce Planning — `/api/workforce-planning`

| Method | Endpoint | Response |
| --- | --- | --- |
| GET | `/api/workforce-planning/plans` | `IReadOnlyList<WorkforcePlan>` |
| GET | `/api/workforce-planning/scenarios?planId={id}` | `IReadOnlyList<WorkforceScenario>` |
| GET | `/api/workforce-planning/line-items?scenarioId={id}` | `IReadOnlyList<WorkforceLineItem>` |

### Hiring Pipeline — `/api/hiring-pipeline`

| Method | Endpoint | Response |
| --- | --- | --- |
| GET | `/api/hiring-pipeline/candidates?status=&requisitionId=&page=&pageSize=&sort=` | `PagedApplicants` — `{ items: Applicant[], total, page, pageSize }` |
| GET | `/api/hiring-pipeline/candidates/counts` | `ApplicantCounts` — `{ all, new, screening, interview, offer, hired, rejected }` |
| PATCH | `/api/hiring-pipeline/candidates/{id}/status` | `204 No Content` |
| POST | `/api/hiring-pipeline/candidates/{id}/reject` | `204 No Content` |
| POST | `/api/hiring-pipeline/interviews` | `204 No Content` |

### Employee Experience — `/api/employee-experience`

All requests may filter by `employeeId` / `userId` / `threadId` where applicable. Current user defaults to `emp_4521` (Ava Thompson). Service methods return `Task<T>` (Async/await over `HttpClient`).

| Method | Endpoint | Response |
| --- | --- | --- |
| GET | `/self-service?employeeId=` | `IReadOnlyList<SelfServiceRequest>` |
| POST | `/self-service` | `SelfServiceRequest` |
| GET | `/pulse-surveys` | `IReadOnlyList<PulseSurvey>` |
| GET | `/pulse-responses?pulseSurveyId=` | `IReadOnlyList<PulseResponse>` |
| POST | `/pulse-responses` | `PulseResponse` |
| GET | `/recognitions` | `IReadOnlyList<Recognition>` |
| POST | `/recognitions` | `Recognition` |
| GET | `/career-plans?employeeId=` | `IReadOnlyList<CareerDevelopmentPlan>` |
| PATCH | `/career-plans/{planId}/milestones/{milestoneId}` | `CareerDevelopmentPlan` |
| GET | `/learning-recommendations?employeeId=` | `IReadOnlyList<LearningRecommendation>` |
| PATCH | `/learning-recommendations/{id}` | `LearningRecommendation` |
| GET | `/issues?reportedBy=` | `IReadOnlyList<IssueReport>` |
| POST | `/issues` | `IssueReport` |
| GET | `/delays?raisedBy=` | `IReadOnlyList<DelayConcern>` |
| POST | `/delays` | `DelayConcern` |
| GET | `/kanban` | `IReadOnlyList<KanbanItem>` |
| PATCH | `/kanban/{id}/lane` | `KanbanItem` |
| GET | `/notifications?userId=` | `IReadOnlyList<NotificationItem>` |
| PATCH | `/notifications/{id}/read` | `204 No Content` |
| PATCH | `/notifications/read-all?userId=` | `204 No Content` |
| GET | `/chat-messages?threadId=` | `IReadOnlyList<ChatMessage>` |
| POST | `/chat-messages` | `ChatMessage` |

## Local development

```bash
dotnet run --urls http://localhost:5050
```

Then open `http://localhost:5050/`. The Development override points the API at `http://localhost:59528`; in Production it points at `https://localhost:59527`.
