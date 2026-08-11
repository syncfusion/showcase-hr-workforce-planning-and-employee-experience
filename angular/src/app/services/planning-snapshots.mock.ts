// Mock data for the Workforce Planning screen — mirrors
// src/services/mockData.ts (planningSnapshots slice only).
// Used for the snapshot counter / latest-snapshot label rendered in
// the page; the API does not currently expose this collection.
import type { PlanningSnapshot } from '../models/workforce-planning.model';

export const planningSnapshots: PlanningSnapshot[] = [
  {
    id: 'snap_2026_06_18',
    planId: 'wp_2026_q3',
    capturedAt: '2026-06-18T09:00:00-04:00',
    createdBy: 'u_209',
    sourceSystem: 'hris',
  },
  {
    id: 'snap_2026_06_15',
    planId: 'wp_2026_q3',
    capturedAt: '2026-06-15T18:30:00+01:00',
    createdBy: 'u_104',
    sourceSystem: 'planning-sheet',
  },
];
