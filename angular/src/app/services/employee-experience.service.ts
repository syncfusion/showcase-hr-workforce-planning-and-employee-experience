// Data service for the Employee Experience tab.
// Connects to the SalesCrm .NET backend at /api/employee-experience/*
//
// All endpoints are defined in `src/datamodels/employee-experience.txt` and
// implemented in `backend/src/SalesCrm.Api/Controllers/EmployeeExperienceController.cs`.
//
// The exported method signatures are kept identical to the prior mock-based
// implementation so none of the 10 consumer components need to change.
// Methods return `Promise<T>` to match the existing `await` call sites; we wrap
// Angular's `HttpClient` (Observable) using `lastValueFrom`.

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import type {
  SelfServiceRequest,
  PulseSurvey,
  PulseResponse,
  Recognition,
  CareerDevelopmentPlan,
  LearningRecommendation,
  IssueReport,
  DelayConcern,
  KanbanItem,
  KanbanLane,
  NotificationItem,
  ChatMessage,
  MilestoneStatus,
  LearningStatus,
} from '../models/employee-experience.model';

const API_BASE = 'http://localhost:59528/api/employee-experience';

// Current user for this showcase (Ava Thompson).
// In a real deployment, the current user would be derived from the auth token
// on the server. See the data-model spec for details.
export const CURRENT_USER = {
  employeeId: 'emp_4521',
  employeeName: 'Ava Thompson',
  managerId: 'emp_4490',
};

// Helper: convert an HttpParams-style query map to HttpParams.
const toParams = (query?: Record<string, string | undefined>): HttpParams => {
  let params = new HttpParams();
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, v);
      }
    }
  }
  return params;
};

@Injectable({ providedIn: 'root' })
export class EmployeeExperienceService {
  private readonly http = inject(HttpClient);

  // =================== 1. Self-Service ===================

  getSelfServiceRequests(
    employeeId: string = CURRENT_USER.employeeId,
  ): Promise<SelfServiceRequest[]> {
    return lastValueFrom(
      this.http.get<SelfServiceRequest[]>(`${API_BASE}/self-service`, {
        params: toParams({ employeeId }),
      }),
    );
  }

  createSelfServiceRequest(
    input: Pick<SelfServiceRequest, 'type' | 'subject' | 'details' | 'priority'>,
  ): Promise<SelfServiceRequest> {
    return lastValueFrom(
      this.http.post<SelfServiceRequest>(`${API_BASE}/self-service`, input),
    );
  }

  // =================== 2. Pulse Surveys ===================

  getPulseSurveys(): Promise<PulseSurvey[]> {
    return lastValueFrom(this.http.get<PulseSurvey[]>(`${API_BASE}/pulse-surveys`));
  }

  submitPulseResponse(
    pulseSurveyId: string,
    sentiment: number,
    comment?: string | null,
  ): Promise<PulseResponse> {
    return lastValueFrom(
      this.http.post<PulseResponse>(`${API_BASE}/pulse-responses`, {
        pulseSurveyId,
        sentiment,
        comment: comment ?? null,
      }),
    );
  }

  // =================== 3. Recognition ===================

  getRecognitions(): Promise<Recognition[]> {
    return lastValueFrom(this.http.get<Recognition[]>(`${API_BASE}/recognitions`));
  }

  createRecognition(
    input: Pick<
      Recognition,
      'toEmployeeId' | 'toName' | 'type' | 'message' | 'value' | 'visibleTo'
    >,
  ): Promise<Recognition> {
    return lastValueFrom(
      this.http.post<Recognition>(`${API_BASE}/recognitions`, input),
    );
  }

  // =================== 4. Career Plans ===================

  getCareerPlans(
    employeeId: string = CURRENT_USER.employeeId,
  ): Promise<CareerDevelopmentPlan[]> {
    return lastValueFrom(
      this.http.get<CareerDevelopmentPlan[]>(`${API_BASE}/career-plans`, {
        params: toParams({ employeeId }),
      }),
    );
  }

  async updateMilestoneStatus(
    planId: string,
    milestoneId: string,
    status: MilestoneStatus,
  ): Promise<CareerDevelopmentPlan | null> {
    try {
      return await lastValueFrom(
        this.http.patch<CareerDevelopmentPlan>(
          `${API_BASE}/career-plans/${encodeURIComponent(planId)}/milestones/${encodeURIComponent(milestoneId)}`,
          { status },
        ),
      );
    } catch (err) {
      if (this.isHttpNotFound(err)) return null;
      throw err;
    }
  }

  // =================== 5. Learning ===================

  getLearningRecommendations(
    employeeId: string = CURRENT_USER.employeeId,
  ): Promise<LearningRecommendation[]> {
    return lastValueFrom(
      this.http.get<LearningRecommendation[]>(
        `${API_BASE}/learning-recommendations`,
        { params: toParams({ employeeId }) },
      ),
    );
  }

  async updateLearningStatus(
    id: string,
    status: LearningStatus,
  ): Promise<LearningRecommendation | null> {
    try {
      return await lastValueFrom(
        this.http.patch<LearningRecommendation>(
          `${API_BASE}/learning-recommendations/${encodeURIComponent(id)}`,
          { status },
        ),
      );
    } catch (err) {
      if (this.isHttpNotFound(err)) return null;
      throw err;
    }
  }

  // =================== 6. Issues ===================

  createIssueReport(
    input: Pick<
      IssueReport,
      'category' | 'subject' | 'description' | 'url' | 'browser' | 'priority'
    >,
  ): Promise<IssueReport> {
    return lastValueFrom(
      this.http.post<IssueReport>(`${API_BASE}/issues`, input),
    );
  }

  // =================== 7. Delays ===================

  createDelayConcern(
    input: Pick<
      DelayConcern,
      | 'relatedEntityType'
      | 'relatedEntityId'
      | 'subject'
      | 'details'
      | 'daysWaiting'
      | 'expectedSlackDays'
      | 'severity'
    >,
  ): Promise<DelayConcern> {
    return lastValueFrom(
      this.http.post<DelayConcern>(`${API_BASE}/delays`, input),
    );
  }

  // =================== 8. Kanban ===================

  getKanbanItems(): Promise<KanbanItem[]> {
    return lastValueFrom(this.http.get<KanbanItem[]>(`${API_BASE}/kanban`));
  }

  async moveKanbanItem(
    id: string,
    lane: KanbanLane,
  ): Promise<KanbanItem | null> {
    try {
      return await lastValueFrom(
        this.http.patch<KanbanItem>(
          `${API_BASE}/kanban/${encodeURIComponent(id)}/lane`,
          { lane },
        ),
      );
    } catch (err) {
      if (this.isHttpNotFound(err)) return null;
      throw err;
    }
  }

  // =================== 9. Notifications ===================

  getNotifications(
    userId: string = CURRENT_USER.employeeId,
  ): Promise<NotificationItem[]> {
    return lastValueFrom(
      this.http.get<NotificationItem[]>(`${API_BASE}/notifications`, {
        params: toParams({ userId }),
      }),
    );
  }

  async markNotificationRead(id: string): Promise<void> {
    await lastValueFrom(
      this.http.patch(
        `${API_BASE}/notifications/${encodeURIComponent(id)}/read`,
        null,
        { observe: 'response', responseType: 'text' },
      ),
    );
  }

  async markAllNotificationsRead(
    userId: string = CURRENT_USER.employeeId,
  ): Promise<void> {
    await lastValueFrom(
      this.http.patch(`${API_BASE}/notifications/read-all`, null, {
        params: toParams({ userId }),
        observe: 'response',
        responseType: 'text',
      }),
    );
  }

  // =================== 10. Chat ===================

  getChatMessages(threadId: string): Promise<ChatMessage[]> {
    return lastValueFrom(
      this.http.get<ChatMessage[]>(`${API_BASE}/chat-messages`, {
        params: toParams({ threadId }),
      }),
    );
  }

  sendChatMessage(
    threadId: string,
    body: string,
    toId: string | null = null,
  ): Promise<ChatMessage> {
    return lastValueFrom(
      this.http.post<ChatMessage>(`${API_BASE}/chat-messages`, {
        threadId,
        body,
        toId,
      }),
    );
  }

  // =================== Internals ===================

  private isHttpNotFound(err: unknown): boolean {
    // `HttpErrorResponse` exposes `status`; we only need to discriminate 404.
    return !!err && typeof err === 'object' && (err as { status?: number }).status === 404;
  }
}
