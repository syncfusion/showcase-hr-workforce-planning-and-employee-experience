// Quick Action CTA definitions, peer directory, and label-to-kind
// mapping used by the DetailPanel sidebar in the Overview screen.
//
// Mirrors src/screens/Overview/components/DetailPanel.tsx so the
// Angular port stays in lock-step with the React client. All five
// Quick Action flows (Schedule 1:1, Send Recognition, Assign
// Training, Request Pulse Check, Copy Employee Email) plus a generic
// "message" fallback for AI-supplied actions that don't map to a
// known form are handled here.

import type { AiInsight } from '../../../../models/overview.model';

/**
 * Distinguishes the five Quick Action flows. `clipboard` fires the
 * side-effect immediately; every other kind opens the
 * `QuickActionDialog` modal with a form tailored to the kind.
 * `message` is the generic fallback for AI-supplied actions whose
 * label doesn't map to a known kind — it shows a read-only message
 * preview and copies the body to the clipboard on submit.
 */
export type QuickActionKind =
  | 'schedule-1on1'
  | 'recognition'
  | 'training'
  | 'pulse'
  | 'clipboard'
  | 'message';

/**
 * One Quick Action button. The default list comes from
 * `DEFAULT_ACTIONS`; AI-supplied actions replace them when an
 * insight is on screen, with a label-based kind resolved by
 * `mapLabelToKind`.
 */
export interface QuickAction {
  id: string;
  label: string;
  kind: QuickActionKind;
  /** Generic message-only fields used for AI-provided actions. */
  title?: string;
  body?: string;
  /** Clipboard CTA payload. */
  value?: string;
}

/**
 * Result of a Quick Action dialog submission. `clipboardText` is
 * only populated for `message` CTAs where the body was just copied
 * to the clipboard.
 */
export interface QuickActionResult {
  kind: QuickActionKind;
  message: string;
  clipboardText?: string;
}

/** A peer in the demo employee directory. */
export interface PeerOption {
  id: string;
  name: string;
}

export const PEER_DIRECTORY: ReadonlyArray<PeerOption> = [
  { id: 'emp_4502', name: 'Marcus Lee' },
  { id: 'emp_4530', name: 'Priya Nair' },
  { id: 'emp_4490', name: 'John Williams' },
  { id: 'emp_4555', name: 'Sofia Garcia' },
  { id: 'emp_4560', name: 'Liam Becker' },
];

export const PEER_IDS: ReadonlyArray<string> = PEER_DIRECTORY.map((p) => p.id);

export const HEADER_FOR_KIND: Readonly<Partial<Record<QuickActionKind, string>>> = {
  'schedule-1on1': 'Schedule 1:1',
  recognition: 'Send Recognition',
  training: 'Assign Training',
  pulse: 'Request Pulse Check',
};

export interface CourseOption {
  value: string;
  label: string;
}

export interface CadenceOption {
  value: string;
  label: string;
}

export const TRAINING_COURSES: ReadonlyArray<CourseOption> = [
  { value: 'leadership-101', label: 'Leadership 101' },
  { value: 'feedback-coaching', label: 'Feedback & Coaching' },
  { value: 'effective-1on1s', label: 'Effective 1:1s' },
  { value: 'psychological-safety', label: 'Psychological Safety' },
  { value: 'difficult-conversations', label: 'Difficult Conversations' },
];

export const PULSE_CADENCES: ReadonlyArray<CadenceOption> = [
  { value: 'one-time', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const RECOGNITION_TYPES: ReadonlyArray<string> = [
  'peer-shoutout',
  'milestone',
  'leadership',
  'team-win',
];

export const RECOGNITION_VALUES: ReadonlyArray<string> = [
  'Innovation',
  'Customer Focus',
  'Mentorship',
  'Tenure',
  'Growth',
  'Teamwork',
  'Integrity',
];

export const RECOGNITION_VISIBILITIES: ReadonlyArray<string> = [
  'public',
  'team',
  'private',
];

/**
 * The five always-rendered Quick Action buttons. Shown when no AI
 * insight is on screen so the sidebar is interactive from first
 * paint. `Copy Employee Email` uses `clipboard` and writes the value
 * to the clipboard immediately.
 */
export const DEFAULT_ACTIONS: ReadonlyArray<QuickAction> = [
  { id: 'qa-1on1', label: 'Schedule 1:1', kind: 'schedule-1on1' },
  { id: 'qa-recognize', label: 'Send Recognition', kind: 'recognition' },
  { id: 'qa-training', label: 'Assign Training', kind: 'training' },
  { id: 'qa-pulse', label: 'Request Pulse Check', kind: 'pulse' },
  { id: 'qa-copy', label: 'Copy Employee Email', kind: 'clipboard', value: '{employee.email}' },
];

/**
 * Map an AI-supplied action's free-form `label` back to a known
 * `QuickActionKind` so the proper form opens instead of the generic
 * message preview. Keyword match on the first word / first line is
 * enough — the AI prompt asks for short verb-led labels. Returns
 * `null` when the label doesn't map to any known kind, so the
 * caller can fall back to `message`.
 */
export function mapLabelToKind(label: string | null | undefined): QuickActionKind | null {
  if (!label) return null;
  const l = label.trim().toLowerCase();
  if (!l) return null;
  if (/\b(1[:.\- ]?1|one[-\s]?on[-\s]?one|meeting|catch[-\s]?up|1on1)\b/.test(l)) {
    return 'schedule-1on1';
  }
  if (/\b(recogni[sz]e|recognition|kudos|thank|appreciat|praise|shout[-\s]?out)\b/.test(l)) {
    return 'recognition';
  }
  if (/\b(training|course|learn|enroll|workshop|coaching|mentor)\b/.test(l)) {
    return 'training';
  }
  if (/\b(pulse|survey|check[-\s]?in|feedback|nps)\b/.test(l)) {
    return 'pulse';
  }
  return null;
}

/**
 * Build the rendered action list. Prefer AI-supplied actions (mapped
 * to a known form when the label matches one of the Quick Action
 * kinds; falling back to a generic `message` dialog when it
 * doesn't), and use the default CTA list when no AI insight is
 * present so the section is never empty.
 */
export function resolveActions(
  aiActions: AiInsight['actions'] | undefined,
): ReadonlyArray<QuickAction> {
  if (aiActions && aiActions.length > 0) {
    return aiActions.map((a) => ({
      id: a.id,
      label: a.label,
      kind: mapLabelToKind(a.label) ?? 'message',
    }));
  }
  return DEFAULT_ACTIONS;
}

/**
 * Resolve the default employee for any CTA that needs a recipient.
 * Prefers the AI insight's `employeeId` if it matches the peer
 * directory, else the first peer. Keeps the dialog's dropdown
 * pre-selected to the right person.
 */
export function resolveDefaultEmployeeId(insight: AiInsight | null): string {
  if (insight) {
    const match = PEER_DIRECTORY.find(
      (p) => p.id.toLowerCase() === insight.employeeId.toLowerCase(),
    );
    if (match) return match.id;
  }
  return PEER_DIRECTORY[0].id;
}
