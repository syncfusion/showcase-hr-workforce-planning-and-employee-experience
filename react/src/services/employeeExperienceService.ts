import type {
  SelfServiceRequest,
  PulseSurvey,
  Recognition,
  CareerDevelopmentPlan,
  CareerMilestone,
  LearningRecommendation,
  IssueReport,
  DelayConcern,
  KanbanItem,
  KanbanLane,
  NotificationItem,
  ChatMessage,
} from '../types';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/employee-experience`;

// Current user for this showcase (Ava Thompson).
// In a real deployment, the current user would be derived from the auth token
// on the server. See the data-model spec for details.
export const CURRENT_USER = {
  employeeId: 'emp_4521',
  employeeName: 'Ava Thompson',
  managerId: 'emp_4490',
};

// ── HTTP helpers ─────────────────────────────────────────────────────────

class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }
}

const buildUrl = (path: string, query?: Record<string, string | undefined>): string => {
  const url = new URL(`${API_BASE}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, v);
    }
  }
  return url.toString();
};

const request = async <T>(input: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(input, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      /* ignore body read errors */
    }
    throw new HttpError(
      `Request failed (${res.status} ${res.statusText})${detail ? `: ${detail}` : ''}`,
      res.status,
    );
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? (JSON.parse(text) as T) : (undefined as T));
};

// ── 1. Self-Service ──────────────────────────────────────────────────────

export const getSelfServiceRequests = async (
  employeeId: string = CURRENT_USER.employeeId,
): Promise<SelfServiceRequest[]> =>
  request<SelfServiceRequest[]>(buildUrl('/self-service', { employeeId }));

export const createSelfServiceRequest = async (
  input: Pick<SelfServiceRequest, 'type' | 'subject' | 'details' | 'priority'>,
): Promise<SelfServiceRequest> =>
  request<SelfServiceRequest>(buildUrl('/self-service'), {
    method: 'POST',
    body: JSON.stringify(input),
  });

// ── 2. Pulse Surveys ─────────────────────────────────────────────────────

export const getPulseSurveys = async (): Promise<PulseSurvey[]> =>
  request<PulseSurvey[]>(buildUrl('/pulse-surveys'));

export const submitPulseResponse = async (
  pulseSurveyId: string,
  sentiment: number,
  comment?: string | null,
): Promise<{ id: string; pulseSurveyId: string; employeeId?: string | null; department?: string; sentiment: number; submittedAt: string; comment?: string | null }> =>
  request<{ id: string; pulseSurveyId: string; employeeId?: string | null; department?: string; sentiment: number; submittedAt: string; comment?: string | null }>(buildUrl('/pulse-responses'), {
    method: 'POST',
    body: JSON.stringify({
      pulseSurveyId,
      sentiment,
      comment: comment ?? null,
    }),
  });

// ── 3. Recognition ───────────────────────────────────────────────────────

export const getRecognitions = async (): Promise<Recognition[]> =>
  request<Recognition[]>(buildUrl('/recognitions'));

export const createRecognition = async (
  input: Pick<Recognition, 'toEmployeeId' | 'toName' | 'type' | 'message' | 'value' | 'visibleTo'>,
): Promise<Recognition> =>
  request<Recognition>(buildUrl('/recognitions'), {
    method: 'POST',
    body: JSON.stringify(input),
  });

// ── 4. Career Plans ──────────────────────────────────────────────────────

export const getCareerPlans = async (
  employeeId: string = CURRENT_USER.employeeId,
): Promise<CareerDevelopmentPlan[]> =>
  request<CareerDevelopmentPlan[]>(buildUrl('/career-plans', { employeeId }));

export const updateMilestoneStatus = async (
  planId: string,
  milestoneId: string,
  status: CareerMilestone['status'],
): Promise<CareerDevelopmentPlan | null> => {
  try {
    return await request<CareerDevelopmentPlan>(
      buildUrl(
        `/career-plans/${encodeURIComponent(planId)}/milestones/${encodeURIComponent(milestoneId)}`,
      ),
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
    );
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) return null;
    throw err;
  }
};

// ── 5. Learning Recommendations ──────────────────────────────────────────

export const getLearningRecommendations = async (
  employeeId: string = CURRENT_USER.employeeId,
): Promise<LearningRecommendation[]> =>
  request<LearningRecommendation[]>(buildUrl('/learning-recommendations', { employeeId }));

export const updateLearningStatus = async (
  id: string,
  status: LearningRecommendation['status'],
): Promise<LearningRecommendation | null> => {
  try {
    return await request<LearningRecommendation>(
      buildUrl(`/learning-recommendations/${encodeURIComponent(id)}`),
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
    );
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) return null;
    throw err;
  }
};

// ── 6. Issue Reports ─────────────────────────────────────────────────────

export const createIssueReport = async (
  input: Pick<IssueReport, 'category' | 'subject' | 'description' | 'url' | 'browser' | 'priority'>,
): Promise<IssueReport> =>
  request<IssueReport>(buildUrl('/issues'), {
    method: 'POST',
    body: JSON.stringify(input),
  });

// ── 7. Delay Concerns ────────────────────────────────────────────────────

export const createDelayConcern = async (
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
): Promise<DelayConcern> =>
  request<DelayConcern>(buildUrl('/delays'), {
    method: 'POST',
    body: JSON.stringify(input),
  });

// ── 8. Kanban ────────────────────────────────────────────────────────────

export const getKanbanItems = async (): Promise<KanbanItem[]> =>
  request<KanbanItem[]>(buildUrl('/kanban'));

export const moveKanbanItem = async (
  id: string,
  lane: KanbanLane,
): Promise<KanbanItem | null> => {
  try {
    return await request<KanbanItem>(buildUrl(`/kanban/${encodeURIComponent(id)}/lane`), {
      method: 'PATCH',
      body: JSON.stringify({ lane }),
    });
  } catch (err) {
    if (err instanceof HttpError && err.status === 404) return null;
    throw err;
  }
};

// ── 9. Notifications ─────────────────────────────────────────────────────

export const getNotifications = async (
  userId: string = CURRENT_USER.employeeId,
): Promise<NotificationItem[]> =>
  request<NotificationItem[]>(buildUrl('/notifications', { userId }));

export const markNotificationRead = async (id: string): Promise<void> => {
  await request<void>(buildUrl(`/notifications/${encodeURIComponent(id)}/read`), {
    method: 'PATCH',
  });
};

export const markAllNotificationsRead = async (
  userId: string = CURRENT_USER.employeeId,
): Promise<void> => {
  await request<void>(buildUrl('/notifications/read-all', { userId }), {
    method: 'PATCH',
  });
};

// ── 10. Chat Messages ────────────────────────────────────────────────────

export const getChatMessages = async (threadId: string): Promise<ChatMessage[]> =>
  request<ChatMessage[]>(buildUrl('/chat-messages', { threadId }));

export const sendChatMessage = async (
  threadId: string,
  body: string,
  toId: string | null = null,
): Promise<ChatMessage> =>
  request<ChatMessage>(buildUrl('/chat-messages'), {
    method: 'POST',
    body: JSON.stringify({ threadId, body, toId }),
  });
