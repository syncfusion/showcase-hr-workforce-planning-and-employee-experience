# Angular — HR Workforce Planning Hub

Angular 22 showcase for the HR Insights suite. Standalone components + Signals + Syncfusion EJ2 Angular widgets, talking to the .NET backend. `Overview`, `Workforce Planning`, and `Hiring Pipeline` hit the API on `https://localhost:59527`; `Employee Experience` hits `http://localhost:59528`.

## Pages

| Route | Page | Description |
| --- | --- | --- |
| `/` | **Overview** | HR command center: KPI cards (headcount, open roles, engagement, retention), priority requisitions, AI insight, action plans, and activity timeline. |
| `/workforce` | **Workforce Planning** | Headcount & budget scenario modeling. Pick a plan, compare baseline / growth / constrained / risk scenarios, and see current vs planned headcount, open roles, and budget impact by function × region. |
| `/hiring` | **Hiring Pipeline** | Candidate pipeline with status tabs (new → screening → interview → offer → hired → rejected), per-status counts, and the ability to schedule interviews and move/reject candidates. |
| `/experience` | **Employee Experience** | Six sub-tabs — **Self-Service**, **Feedback (pulse surveys)**, **Recognition**, **Career Plans**, **Learning**, **My Board (Kanban)** — plus a notifications & chat panel and dialogs to report issues or escalate delays. |

The page shell, sidebar navigation, theme switcher, and shared loading / empty / error states live in `src/app/components/`. Domain models: `src/app/models/`. HTTP wiring: `src/app/services/`.

## API Endpoints

Base URLs:
- `https://localhost:59527/api` — Overview, Workforce Planning, Hiring Pipeline
- `http://localhost:59528/api` — Employee Experience

### Overview — `/api/overview`

| Method | Endpoint | Response |
| --- | --- | --- |
| GET | `/api/overview` | `OverviewResponse` — `{ kpi, kpiCards[], requisitions[], activityTimeline[], aiInsight, actionPlans[] }` |

### Workforce Planning — `/api/workforce-planning`

| Method | Endpoint | Response |
| --- | --- | --- |
| GET | `/api/workforce-planning/plans` | `WorkforcePlan[]` |
| GET | `/api/workforce-planning/scenarios?planId={id}` | `WorkforceScenario[]` |
| GET | `/api/workforce-planning/line-items?scenarioId={id}` | `WorkforceLineItem[]` |

### Hiring Pipeline — `/api/hiring-pipeline`

| Method | Endpoint | Response |
| --- | --- | --- |
| GET | `/api/hiring-pipeline/candidates?status=&requisitionId=&page=&pageSize=&sort=` | `PagedApplicants` — `{ items: Applicant[], total, page, pageSize }` |
| GET | `/api/hiring-pipeline/candidates/counts` | `ApplicantCounts` — `{ all, new, screening, interview, offer, hired, rejected }` |
| PATCH | `/api/hiring-pipeline/candidates/{id}/status` | `204 No Content` |
| POST | `/api/hiring-pipeline/candidates/{id}/reject` | `204 No Content` |
| POST | `/api/hiring-pipeline/interviews` | `204 No Content` |

### Employee Experience — `/api/employee-experience`

All requests may filter by `employeeId` / `userId` / `threadId` where applicable. Current user defaults to `emp_4521` (Ava Thompson). Service methods return `Promise<T>` (HttpClient wrapped with `lastValueFrom`).

| Method | Endpoint | Response |
| --- | --- | --- |
| GET | `/self-service?employeeId=` | `SelfServiceRequest[]` |
| POST | `/self-service` | `SelfServiceRequest` |
| GET | `/pulse-surveys` | `PulseSurvey[]` |
| POST | `/pulse-responses` | `PulseResponse` |
| GET | `/recognitions` | `Recognition[]` |
| POST | `/recognitions` | `Recognition` |
| GET | `/career-plans?employeeId=` | `CareerDevelopmentPlan[]` |
| PATCH | `/career-plans/{planId}/milestones/{milestoneId}` | `CareerDevelopmentPlan` |
| GET | `/learning-recommendations?employeeId=` | `LearningRecommendation[]` |
| PATCH | `/learning-recommendations/{id}` | `LearningRecommendation` |
| POST | `/issues` | `IssueReport` |
| POST | `/delays` | `DelayConcern` |
| GET | `/kanban` | `KanbanItem[]` |
| PATCH | `/kanban/{id}/lane` | `KanbanItem` |
| GET | `/notifications?userId=` | `NotificationItem[]` |
| PATCH | `/notifications/{id}/read` | `204 No Content` |
| PATCH | `/notifications/read-all?userId=` | `204 No Content` |
| GET | `/chat-messages?threadId=` | `ChatMessage[]` |
| POST | `/chat-messages` | `ChatMessage` |

---

## Original template notes

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
