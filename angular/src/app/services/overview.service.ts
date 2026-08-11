// Overview Service - API integration for the Overview screen
// (Mirrors src/services/overviewService.ts — same endpoint, same response shape.)

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  KpiData,
  ActiveRequisition,
  ActivityTimelineEvent,
  AiInsight,
  ActionPlan,
} from '../models/overview.model';

export interface OverviewResponse {
  kpi: KpiData;
  kpiCards: {
    title: string;
    value: string;
    change: number;
    trendData: { x: number; yval: number }[];
    context: string;
    showProgress?: boolean;
    progressValue?: number;
    target?: number;
    color: string;
  }[];
  requisitions: ActiveRequisition[];
  activityTimeline: ActivityTimelineEvent[];
  aiInsight: AiInsight;
  actionPlans: ActionPlan[];
}

const API_BASE_URL = 'https://localhost:59527';

@Injectable({ providedIn: 'root' })
export class OverviewService {
  private readonly http = inject(HttpClient);

  fetchOverview(): Observable<OverviewResponse> {
    return this.http.get<OverviewResponse>(`${API_BASE_URL}/api/overview`);
  }

  // POST /api/overview/employee/{id}/generate-insight
  // Returns the generated insight on success, or throws on non-2xx (the
  // caller is expected to fall back to a cached/seeded insight on failure).
  generateAiInsight(employeeId: string): Observable<AiInsight> {
    return this.http.post<AiInsight>(
      `${API_BASE_URL}/api/overview/employee/${encodeURIComponent(employeeId)}/generate-insight`,
      {},
    );
  }
}
