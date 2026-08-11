import React, { useEffect, useState } from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import type { ActivityTimelineEvent, AiInsight } from '../../../types';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import {
  QuickActionDialog,
  type QuickAction,
  type QuickActionKind,
  type QuickActionResult,
} from './QuickActionDialog';

interface DetailPanelProps {
  timeline: ActivityTimelineEvent[];
  aiInsight: AiInsight | null;
  onGenerateInsight?: () => Promise<AiInsight>;
  // Fired when the user dismisses the generated AI insight card via the
  // close (X) button in the card header. Lets the parent clear the
  // `aiInsight` state so the card collapses back to "Generate AI Insight".
  onDismissInsight?: () => void;
  // Imperative toast trigger so `QuickActionDialog` can show a Syncfusion
  // `<ToastComponent>` confirmation when the user sends a CTA. The toast
  // is owned by the `Overview` screen so it sits at the screen level (not
  // inside the sidebar) and survives the dialog closing.
  onShowToast?: (result: { title: string; content: string }) => void;
}

// Why a pure-React timeline instead of `<TimelineComponent>` from
// @syncfusion/ej2-react-layouts:
//   EJ2's `Timeline` widget runs the per-item `content` through its own string
//   `compile()` engine (see `node_modules/@syncfusion/ej2-layouts/src/timeline/
//   timeline.js` — `updateItemContent` → `getTemplateFunction(..., notCompile)` →
//   `compile(template)`). `compile` only knows how to parse string templates with
//   `${...}` placeholders; a function returning React JSX gets stringified and
//   dropped, so the dot connector renders but every label is blank. EJ2's React
//   wrapper provides a React-aware `compile` via `createPortal` in
//   `@syncfusion/ej2-react-base`, but the Timeline widget imports `compile`
//   directly from `@syncfusion/ej2-base` and never sees the React override.
//   Even using the `template` (singular) prop has the same problem — the result
//   of `compile()` is fed straight to `append()`, which only accepts NodeLists.
//
//   The cleanest fix is to skip the EJ2 widget entirely for this use case and
//   render a small React timeline that matches EJ2's default visual structure
//   (vertical column, dot, connector line, content on the right). It avoids the
//   template compile() round-trip, has no `createRoot` portal lifecycle to
//   manage, and works identically at every viewport.

const Timeline: React.FC<{
  events: ActivityTimelineEvent[];
}> = ({ events }) => {
  // Vertical column, 16px dot on the left, 1px connector line, content on the
  // right. Matches the visual structure of EJ2's default Timeline (and the
  // Blazor/Angular ports) without going through EJ2's broken-in-React
  // template engine.
  return (
    <ol
      className="detail-timeline"
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        // Reserve room on the left for the dot + connector column.
        position: 'relative',
      }}
    >
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        return (
          <li
            key={event.id}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              paddingLeft: '32px',
              // Leave a gap between items and skip the trailing connector on the
              // last one so the line doesn't extend past the final dot.
              paddingBottom: isLast ? 0 : '16px',
            }}
          >
            {/* Dot — sits on top of the connector line so the line never shows
                through the dot. Border uses the brand color uniformly for
                all event statuses (no green/success palette for "completed"
                events). */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '8px',
                top: '6px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'var(--color-sf-bg-primary)',
                border: '2px solid var(--color-sf-border-brand)',
                boxSizing: 'border-box',
                zIndex: 1,
              }}
            />
            {/* Connector line — vertical, starts at the dot and runs to the
                next item. Drawn from the dot's left edge so the line visually
                threads through the dot's center. */}
            {!isLast && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '15px',
                  top: '14px',
                  bottom: 0,
                  width: '1px',
                  background: 'var(--color-sf-border-tertiary)',
                }}
              />
            )}
            {/* Content — same hierarchy as the EJ2 / Blazor versions. */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--color-sf-fg-primary)',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}
              >
                {event.title}
              </div>
              {event.detail && (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-sf-fg-quaternary)',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                  }}
                >
                  {event.detail}
                </div>
              )}
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--color-sf-fg-quaternary)',
                }}
              >
                {event.timestamp}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

// ---------------------------------------------------------------------------
// Quick Action CTA definitions
// ---------------------------------------------------------------------------
// The sidebar shows one button per action. `clipboard` fires immediately; the
// other kinds open the `QuickActionDialog`, which renders the right form
// based on `action.kind`. AI-supplied actions that lack a known `kind` fall
// back to a generic `message` dialog.
const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { id: 'qa-1on1', label: 'Schedule 1:1', kind: 'schedule-1on1' },
  { id: 'qa-recognize', label: 'Send Recognition', kind: 'recognition' },
  { id: 'qa-training', label: 'Assign Training', kind: 'training' },
  { id: 'qa-pulse', label: 'Request Pulse Check', kind: 'pulse' },
  { id: 'qa-copy', label: 'Copy Employee Email', kind: 'clipboard', value: '{employee.email}' },
];

// Map an AI-supplied action's free-form `label` back to a known
// `QuickActionKind` so the proper form (Date/Time/Agenda, Recognition
// fields, Training, Pulse, etc.) opens instead of the generic message
// preview. The AI prompt asks for short verb-led labels, so a small
// keyword match on the first word / first line is enough.
//
// Returns `null` when the label doesn't map to any known kind — the
// caller then falls back to the `message` dialog.
const mapLabelToKind = (label: string): QuickActionKind | null => {
  const l = label.trim().toLowerCase();
  if (!l) return null;
  // 1:1 / meeting / catch-up → schedule form
  if (/\b(1[:.\- ]?1|one[-\s]?on[-\s]?one|meeting|catch[-\s]?up|1on1)\b/.test(l)) {
    return 'schedule-1on1';
  }
  // Recognition / kudos / thank-you → recognition form
  if (/\b(recogni[sz]e|recognition|kudos|thank|appreciat|praise|shout[-\s]?out)\b/.test(l)) {
    return 'recognition';
  }
  // Training / course / learning → training form
  if (/\b(training|course|learn|enroll|workshop|coaching|mentor)\b/.test(l)) {
    return 'training';
  }
  // Pulse / survey / check-in → pulse form
  if (/\b(pulse|survey|check[-\s]?in|feedback|nps)\b/.test(l)) {
    return 'pulse';
  }
  return null;
};

// Build the rendered action list: prefer the AI-supplied ones (mapped to a
// known form when the label matches one of the Quick Action kinds; falling
// back to a generic `message` dialog when it doesn't), and use the default
// CTA list when no AI insight is present so the section is never empty.
const resolveQuickActions = (
  aiActions: AiInsight['actions'] | undefined,
): QuickAction[] => {
  if (aiActions && aiActions.length > 0) {
    return aiActions.map((a) => {
      const kind = mapLabelToKind(a.label) ?? 'message';
      return { id: a.id, label: a.label, kind };
    });
  }
  return DEFAULT_QUICK_ACTIONS;
};

// Re-used employee ID list for the default CTA pre-selection. The actual
// dropdown options are owned by `QuickActionDialog`; this list only exists
// to pick the right employee when the AI insight specifies one.
const PEER_IDS: string[] = ['emp_4502', 'emp_4530', 'emp_4490', 'emp_4555', 'emp_4560'];

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="mw-section-title">{children}</span>
);

export const DetailPanel: React.FC<DetailPanelProps> = ({
  timeline,
  aiInsight,
  onGenerateInsight,
  onDismissInsight,

}) => {
  const [showActionPlanModal, setShowActionPlanModal] = useState(false);
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  // CTA dialog state — `QuickActionDialog` is the single modal re-used for
  // every Quick Action; the parent owns the toast surface and the
  // clipboard side-effect so dialog and clipboard CTAs share one feedback
  // channel.
  const [activeCta, setActiveCta] = useState<QuickAction | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // `useBreakpoint` is kept imported in case the panel later needs to react to
  // viewport size (e.g. hiding the AI card on xs), but the timeline itself is
  // viewport-agnostic now that it renders as a plain flex column.
  useBreakpoint();

  const hasInsight = Boolean(aiInsight && !generatingInsight);
  const quickActions = resolveQuickActions(aiInsight?.actions);

  // Resolve the default employee for any CTA that needs a recipient: prefer
  // the AI insight's `employeeId` (if it matches the peer directory), else
  // the first peer. Keeps the dialog's dropdown pre-selected to the right
  // person.
  const defaultEmployeeId =
    aiInsight?.employeeId && PEER_IDS.includes(aiInsight.employeeId)
      ? aiInsight.employeeId
      : PEER_IDS[0];

  // Fire the right side-effect for each CTA kind. `clipboard` happens
  // immediately; every other kind opens the shared `QuickActionDialog`.
  const handleQuickAction = (action: QuickAction) => {
    if (action.kind === 'clipboard') {
      const text = action.value ?? action.label;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(
          () => setToast(`Copied "${text}" to clipboard.`),
          () => setToast('Could not access clipboard.'),
        );
      } else {
        setToast(`Clipboard not available. Value: ${text}`);
      }
      return;
    }
    setActiveCta(action);
  };

  // Surface the dialog's submission as a toast. For `message` CTAs we
  // additionally write the body to the clipboard; on failure we fall back
  // to a visible-text toast so the user never loses the message.
  const handleDialogSubmit = (result: QuickActionResult) => {
    if (result.kind === 'message' && result.clipboardText) {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(result.clipboardText).catch(() => {
          setToast(`Clipboard not available. Message: ${result.clipboardText}`);
          return;
        });
      } else {
        setToast(`Clipboard not available. Message: ${result.clipboardText}`);
        return;
      }
    }
    setToast(result.message);
  };

  // Auto-dismiss the inline toast after 2.5s. The component re-mounts only
  // when the message string changes, so successive toasts reset the timer.
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const handleGenerateInsight = async () => {
    if (!onGenerateInsight) return;
    setGeneratingInsight(true);
    setInsightError(null);
    try {
      await onGenerateInsight();
    } catch (err) {
      setInsightError(err instanceof Error ? err.message : 'Could not generate insight.');
    } finally {
      setGeneratingInsight(false);
    }
  };

  return (
    <div className="detail-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`
        .detail-panel .mw-section-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-sf-fg-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 12px;
        }
      `}</style>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-sf-border-tertiary)' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-sf-fg-primary)' }}>
          Activity Insights
        </span>
      </div>
      {/* AI Insight */}
      <div
        className="e-card"
        style={{
          padding: '16px',
          borderRadius: 'var(--card-sm-radius)',
          background: 'linear-gradient(135deg, var(--color-sf-bg-brand-primary) 0%, var(--color-sf-bg-brand-secondary) 100%)',
          border: '1px solid var(--color-sf-border-brand)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>⚡</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-sf-fg-brand-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              AI Insight
            </span>
          </div>
          {/* Close (X) button — only rendered once an insight is on screen,
              so the empty/error/loading states stay clean. Calls the
              parent's `onDismissInsight` to clear the insight and fall
              back to the "Generate AI Insight" CTA. */}
          {hasInsight && onDismissInsight && (
            <button
              type="button"
              aria-label="Dismiss AI insight"
              title="Dismiss AI insight"
              onClick={onDismissInsight}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '22px',
                height: '22px',
                padding: 0,
                border: '1px solid var(--color-sf-border-brand)',
                borderRadius: '50%',
                background: 'var(--color-sf-bg-primary)',
                color: 'var(--color-sf-fg-brand-primary)',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              <span aria-hidden="true" style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1 }}>×</span>
            </button>
          )}
        </div>

        {hasInsight && (
          <>
            <div
              style={{
                fontSize: '13px',
                lineHeight: 1.5,
                color: 'var(--color-sf-fg-primary)',
                marginBottom: '12px',
                padding: '10px 12px',
                background: 'var(--color-sf-bg-primary)',
                borderRadius: '8px',
                borderLeft: '3px solid var(--color-sf-border-brand)',
                fontStyle: 'italic',
              }}
            >
              {aiInsight!.notes}
            </div>
            {aiInsight!.engagementDrop > 0 && (
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-sf-fg-error-primary)',
                  marginBottom: '12px',
                }}
              >
                Engagement dropped {aiInsight!.engagementDrop}% in {aiInsight!.quarter}
              </div>
            )}
          </>
        )}

        {generatingInsight && (
          <div style={{ fontSize: '12px', color: 'var(--color-sf-fg-secondary)', marginBottom: '12px' }}>
            Analyzing activity, pulse, and career data with AI…
          </div>
        )}

        {insightError && (
          <div style={{ fontSize: '12px', color: 'var(--color-sf-fg-error-primary)', marginBottom: '12px' }}>
            {insightError}
          </div>
        )}

        {!hasInsight && onGenerateInsight && !generatingInsight && (
          <ButtonComponent
            cssClass="e-primary e-small"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleGenerateInsight}
          >
            Generate AI Insight
          </ButtonComponent>
        )}

        {hasInsight && (
          <ButtonComponent
            cssClass="e-primary e-small"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setShowActionPlanModal(true)}
          >
            Create Action Plan
          </ButtonComponent>
        )}
      </div>

      {/* Quick Actions — always rendered, even without an AI insight, so the
          sidebar is interactive from first paint. AI-supplied actions replace
          the defaults; the `message` CTA is wired to a confirmation dialog and
          clipboard/mailto/tel fire immediately. */}
      <div>
        <SectionTitle>Quick Actions</SectionTitle>
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {quickActions.map((action) => (
            <ButtonComponent
              key={action.id}
              cssClass="e-outline e-small"
              style={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: '13px' }}
              onClick={() => handleQuickAction(action)}
            >
              {action.label}
            </ButtonComponent>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div>
        <SectionTitle>Activity Timeline</SectionTitle>
        <div style={{ marginTop: '12px' }}>
          <Timeline events={timeline} />
        </div>
      </div>

      {/* Action Plan Modal */}
      <DialogComponent
        isModal={true}
        visible={showActionPlanModal}
        header="Create Action Plan"
        showCloseIcon={true}
        closeOnEscape={true}
        width="450px"
        overlayClick={() => setShowActionPlanModal(false)}
        close={() => setShowActionPlanModal(false)}
        animationSettings={{ effect: 'Fade', duration: 200, delay: 0 }}
        buttons={[
          {
            click: () => setShowActionPlanModal(false),
            buttonModel: {
              content: 'Cancel'
            }
          },
          {
            click: () => setShowActionPlanModal(false),
            buttonModel: {
              content: 'Save Action',
              isPrimary: true
            }
          }
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-sf-fg-tertiary)', display: 'block', marginBottom: '6px' }}>
              Plan Name
            </label>
            <input
              type="text"
              placeholder="e.g., Engagement Recovery - Q3"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-sf-border-primary)',
                borderRadius: 'var(--input-md-radius)',
                fontSize: '13px',
                boxSizing: 'border-box',
                background: 'var(--color-sf-bg-primary)',
                color: 'var(--color-sf-fg-primary)',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-sf-fg-tertiary)', display: 'block', marginBottom: '6px' }}>
              Focus Areas
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {aiInsight?.actions.map((action) => (
                <label
                  key={action.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'var(--color-sf-bg-secondary)',
                    border: '1px solid var(--color-sf-border-secondary)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <input type="checkbox" defaultChecked />
                  {action.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-sf-fg-tertiary)', display: 'block', marginBottom: '6px' }}>
              Priority
            </label>
            <select
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--color-sf-border-primary)',
                borderRadius: 'var(--input-md-radius)',
                fontSize: '13px',
                background: 'var(--color-sf-bg-primary)',
                color: 'var(--color-sf-fg-primary)',
              }}
            >
              <option>High - Immediate attention needed</option>
              <option>Medium - Address within 2 weeks</option>
              <option>Low - Schedule for next month</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-sf-fg-tertiary)', display: 'block', marginBottom: '6px' }}>
              Notes
            </label>
            <textarea
              placeholder="Add context or goals for this action plan..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e4e7ec',
                borderRadius: '6px',
                fontSize: '13px',
                resize: 'vertical',
                boxSizing: 'border-box',
                background: 'var(--color-sf-bg-primary)'
              }}
            />
          </div>
        </div>
      </DialogComponent>

      {/* Quick Action confirmation dialog — moved out of this file into
          `QuickActionDialog`. The parent stays in charge of the toast
          surface and the clipboard side-effect, so clipboard and dialog
          confirmations share a single feedback channel. */}
      <QuickActionDialog
        activeCta={activeCta}
        defaultEmployeeId={defaultEmployeeId}
        onClose={() => setActiveCta(null)}
        onSubmit={handleDialogSubmit}
        
      />

      {/* Lightweight inline toast for clipboard / mailto / tel confirmations
          that bypass the dialog. Auto-dismisses after 2.5s. Positioned at
          the bottom of the panel so it doesn't overlap the AI insight card.
          Dialog submissions surface through the Syncfusion `<ToastComponent>`
          in the parent `Overview` screen via `onShowToast`. */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          onClick={() => setToast(null)}
          style={{
            position: 'sticky',
            bottom: 0,
            marginTop: '8px',
            padding: '10px 12px',
            background: 'var(--color-sf-bg-primary)',
            border: '1px solid var(--color-sf-border-brand)',
            borderLeft: '3px solid var(--color-sf-border-brand)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--color-sf-fg-primary)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
          }}
        >
          {toast}
        </div>
      )}

    </div>
  );
};
