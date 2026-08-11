// Hiring Pipeline Service - API integration for the Hiring Pipeline screen.
// (Mirrors src/services/hiringPipelineService.ts — same endpoints, same payload shape.)
//
// API:
//   POST   https://localhost:59527/api/hiring-pipeline/interviews
//   GET    https://localhost:59527/api/hiring-pipeline/candidates
//   GET    https://localhost:59527/api/hiring-pipeline/candidates/counts
//   PATCH  https://localhost:59527/api/hiring-pipeline/candidates/{id}/status
//   POST   https://localhost:59527/api/hiring-pipeline/candidates/{id}/reject

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  ApplicantCounts,
  ApplicantFilters,
  ApplicantStatus,
  PagedApplicants,
} from '../models/hiring-pipeline.model';

const API_BASE_URL = 'https://localhost:59527/api';

export interface ScheduleInterviewInput {
  applicationId: string;
  type: 'phone' | 'technical' | 'panel' | 'manager';
  scheduledStart: string; // ISO
  scheduledEnd: string;   // ISO
  interviewers: string[];
}

@Injectable({ providedIn: 'root' })
export class HiringPipelineService {
  private readonly http = inject(HttpClient);

  scheduleInterview(input: ScheduleInterviewInput): Observable<void> {
    return this.http.post<void>(
      `${API_BASE_URL}/hiring-pipeline/interviews`,
      input,
    );
  }

  // --- Applicant pipeline (per-requisition) -------------------------------

  /** GET /api/hiring-pipeline/candidates — paged candidate list. */
  fetchApplicants(
    filters: ApplicantFilters = {},
  ): Observable<PagedApplicants> {
    let params = new HttpParams();
    // Server contract: omit `status` when 'all' so it returns every stage.
    if (filters.status && filters.status !== 'all') {
      params = params.set('status', filters.status);
    }
    if (filters.requisitionId) {
      params = params.set('requisitionId', filters.requisitionId);
    }
    if (filters.page) {
      params = params.set('page', String(filters.page));
    }
    if (filters.pageSize) {
      params = params.set('pageSize', String(filters.pageSize));
    }
    if (filters.sort) {
      params = params.set('sort', filters.sort);
    }
    return this.http.get<PagedApplicants>(
      `${API_BASE_URL}/hiring-pipeline/candidates`,
      { params },
    );
  }

  /** GET /api/hiring-pipeline/candidates/counts — drives the tab badges. */
  fetchApplicantCounts(): Observable<ApplicantCounts> {
    return this.http.get<ApplicantCounts>(
      `${API_BASE_URL}/hiring-pipeline/candidates/counts`,
    );
  }

  /** PATCH /api/hiring-pipeline/candidates/{id}/status — drag-and-drop or context-menu "Move Stage". */
  moveApplicantStage(
    id: string,
    status: ApplicantStatus,
  ): Observable<void> {
    return this.http.patch<void>(
      `${API_BASE_URL}/hiring-pipeline/candidates/${id}/status`,
      { status },
    );
  }

  /** POST /api/hiring-pipeline/candidates/{id}/reject — context-menu "Reject". */
  rejectApplicant(id: string): Observable<void> {
    return this.http.post<void>(
      `${API_BASE_URL}/hiring-pipeline/candidates/${id}/reject`,
      null,
    );
  }
}
