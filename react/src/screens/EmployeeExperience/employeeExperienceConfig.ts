// Metadata for the Employee Experience tab: sub-section labels, Kanban lanes,
// form field options, notification types, and recognition value tags.

import type {
  IssueCategory,
  KanbanLane,
  NotificationType,
  RecognitionType,
  RecognitionVisibility,
  SelfServiceType,
  DelayRelatedEntityType,
  LearningFormat,
  LearningStatus,
  MilestoneStatus,
} from '../../types';

export const SUB_SECTIONS = [
  { id: 'self-service', label: 'Self-Service' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'recognition', label: 'Recognition' },
  { id: 'career', label: 'Career' },
  { id: 'learning', label: 'Learning' },
  { id: 'my-board', label: 'My Board' },
] as const;

export type SubSectionId = (typeof SUB_SECTIONS)[number]['id'];

export const KANBAN_LANES: { key: KanbanLane; label: string }[] = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'in-review', label: 'In Review' },
  { key: 'done', label: 'Done' },
];

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  'self-service': 'Self-Service',
  'pulse-feedback': 'Pulse Feedback',
  recognition: 'Recognition',
  career: 'Career',
  learning: 'Learning',
  issue: 'Issue',
  delay: 'Delay',
};

export const SELF_SERVICE_TYPES: { value: SelfServiceType; label: string }[] = [
  { value: 'address-change', label: 'Address Change' },
  { value: 'benefits', label: 'Benefits' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'leave-request', label: 'Leave Request' },
  { value: 'other', label: 'Other' },
];

export const SELF_SERVICE_STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  'in-review': 'In Review',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

export const RECOGNITION_TYPES: { value: RecognitionType; label: string }[] = [
  { value: 'peer-shoutout', label: 'Peer Shoutout' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'team-win', label: 'Team Win' },
];

export const RECOGNITION_VISIBILITY: { value: RecognitionVisibility; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'team', label: 'Team' },
  { value: 'private', label: 'Private' },
];

export const RECOGNITION_VALUES = [
  'Innovation',
  'Customer Focus',
  'Mentorship',
  'Tenure',
  'Growth',
  'Teamwork',
  'Integrity',
];

export const CAREER_HORIZONS = ['6-months', '12-months', '24-months'] as const;

export const MILESTONE_STATUS_OPTIONS: { value: MilestoneStatus; label: string }[] = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
];

export const CAREER_PLAN_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  'on-track': 'On Track',
  'at-risk': 'At Risk',
  completed: 'Completed',
  stalled: 'Stalled',
};

export const LEARNING_FORMATS: { value: LearningFormat; label: string }[] = [
  { value: 'course', label: 'Course' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'certification', label: 'Certification' },
  { value: 'mentoring', label: 'Mentoring' },
  { value: 'project', label: 'Project' },
];

export const LEARNING_STATUS_OPTIONS: { value: LearningStatus; label: string }[] = [
  { value: 'suggested', label: 'Suggested' },
  { value: 'saved', label: 'Saved' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'dismissed', label: 'Dismissed' },
];

export const ISSUE_CATEGORIES: { value: IssueCategory; label: string }[] = [
  { value: 'system-rendering', label: 'System Rendering' },
  { value: 'data-quality', label: 'Data Quality' },
  { value: 'access', label: 'Access' },
  { value: 'performance', label: 'Performance' },
  { value: 'integration', label: 'Integration' },
  { value: 'other', label: 'Other' },
];

export const DELAY_RELATED_TYPES: { value: DelayRelatedEntityType; label: string }[] = [
  { value: 'self-service', label: 'Self-Service Request' },
  { value: 'requisition', label: 'Requisition' },
  { value: 'approval', label: 'Approval' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'benefits', label: 'Benefits' },
  { value: 'other', label: 'Other' },
];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  chat: 'Chat',
  system: 'System',
  mention: 'Mention',
  'status-update': 'Status Update',
};

export const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'] as const;
export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const SEVERITY_OPTIONS = ['low', 'medium', 'high'] as const;

// Status/priority color tokens (paired with text labels — never color alone).
export const STATUS_COLORS: Record<string, string> = {
  submitted: '#6C757D',
  'in-review': '#3B8CDE',
  'in-progress': '#FFC107',
  resolved: '#28A745',
  rejected: '#DC3545',
  done: '#28A745',
  open: '#3B8CDE',
  acknowledged: '#FFC107',
  draft: '#6C757D',
  active: '#28A745',
  closed: '#6C757D',
  'on-track': '#28A745',
  'at-risk': '#FFC107',
  stalled: '#DC3545',
  completed: '#28A745',
  'not-started': '#6C757D',
  blocked: '#DC3545',
  suggested: '#3B8CDE',
  saved: '#6C757D',
  dismissed: '#6C757D',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: '#6C757D',
  medium: '#3B8CDE',
  high: '#FFC107',
  critical: '#DC3545',
};

export const SEVERITY_COLORS: Record<string, string> = {
  low: '#6C757D',
  medium: '#FFC107',
  high: '#DC3545',
};

