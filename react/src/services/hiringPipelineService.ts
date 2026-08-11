import type {
  ApplicantStatus,
  PagedApplicants,
  ApplicantCounts,
} from '../types';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`;

export interface ScheduleInterviewInput {
  applicationId: string;
  type: 'phone' | 'technical' | 'panel' | 'manager';
  scheduledStart: string; // ISO
  scheduledEnd: string;   // ISO
  interviewers: string[];
}

export const scheduleInterview = async (_input: ScheduleInterviewInput): Promise<void> => {
  const response = await fetch(`${API_BASE}/hiring-pipeline/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(_input),
  });
  if (!response.ok) throw new Error('Failed to schedule interview');
};

// --- Applicant pipeline (per-requisition) ----------------------------------

export interface ApplicantFilters {
  status?: ApplicantStatus | 'all';
  requisitionId?: string;
  page?: number;
  pageSize?: number;
  sort?: string; // e.g. "appliedAt:desc"
}

export const fetchApplicants = async (
  filters: ApplicantFilters = {},
): Promise<PagedApplicants> => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.requisitionId) params.append('requisitionId', filters.requisitionId);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
  if (filters.sort) params.append('sort', filters.sort);
  const qs = params.toString();
  const response = await fetch(`${API_BASE}/hiring-pipeline/candidates${qs ? `?${qs}` : ''}`);
  if (!response.ok) throw new Error('Failed to fetch applicants');
  return response.json();
};

export const fetchApplicantCounts = async (): Promise<ApplicantCounts> => {
  const response = await fetch(`${API_BASE}/hiring-pipeline/candidates/counts`);
  if (!response.ok) throw new Error('Failed to fetch candidate counts');
  const dto: {
    all: number;
    new: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
    rejected: number;
  } = await response.json();
  return {
    all: dto.all,
    new: dto.new,
    screening: dto.screening,
    interview: dto.interview,
    offer: dto.offer,
    hired: dto.hired,
    rejected: dto.rejected,
  };
};

export const moveApplicantStage = async (id: string, status: ApplicantStatus): Promise<void> => {
  const response = await fetch(`${API_BASE}/hiring-pipeline/candidates/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update applicant status');
};

export const rejectApplicant = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/hiring-pipeline/candidates/${id}/reject`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to reject applicant');
};
