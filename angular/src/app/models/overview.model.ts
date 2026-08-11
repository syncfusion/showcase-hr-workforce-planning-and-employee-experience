// HR Workforce Planning Hub Types — Overview subset
// (Mirrors src/types/index.ts — only the types consumed by the Overview screen.)

/** Detailed Requisition for Overview dashboard */
export interface ActiveRequisition {
  id: string;
  position: string;
  department: string;
  priority: 'Critical' | 'High' | 'Medium';
  candidates: number;
  stage: 'Interview' | 'Final Round' | 'Offer' | 'Screening' | 'Filled';
  timeOpen: string;
}

/** Action plan for overview */
export interface ActionPlan {
  id: string;
  title: string;
  description: string;
  category: string;
  statusColor: 'primary' | 'success' | 'warning' | 'danger';
  statusLabel: string;
  progress: number;
}

/** Activity timeline event for sidebar detail panel */
export interface ActivityTimelineEvent {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  /** Free-form status from the backend (e.g. "completed", "pending", "submitted"). */
  status: string;
}

/** AI insight card data */
export interface AiInsight {
  employeeId: string;
  engagementDrop: number;
  quarter: string;
  notes: string;
  actions: { id: string; label: string }[];
}

/** KPI trend point */
export interface KpiTrendPoint {
  x: number;
  yval: number;
}

/** Enhanced KPI card data */
export interface KpiCardData {
  title: string;
  value: string;
  change: number;
  trendData: KpiTrendPoint[];
  context: string;
  showProgress?: boolean;
  progressValue?: number;
  target?: number;
  color: string;
}

/** KPI Data */
export interface KpiData {
  headcount: number;
  headcountChange: number;
  openRoles: number;
  openRolesChange: number;
  engagementScore: number;
  engagementChange: number;
}
