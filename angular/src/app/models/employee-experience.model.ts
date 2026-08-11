// Employee Experience Types — mirrors src/types/index.ts
// (Only the types consumed by the Employee Experience screen.)

// Re-export the shared ThemeSentiment from the existing overview model
// to avoid duplication; for showcase purposes we redeclare the minimal
// shape used here.
export interface ThemeSentiment {
  theme: string;
  sentiment: number; // -100 to 100
  department: string;
}

// ===== Self-Service =====
export type SelfServiceType =
  | 'address-change'
  | 'benefits'
  | 'payroll'
  | 'equipment'
  | 'leave-request'
  | 'other';

export type SelfServiceStatus =
  | 'submitted'
  | 'in-review'
  | 'in-progress'
  | 'resolved'
  | 'rejected';

export interface SelfServiceRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: SelfServiceType;
  subject: string;
  details: string;
  status: SelfServiceStatus;
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  attachments?: string[];
}

// ===== Pulse Surveys =====
export type PulseCadence = 'one-time' | 'weekly' | 'monthly' | 'quarterly';

export interface PulseSurvey {
  id: string;
  campaignId?: string | null;
  title: string;
  status: 'draft' | 'active' | 'closed';
  cadence?: PulseCadence;
  questionRefs: string[];
  responseRate: number;
  totalResponses: number;
  openAt: string;
  closeAt?: string | null;
  themes: ThemeSentiment[];
}

export interface PulseResponse {
  id: string;
  pulseSurveyId: string;
  employeeId?: string | null;
  department?: string;
  sentiment: number;
  submittedAt: string;
  comment?: string | null;
}

// ===== Recognition =====
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

// ===== Career =====
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

// ===== Learning =====
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

// ===== Issues =====
export type IssueCategory =
  | 'system-rendering'
  | 'data-quality'
  | 'access'
  | 'performance'
  | 'integration'
  | 'other';

export type IssueStatus =
  | 'submitted'
  | 'acknowledged'
  | 'in-progress'
  | 'resolved'
  | 'wont-fix';

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
  status: IssueStatus;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

// ===== Delays =====
export type DelayRelatedEntityType =
  | 'self-service'
  | 'requisition'
  | 'approval'
  | 'payroll'
  | 'benefits'
  | 'other';

export type DelayStatus = 'open' | 'acknowledged' | 'resolved' | 'rejected';

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
  status: DelayStatus;
  severity?: 'low' | 'medium' | 'high';
  createdAt: string;
}

// ===== Kanban =====
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

// ===== Notifications =====
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

// ===== Chat =====
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
