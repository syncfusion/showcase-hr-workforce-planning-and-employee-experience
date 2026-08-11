// Quick Action confirmation dialog — a single modal that handles every CTA
// kind emitted by the AI insight card (Schedule 1:1, Send Recognition, Assign
// Training, Request Pulse Check) plus a generic `message` fallback for
// AI-supplied actions that don't map to a known form.
//
// Why one component:
//   All five flows share the same shell — header, employee picker (where
//   applicable), form fields, and a footer with Cancel + primary action.
//   Splitting them into five files would be 5× the boilerplate with no
//   readability win. Instead the file is organised top-to-bottom in the
//   order the eye scans it: types → constants → form state → render
//   helpers → component.
//
// Why an explicit `onSubmit` callback instead of an internal toast:
//   The parent (DetailPanel) owns the sticky toast so clipboard, mailto,
//   and tel CTAs — which never open this dialog — share the same surface
//   as dialog confirmations. Lifting the toast up keeps "user feedback
//   after a CTA" in one place.

import React, { useRef, useState } from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import {
  RECOGNITION_TYPES,
  RECOGNITION_VALUES,
  RECOGNITION_VISIBILITY,
} from '../../EmployeeExperience/employeeExperienceConfig';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type QuickActionKind =
  | 'schedule-1on1'
  | 'recognition'
  | 'training'
  | 'pulse'
  | 'clipboard'
  | 'message';

export interface QuickAction {
  id: string;
  label: string;
  kind: QuickActionKind;
  // Generic message-only fields used for AI-provided actions.
  title?: string;
  body?: string;
  // Clipboard CTA payload.
  value?: string;
}

// Payload returned by `onSubmit`. The parent decides what to do with it
// (typically: show a toast).
export interface QuickActionResult {
  kind: QuickActionKind;
  message: string;
  // For `message` kind, the text that was just copied to the clipboard.
  clipboardText?: string;
}

export interface QuickActionDialogProps {
  activeCta: QuickAction | null;
  /** Preferred employee for the dialog's recipient picker. */
  defaultEmployeeId?: string;
  onClose: () => void;
  onSubmit: (result: QuickActionResult) => void;
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

// Shared employee directory — mirrors `RecognitionSection.PEERS` so the two
// screens agree on the same set of demo employees.
const PEER_DIRECTORY: { id: string; name: string }[] = [
  { id: 'emp_4502', name: 'Marcus Lee' },
  { id: 'emp_4530', name: 'Priya Nair' },
  { id: 'emp_4490', name: 'John Williams' },
  { id: 'emp_4555', name: 'Sofia Garcia' },
  { id: 'emp_4560', name: 'Liam Becker' },
];

const TRAINING_COURSES: { value: string; label: string }[] = [
  { value: 'leadership-101', label: 'Leadership 101' },
  { value: 'feedback-coaching', label: 'Feedback & Coaching' },
  { value: 'effective-1on1s', label: 'Effective 1:1s' },
  { value: 'psychological-safety', label: 'Psychological Safety' },
  { value: 'difficult-conversations', label: 'Difficult Conversations' },
];

const PULSE_CADENCES: { value: string; label: string }[] = [
  { value: 'one-time', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];

// Maps each kind to the header shown at the top of the dialog. Falls back to
// the CTA's own title/label so AI-supplied actions get a sensible heading.
const HEADER_FOR_KIND: Partial<Record<QuickActionKind, string>> = {
  'schedule-1on1': 'Schedule 1:1',
  recognition: 'Send Recognition',
  training: 'Assign Training',
  pulse: 'Request Pulse Check',
};

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface CtaFormState {
  employeeId: string;
  // 1:1
  meetingDate: string;
  meetingTime: string;
  agenda: string;
  // Recognition
  recognitionType: string;
  recognitionValue: string;
  recognitionVisibility: string;
  recognitionMessage: string;
  // Training
  trainingCourse: string;
  trainingDueDate: string;
  // Pulse
  pulseCadence: string;
  pulseQuestions: string;
}

const buildEmptyForm = (defaultEmployeeId: string): CtaFormState => ({
  employeeId: defaultEmployeeId,
  meetingDate: '',
  meetingTime: '',
  agenda: '',
  recognitionType: RECOGNITION_TYPES[0].value,
  recognitionValue: RECOGNITION_VALUES[0],
  recognitionVisibility: RECOGNITION_VISIBILITY[0].value,
  recognitionMessage: '',
  trainingCourse: TRAINING_COURSES[0].value,
  trainingDueDate: '',
  pulseCadence: PULSE_CADENCES[0].value,
  pulseQuestions: '',
});

// ---------------------------------------------------------------------------
// Visual tokens — pulled out of the JSX so the rendering helpers below stay
// short and the tokens can be tweaked in one place.
// ---------------------------------------------------------------------------

const FIELD_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--color-sf-border-primary)',
  borderRadius: 'var(--input-md-radius)',
  fontSize: '13px',
  boxSizing: 'border-box',
  background: 'var(--color-sf-bg-primary)',
  color: 'var(--color-sf-fg-primary)',
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-sf-fg-tertiary)',
  display: 'block',
  marginBottom: '6px',
};

// Reusable <label> + <input/textarea> row.
const Field: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div>
    <label style={LABEL_STYLE}>{label}</label>
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// Form-body sub-components
// ---------------------------------------------------------------------------
// Each is a small pure function of the current form state + an updater.
// They live outside the main component so re-renders of the parent don't
// re-create them on every keystroke.

interface FormSectionProps {
  form: CtaFormState;
  update: (patch: Partial<CtaFormState>) => void;
}

const EmployeePicker: React.FC<FormSectionProps> = ({ form, update }) => (
  <Field label="Employee">
    <DropDownListComponent
      dataSource={PEER_DIRECTORY.map((p) => ({ text: p.name, value: p.id }))}
      fields={{ text: 'text', value: 'value' }}
      value={form.employeeId}
      change={(e: { value: string }) => update({ employeeId: e.value })}
      placeholder="Select an employee"
      cssClass="e-outline"
    />
  </Field>
);

const OneOnOneFields: React.FC<FormSectionProps> = ({ form, update }) => (
  <>
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ flex: 1 }}>
        <Field label="Date">
          <input
            type="date"
            value={form.meetingDate}
            onChange={(e) => update({ meetingDate: e.target.value })}
            style={FIELD_STYLE}
          />
        </Field>
      </div>
      <div style={{ flex: 1 }}>
        <Field label="Time">
          <input
            type="time"
            value={form.meetingTime}
            onChange={(e) => update({ meetingTime: e.target.value })}
            style={FIELD_STYLE}
          />
        </Field>
      </div>
    </div>
    <Field label="Agenda">
      <textarea
        rows={3}
        placeholder="What would you like to cover?"
        value={form.agenda}
        onChange={(e) => update({ agenda: e.target.value })}
        style={{ ...FIELD_STYLE, resize: 'vertical' }}
      />
    </Field>
  </>
);

const RecognitionFields: React.FC<FormSectionProps> = ({ form, update }) => (
  <>
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ flex: 1 }}>
        <Field label="Type">
          <DropDownListComponent
            dataSource={RECOGNITION_TYPES.map((t) => t.value)}
            value={form.recognitionType}
            change={(e: { value: string }) => update({ recognitionType: e.value })}
            cssClass="e-outline"
            placeholder="Recognition type"
          />
        </Field>
      </div>
      <div style={{ flex: 1 }}>
        <Field label="Company Value">
          <DropDownListComponent
            dataSource={RECOGNITION_VALUES}
            value={form.recognitionValue}
            change={(e: { value: string }) => update({ recognitionValue: e.value })}
            cssClass="e-outline"
            placeholder="Pick a value"
          />
        </Field>
      </div>
    </div>
    <Field label="Audience">
      <DropDownListComponent
        dataSource={RECOGNITION_VISIBILITY.map((v) => v.value)}
        value={form.recognitionVisibility}
        change={(e: { value: string }) => update({ recognitionVisibility: e.value })}
        cssClass="e-outline"
        placeholder="Who can see this"
      />
    </Field>
    <Field label="Message">
      <textarea
        rows={3}
        placeholder="Why is this person worth recognizing?"
        value={form.recognitionMessage}
        onChange={(e) => update({ recognitionMessage: e.target.value })}
        style={{ ...FIELD_STYLE, resize: 'vertical' }}
      />
    </Field>
  </>
);

const TrainingFields: React.FC<FormSectionProps> = ({ form, update }) => (
  <>
    <Field label="Course">
      <DropDownListComponent
        dataSource={TRAINING_COURSES.map((c) => c.value)}
        value={form.trainingCourse}
        change={(e: { value: string }) => update({ trainingCourse: e.value })}
        cssClass="e-outline"
        placeholder="Pick a course"
      />
    </Field>
    <Field label="Due Date">
      <input
        type="date"
        value={form.trainingDueDate}
        onChange={(e) => update({ trainingDueDate: e.target.value })}
        style={FIELD_STYLE}
      />
    </Field>
  </>
);

const PulseFields: React.FC<FormSectionProps> = ({ form, update }) => (
  <>
    <Field label="Cadence">
      <DropDownListComponent
        dataSource={PULSE_CADENCES.map((c) => c.value)}
        value={form.pulseCadence}
        change={(e: { value: string }) => update({ pulseCadence: e.value })}
        cssClass="e-outline"
        placeholder="How often?"
      />
    </Field>
    <Field label="Questions (optional)">
      <textarea
        rows={3}
        placeholder="What would you like the employee to reflect on?"
        value={form.pulseQuestions}
        onChange={(e) => update({ pulseQuestions: e.target.value })}
        style={{ ...FIELD_STYLE, resize: 'vertical' }}
      />
    </Field>
  </>
);

const MessagePreview: React.FC<{ cta: QuickAction }> = ({ cta }) => (
  <Field label="Message">
    <div
      style={{
        fontSize: '13px',
        lineHeight: 1.5,
        color: 'var(--color-sf-fg-primary)',
        padding: '10px 12px',
        background: 'var(--color-sf-bg-secondary)',
        border: '1px solid var(--color-sf-border-secondary)',
        borderRadius: '6px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {cta.body ?? cta.label}
    </div>
  </Field>
);

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

interface ValidationResult {
  ok: boolean;
  // Confirmation toast text when `ok`.
  toast: string;
}

const validateAndCompose = (
  cta: QuickAction,
  form: CtaFormState,
): ValidationResult => {
  const peer = PEER_DIRECTORY.find((p) => p.id === form.employeeId);
  const peerName = peer?.name ?? 'the selected employee';

  switch (cta.kind) {
    case 'schedule-1on1':
      if (!form.meetingDate || !form.meetingTime) {
        return { ok: false, toast: 'Please pick a date and time for the 1:1.' };
      }
      return {
        ok: true,
        toast: `1:1 invitation drafted for ${peerName} on ${form.meetingDate} at ${form.meetingTime}.`,
      };

    case 'recognition':
      if (!form.recognitionMessage.trim()) {
        return { ok: false, toast: 'Please add a short recognition message.' };
      }
      return {
        ok: true,
        toast: `Recognition sent to ${peerName} (${form.recognitionValue}).`,
      };

    case 'training':
      if (!form.trainingDueDate) {
        return { ok: false, toast: 'Please pick a due date for the training.' };
      }
      return {
        ok: true,
        toast: `${form.trainingCourse} assigned to ${peerName} (due ${form.trainingDueDate}).`,
      };

    case 'pulse':
      return {
        ok: true,
        toast: `Pulse ${form.pulseCadence} survey queued for ${peerName}.`,
      };

    case 'message':
    default:
      return {
        ok: true,
        toast: 'Message copied to clipboard.',
      };
  }
};

// ---------------------------------------------------------------------------
// Form body
// ---------------------------------------------------------------------------
// Owns the per-CTA form state. Re-keyed on `cta.id` by the parent so a new
// mount happens on every open, which gives us a clean form without
// resorting to a setState-in-effect reset.

interface CtaFormBodyProps {
  cta: QuickAction;
  defaultEmployeeId: string;
  onSubmit: (result: QuickActionResult) => void;
  onClose: () => void;
  /**
   * Mutable handle the parent uses to invoke `submit` from its
   * `footerTemplate`. We expose a ref rather than a `submit` prop so
   * the parent can wire its own `ButtonComponent` to the action
   * without re-rendering the form body on every keystroke.
   */
  submitRef: React.MutableRefObject<(() => void) | null>;
}

const CtaFormBody: React.FC<CtaFormBodyProps> = ({
  cta,
  defaultEmployeeId,
  onSubmit,
  onClose,
  submitRef,
}) => {
  const [form, setForm] = useState<CtaFormState>(() => buildEmptyForm(defaultEmployeeId));
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<CtaFormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const submit = () => {
    const result = validateAndCompose(cta, form);
    if (!result.ok) {
      setError(result.toast);
      return;
    }
    setError(null);
    onSubmit({
      kind: cta.kind,
      message: result.toast,
      clipboardText: cta.kind === 'message' ? cta.body ?? cta.label : undefined,
    });
    onClose();
  };

  // Publish the latest `submit` to the parent on every render. The
  // `footerTemplate` buttons read it through `submitRef.current()`.
  submitRef.current = submit;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px' }}>
      {cta.kind === 'message' ? (
        <MessagePreview cta={cta} />
      ) : (
        <>
          <EmployeePicker form={form} update={update} />
          {cta.kind === 'schedule-1on1' && <OneOnOneFields form={form} update={update} />}
          {cta.kind === 'recognition' && <RecognitionFields form={form} update={update} />}
          {cta.kind === 'training' && <TrainingFields form={form} update={update} />}
          {cta.kind === 'pulse' && <PulseFields form={form} update={update} />}
        </>
      )}

      {error && (
        <div role="alert" style={{ fontSize: '12px', color: 'var(--color-sf-fg-error-primary)' }}>
          {error}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const QuickActionDialog: React.FC<QuickActionDialogProps> = ({
  activeCta,
  defaultEmployeeId,
  onClose,
  onSubmit,
}) => {
  const resolvedDefaultEmployeeId =
    defaultEmployeeId && PEER_DIRECTORY.some((p) => p.id === defaultEmployeeId)
      ? defaultEmployeeId
      : PEER_DIRECTORY[0].id;

  const header =
    (activeCta && HEADER_FOR_KIND[activeCta.kind]) ??
    activeCta?.title ??
    activeCta?.label ??
    'Quick Action';

  // Handle the form body exposes via a ref so the footerTemplate
  // (which lives on the parent DialogComponent) can trigger the same
  // validation + onSubmit + onClose chain that used to live inline.
  const submitRef = useRef<(() => void) | null>(null);

  const primaryLabel = activeCta?.kind === 'message' ? 'Copy & Close' : 'Send';

  const footerTemplate = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        paddingTop: '12px',
        borderTop: '1px solid var(--color-sf-border-tertiary)',
      }}
    >
      <ButtonComponent cssClass="e-outline e-small" onClick={onClose}>
        Cancel
      </ButtonComponent>
      <ButtonComponent
        cssClass="e-primary e-small"
        onClick={() => submitRef.current?.()}
      >
        {primaryLabel}
      </ButtonComponent>
    </div>
  );

  if (!activeCta) return null;

  const content = () => {
    return (
      <CtaFormBody
        key={activeCta.id}
        cta={activeCta}
        defaultEmployeeId={resolvedDefaultEmployeeId}
        onSubmit={onSubmit}
        onClose={onClose}
        submitRef={submitRef}
      />
    );
  };
  

  return (
    <DialogComponent
      isModal={true}
      visible={Boolean(activeCta)}
      header={header}
      showCloseIcon={true}
      closeOnEscape={true}
      width="460px"
      overlayClick={onClose}
      close={onClose}
      footerTemplate={footerTemplate as any}
      content={content as any}
      animationSettings={{ effect: 'Fade', duration: 200, delay: 0 }}
    >
    </DialogComponent>
  );
};
