// Workforce Planning Service - Real API Integration

import type { WorkforcePlan, WorkforceScenario, WorkforceLineItem } from '../types';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const workforcePlanningService = {
  async getPlans(): Promise<WorkforcePlan[]> {
    const response = await fetch(`${API_BASE}/workforce-planning/plans`);
    if (!response.ok) throw new Error('Failed to fetch workforce plans');
    return response.json();
  },

  async getScenarios(planId?: string): Promise<WorkforceScenario[]> {
    const url = planId
      ? `${API_BASE}/workforce-planning/scenarios?planId=${encodeURIComponent(planId)}`
      : `${API_BASE}/workforce-planning/scenarios`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch scenarios');
    return response.json();
  },

  async getLineItems(scenarioId?: string): Promise<WorkforceLineItem[]> {
    const url = scenarioId
      ? `${API_BASE}/workforce-planning/line-items?scenarioId=${encodeURIComponent(scenarioId)}`
      : `${API_BASE}/workforce-planning/line-items`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch line items');
    return response.json();
  },
};
