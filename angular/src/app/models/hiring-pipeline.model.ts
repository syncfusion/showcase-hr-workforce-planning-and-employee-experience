// Hiring Pipeline Types — mirrors src/types/index.ts
// (Only the types consumed by the Hiring Pipeline screen.)

// --- Requisition / Job Opening (kept for back-compat with other screens/tests) -

export type RequisitionStatus =
  | 'needs_approval'
  | 'open'
  | 'in_review'
  | 'offered'
  | 'hired';

export type RequisitionPriority = 'low' | 'medium' | 'high';

/** Requisition / Job Opening */
export interface Requisition {
  id: string;
  title: string;
  department: string;
  location: string;
  priority: RequisitionPriority;
  status: RequisitionStatus;
  daysOpen: number;
  hiredCount: number;
  targetCount: number;
  createdAt: string;
}

// --- Applicant pipeline (per-requisition) ---------------------------------

/** Stage in the candidate pipeline. Drives the kanban columns, status pills, and tab counts. */
export type ApplicantStatus =
  | 'new'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected';

/** Single candidate row in the Hiring Pipeline screen. */
export interface Applicant {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  position: string;
  department: string;
  location: string;
  status: ApplicantStatus;
  source: string; // LinkedIn, Indeed, DOU, Djinni, Referral, …
  appliedAt: string; // ISO
  requisitionId?: string;
}

/** Paged envelope returned by GET /api/hiring-pipeline/candidates. */
export interface PagedApplicants {
  items: Applicant[];
  total: number;
  page: number;
  pageSize: number;
}

/** Per-status candidate counts returned by GET /api/hiring-pipeline/candidates/counts.
 *  Drives the tab badges in the candidate list view. */
export interface ApplicantCounts {
  all: number;
  new: number;
  screening: number;
  interview: number;
  offer: number;
  hired: number;
  rejected: number;
}

/** Filters accepted by GET /api/hiring-pipeline/candidates. */
export interface ApplicantFilters {
  status?: ApplicantStatus | 'all';
  requisitionId?: string;
  page?: number;
  pageSize?: number;
  sort?: string; // e.g. "appliedAt:desc"
}
