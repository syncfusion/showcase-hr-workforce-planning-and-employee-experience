// SLA risk helper — mirrors src/services/sla.ts
// Pure helper function for computing SLA risk on a hiring requisition.
// No Angular DI is required; the helper is exported as a named function so
// the same behavior is available to any consumer (component, service, etc).

export interface StageSLA {
  stage: string;
  maxHours: number; // threshold
}

export interface SLACheckInput {
  lastActivityAtISO?: string; // if available
  daysOpen?: number; // fallback for requisitions
}

export type SLARisk = 'ok' | 'warning' | 'overdue';

export const computeRisk = (
  input: SLACheckInput,
  sla: StageSLA,
): SLARisk => {
  if (input.lastActivityAtISO) {
    const then = new Date(input.lastActivityAtISO).getTime();
    const now = Date.now();
    const hours = (now - then) / 36e5;
    if (hours > sla.maxHours) return 'overdue';
    if (hours > sla.maxHours * 0.7) return 'warning';
    return 'ok';
  }

  if (typeof input.daysOpen === 'number') {
    const hours = input.daysOpen * 24;
    if (hours > sla.maxHours) return 'overdue';
    if (hours > sla.maxHours * 0.7) return 'warning';
    return 'ok';
  }

  return 'ok';
};
