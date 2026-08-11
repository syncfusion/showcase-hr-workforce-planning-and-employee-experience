// HR Workforce Planning Hub Types

// ============================================================================
// Workforce Planning
// ============================================================================

export interface WorkforcePlan {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  planningPeriodStart: string;
  planningPeriodEnd: string;
  ownerId: string;
  currency: string;
  latestSnapshotAt?: string;
}

export interface WorkforceScenario {
  id: string;
  planId: string;
  name: string;
  type: 'baseline' | 'growth' | 'constrained' | 'risk';
  headcountTarget: number;
  hiringTarget?: number;
  attritionRate?: number;
  budgetImpact: number;
  confidence?: 'low' | 'medium' | 'high';
}

export interface WorkforceLineItem {
  id: string;
  scenarioId: string;
  function: string;
  region: string;
  roleFamily: string;
  currentHeadcount: number;
  plannedHeadcount: number;
  openRoles?: number;
  costCenter?: string;
}

export interface PlanningSnapshot {
  id: string;
  planId: string;
  capturedAt: string;
  createdBy: string;
  sourceSystem: string;
}

// ============================================================================
// Hiring Pipeline
// ============================================================================

export type ApplicantStatus = 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface Applicant {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  position: string;
  department: string;
  location: string;
  status: ApplicantStatus;
  source: string; // LinkedIn, Indeed, DOU, Djinni, Referral
  appliedAt: string; // ISO
  requisitionId?: string;
}

// Paged envelope returned by GET /api/hiring-pipeline/candidates.
export interface PagedApplicants {
  items: Applicant[];
  total: number;
  page: number;
  pageSize: number;
}

// Per-status candidate counts returned by GET /api/hiring-pipeline/candidates/counts.
// Drives the tab badges in the candidate list view.
export interface ApplicantCounts {
  all: number;
  new: number;
  screening: number;
  interview: number;
  offer: number;
  hired: number;
  rejected: number;
}

// ============================================================================
// Overview
// ============================================================================

// Detailed Requisition for Overview dashboard
export interface ActiveRequisition {
  id: string;
  position: string;
  department: string;
  priority: 'Critical' | 'High' | 'Medium';
  candidates: number;
  stage: 'Interview' | 'Final Round' | 'Offer' | 'Screening' | 'Filled';
  timeOpen: string;
}

// Action plan for overview
export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  category: string;
  statusColor: 'primary' | 'success' | 'warning' | 'danger';
  statusLabel: string;
  progress: number;
}

// Activity timeline event for sidebar detail panel
export interface ActivityTimelineEvent {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
}

// AI insight card data
export interface AiInsight {
  employeeId: string;
  engagementDrop: number;
  quarter: string;
  notes: string;
  actions: { id: string; label: string }[];
}

// Enhanced KPI card data
export interface KpiCardData {
  title: string;
  value: string;
  change: number;
  trendData: { x: number; yval: number }[];
  context: string;
  showProgress?: boolean;
  progressValue?: number;
  target?: number;
  color: string;
}

// KPI Data
export interface KpiData {
  headcount: number;
  headcountChange: number;
  openRoles: number;
  openRolesChange: number;
  engagementScore: number;
  engagementChange: number;
}

// ============================================================================
// Employee Experience
// ============================================================================

export type SelfServiceType =
  | 'address-change'
  | 'benefits'
  | 'payroll'
  | 'equipment'
  | 'leave-request'
  | 'other';

export interface SelfServiceRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: SelfServiceType;
  subject: string;
  details: string;
  status: 'submitted' | 'in-review' | 'in-progress' | 'resolved' | 'rejected';
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  attachments?: string[];
}

export interface PulseSurvey {
  id: string;
  campaignId?: string | null;
  title: string;
  status: 'draft' | 'active' | 'closed';
  cadence?: 'one-time' | 'weekly' | 'monthly' | 'quarterly';
  questionRefs: string[];
  responseRate: number;
  totalResponses: number;
  openAt: string;
  closeAt?: string | null;
  themes: { theme: string; sentiment: number; department: string }[];
}

export type RecognitionType =
  | 'peer-shoutout'
  | 'milestone'
  | 'leadership'
  | 'team-win';

export type RecognitionVisibility = 'public' | 'team' | 'private';

export interface Recognition {
  id: string;
  fromEmployeeId: string;
  fromName: string;
  toEmployeeId: string;
  toName: string;
  type: RecognitionType;
  message: string;
  value?: string | null;
  createdAt: string;
  visibleTo: RecognitionVisibility;
}

export type CareerPlanStatus =
  | 'draft'
  | 'on-track'
  | 'at-risk'
  | 'completed'
  | 'stalled';

export type CareerHorizon = '6-months' | '12-months' | '24-months';

export type MilestoneStatus =
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'blocked';

export interface CareerMilestone {
  id: string;
  planId: string;
  title: string;
  targetDate: string;
  status: MilestoneStatus;
  evidenceLink?: string | null;
}

export interface CareerDevelopmentPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  currentRole: string;
  targetRole?: string | null;
  horizon: CareerHorizon;
  status: CareerPlanStatus;
  milestones: CareerMilestone[];
  lastReviewedAt?: string | null;
}

export type LearningFormat =
  | 'course'
  | 'article'
  | 'video'
  | 'certification'
  | 'mentoring'
  | 'project';

export type LearningStatus =
  | 'suggested'
  | 'saved'
  | 'in-progress'
  | 'completed'
  | 'dismissed';

export interface LearningRecommendation {
  id: string;
  planId?: string | null;
  employeeId: string;
  title: string;
  provider?: string | null;
  format: LearningFormat;
  skillTag?: string | null;
  reason?: string | null;
  matchScore?: number | null;
  estHours?: number | null;
  status: LearningStatus;
  suggestedAt: string;
}

export type IssueCategory =
  | 'system-rendering'
  | 'data-quality'
  | 'access'
  | 'performance'
  | 'integration'
  | 'other';

export interface IssueReport {
  id: string;
  reportedBy: string;
  reportedByName: string;
  category: IssueCategory;
  subject: string;
  description: string;
  url?: string | null;
  browser?: string | null;
  attachments?: string[];
  status: 'submitted' | 'acknowledged' | 'in-progress' | 'resolved' | 'wont-fix';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export type DelayRelatedEntityType =
  | 'self-service'
  | 'requisition'
  | 'approval'
  | 'payroll'
  | 'benefits'
  | 'other';

export interface DelayConcern {
  id: string;
  raisedBy: string;
  raisedByName: string;
  relatedEntityType: DelayRelatedEntityType;
  relatedEntityId?: string | null;
  subject: string;
  details: string;
  daysWaiting: number;
  expectedSlackDays?: number | null;
  status: 'open' | 'acknowledged' | 'resolved' | 'rejected';
  severity?: 'low' | 'medium' | 'high';
  createdAt: string;
}

export type KanbanSourceType =
  | 'self-service'
  | 'pulse-feedback'
  | 'recognition'
  | 'career'
  | 'learning'
  | 'issue'
  | 'delay';

export type KanbanLane =
  | 'backlog'
  | 'in-progress'
  | 'in-review'
  | 'done';

export interface KanbanItem {
  id: string;
  sourceType: KanbanSourceType;
  sourceId: string;
  title: string;
  lane: KanbanLane;
  assigneeId?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string | null;
  tags?: string[];
  updatedAt: string;
}

export type NotificationType = 'chat' | 'system' | 'mention' | 'status-update';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  fromId: string;
  fromName: string;
  toId?: string | null;
  body: string;
  sentAt: string;
  attachments?: string[];
}
