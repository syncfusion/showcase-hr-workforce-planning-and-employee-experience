import { Routes } from '@angular/router';
import { OverviewComponent } from './screens/overview/overview.component';
import { WorkforcePlanningComponent } from './screens/workforce-planning/workforce-planning.component';
import { HiringPipelineComponent } from './screens/hiring-pipeline/hiring-pipeline.component';
import { EmployeeExperienceComponent } from './screens/employee-experience/employee-experience.component';

/**
 * Top-level routes. The `<app-layout>` shell (in app.ts) renders the
 * navigation sidebar around the routed outlet, so each route only needs to
 * provide the screen component.
 *
 * Components are imported directly (no `loadComponent`) to match the
 * Overview pattern and avoid the Angular build failing on a dynamic
 * import whose target is not yet ported. Each screen below is a
 * placeholder; the matching OpenSpec change tracks the full port from
 * the React `src/screens/*` trees.
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OverviewComponent,
    title: 'Overview · HR Insights',
  },
  {
    path: 'workforce',
    component: WorkforcePlanningComponent,
    title: 'Workforce Planning · HR Insights',
  },
  {
    path: 'hiring',
    // Ported from src/screens/HiringPipeline
    component: HiringPipelineComponent,
    title: 'Hiring Pipeline · HR Insights',
  },
  {
    path: 'experience',
    // TODO: port from src/screens/EmployeeExperience
    component: EmployeeExperienceComponent,
    title: 'Employee Experience · HR Insights',
  },
  { path: '**', redirectTo: '' },
];
