// Workforce Planning Types — mirrors src/types/index.ts
// (Only the types consumed by the Workforce Planning screen.)

export type WorkforcePlanStatus = 'draft' | 'active' | 'archived';
export type WorkforceScenarioType = 'baseline' | 'growth' | 'constrained' | 'risk';
export type WorkforceConfidence = 'low' | 'medium' | 'high';

/** Workforce Plan */
export interface WorkforcePlan {
  id: string;
  name: string;
  status: WorkforcePlanStatus;
  planningPeriodStart: string;
  planningPeriodEnd: string;
  ownerId: string;
  currency: string;
  latestSnapshotAt?: string;
}

/** Workforce Scenario */
export interface WorkforceScenario {
  id: string;
  planId: string;
  name: string;
  type: WorkforceScenarioType;
  headcountTarget: number;
  hiringTarget?: number;
  attritionRate?: number;
  budgetImpact: number;
  confidence?: WorkforceConfidence;
}

/** Workforce Line Item (staffing row) */
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

/** Planning Snapshot */
export interface PlanningSnapshot {
  id: string;
  planId: string;
  capturedAt: string;
  createdBy: string;
  sourceSystem: string;
}
