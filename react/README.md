# React + TypeScript + Vite — HR Workforce Planning Hub

Front-end showcase for the HR Insights suite. React 19 + Vite + Syncfusion EJ2 widgets, talking to the .NET backend at `http://localhost:59528`.

## Pages

| Route | Page | Description |
| --- | --- | --- |
| `/` | **Overview** | HR command center: KPI cards (headcount, open roles, engagement, retention), priority requisitions, AI insight, action plans, and activity timeline. |
| `/workforce` | **Workforce Planning** | Headcount & budget scenario modeling. Pick a plan, compare baseline / growth / constrained / risk scenarios, and see current vs planned headcount, open roles, and budget impact by function × region. |
| `/hiring` | **Hiring Pipeline** | Candidate pipeline with status tabs (new → screening → interview → offer → hired → rejected), per-status counts, and the ability to schedule interviews and move/reject candidates. |
| `/experience` | **Employee Experience** | Six sub-tabs — **Self-Service**, **Feedback (pulse surveys)**, **Recognition**, **Career Plans**, **Learning**, **My Board (Kanban)** — plus a notifications & chat panel and dialogs to report issues or escalate delays. |

The page shell, sidebar navigation, and shared loading / empty / error states live in `src/components/`.

## API Endpoints

Base URL: `http://localhost:59528/api`

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

All requests may filter by `employeeId` / `userId` / `threadId` where applicable. Current user defaults to `emp_4521` (Ava Thompson).

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

Full type definitions: [src/types/index.ts](src/types/index.ts). Per-screen spec sheets: [src/datamodels/](src/datamodels/).

---

## Original template notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],

    ## Research-first Changes (OpenSpec)

    Before proposing a feature, optionally capture research to guide proposal/design/tasks:

    - Optional: Use the `openspec-research` skill to generate a `research.md` in your change folder. It captures primary use case, industry, personas, data model, Gherkin acceptance criteria, realistic mock data (with relationships and edge cases), modular architecture plan, and accessibility basics (labels, keyboard flow, focus, color contrast awareness, empty/loading/error states).
    - Then run the proposal flow to generate `proposal.md`, `design.md`, and `tasks.md`. The propose step will read `research.md` if present and enforce coverage of the above aspects across all artifacts.

    See `openspec/specs/research-guide.md` for a checklist and a copyable template.
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
