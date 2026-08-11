// Overview Service - API integration for the Overview screen

import type { KpiData, ActiveRequisition, ActivityTimelineEvent, AiInsight, ActionPlan } from '../types';

export interface OverviewResponse {
  kpi: KpiData;
  kpiCards: {
    title: string;
    value: string;
    change: number;
    trendData: { x: number; yval: number }[];
    context: string;
    showProgress?: boolean;
    progressValue?: number;
    target?: number;
    color: string;
  }[];
  requisitions: ActiveRequisition[];
  activityTimeline: ActivityTimelineEvent[];
  aiInsight: AiInsight;
  actionPlans: ActionPlan[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const fetchOverview = async (): Promise<OverviewResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/overview`);
  if (!response.ok) {
    throw new Error(`Failed to fetch overview data: ${response.status}`);
  }
  return response.json();
};

export const generateAiInsight = async (employeeId: string): Promise<AiInsight> => {
  const response = await fetch(`${API_BASE_URL}/api/overview/employee/${encodeURIComponent(employeeId)}/generate-insight`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to generate AI insight: ${response.status}`);
  }

  return response.json();
};
