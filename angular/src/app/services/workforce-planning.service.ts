// Workforce Planning Service - API integration for the Workforce Planning screen.
// (Mirrors src/services/workforcePlanningService.ts — same endpoints, same payload shape.)
//
// API:
//   GET https://localhost:59527/api/workforce-planning/plans
//   GET https://localhost:59527/api/workforce-planning/scenarios?planId=<id>
//   GET https://localhost:59527/api/workforce-planning/line-items?scenarioId=<id>

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  WorkforcePlan,
  WorkforceScenario,
  WorkforceLineItem,
} from '../models/workforce-planning.model';

const API_BASE_URL = 'https://localhost:59527/api';

@Injectable({ providedIn: 'root' })
export class WorkforcePlanningService {
  private readonly http = inject(HttpClient);

  getPlans(): Observable<WorkforcePlan[]> {
    return this.http.get<WorkforcePlan[]>(`${API_BASE_URL}/workforce-planning/plans`);
  }

  getScenarios(planId?: string): Observable<WorkforceScenario[]> {
    let params = new HttpParams();
    if (planId) {
      params = params.set('planId', planId);
    }
    return this.http.get<WorkforceScenario[]>(
      `${API_BASE_URL}/workforce-planning/scenarios`,
      { params },
    );
  }

  getLineItems(scenarioId?: string): Observable<WorkforceLineItem[]> {
    let params = new HttpParams();
    if (scenarioId) {
      params = params.set('scenarioId', scenarioId);
    }
    return this.http.get<WorkforceLineItem[]>(
      `${API_BASE_URL}/workforce-planning/line-items`,
      { params },
    );
  }
}
