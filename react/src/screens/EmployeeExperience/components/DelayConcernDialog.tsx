import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent, TextAreaComponent } from '@syncfusion/ej2-react-inputs';
import { NumericTextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { createDelayConcern } from '../../../services/employeeExperienceService';
import {
  DELAY_RELATED_TYPES,
  SEVERITY_OPTIONS,
} from '../employeeExperienceConfig';
import type { DelayRelatedEntityType } from '../../../types';

const emptyForm = {
  relatedEntityType: 'self-service' as DelayRelatedEntityType,
  relatedEntityId: '',
  subject: '',
  details: '',
  daysWaiting: 1,
  expectedSlackDays: '',
  severity: 'medium' as 'low' | 'medium' | 'high',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DelayConcernDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<DialogComponent | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mirror the latest form into a ref so handleSubmit (used by DialogComponent
  // buttons, which is memoized independently) always reads the current values
  // and never a stale closure of the first render.
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const handleReset = useCallback(() => {
    setForm({ ...emptyForm });
    setError(null);
    setSuccess(false);
    setSubmitting(false);
  }, []);

  const handleOpen = useCallback(() => {
    dialogRef.current?.show();
  }, []);

  const handleCloseFn = useCallback(() => {
    if (submitting) return;
    handleReset();
    dialogRef.current?.hide();
    onClose();
  }, [submitting, handleReset, onClose]);

  useEffect(() => {
    if (isOpen) {
      handleReset();
      setTimeout(() => handleOpen(), 0);
    } else {
      dialogRef.current?.hide();
    }
  }, [isOpen, handleReset, handleOpen]);

  const handleSubmit = useCallback(async () => {
    // Belt-and-braces: read live DOM first (catches paste / IME-commit /
    // numeric-step cases that the EJ2 wrapper's events may miss before
    // submit), then fall back to the ref, then to React state.
    const subject =
      (document.getElementById('delay-subject') as HTMLInputElement | null)?.value ??
      formRef.current.subject;
    const details =
      (document.getElementById('delay-details') as HTMLTextAreaElement | null)?.value ??
      formRef.current.details;
    const relatedEntityId =
      (document.getElementById('delay-entity-id') as HTMLInputElement | null)?.value ??
      formRef.current.relatedEntityId;

    const daysRaw =
      (document.getElementById('delay-days') as HTMLInputElement | null)?.value;
    const daysWaitingParsed = daysRaw === undefined || daysRaw === '' ? NaN : Number(daysRaw);
    const daysWaiting = Number.isFinite(daysWaitingParsed)
      ? daysWaitingParsed
      : formRef.current.daysWaiting;

    const slackRaw =
      (document.getElementById('delay-slack') as HTMLInputElement | null)?.value;
    const expectedSlackDays = slackRaw && slackRaw.trim() !== '' ? slackRaw : '';

    const live = {
      ...formRef.current,
      subject,
      details,
      relatedEntityId,
      daysWaiting,
      expectedSlackDays,
    };

    if (!live.subject.trim() || !live.details.trim()) {
      setError('Subject and details are required');
      return;
    }
    if (live.daysWaiting < 0) {
      setError('Days waiting must be a non-negative number');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createDelayConcern({
        ...live,
        relatedEntityId: live.relatedEntityId || null,
        expectedSlackDays: live.expectedSlackDays
          ? Number(live.expectedSlackDays)
          : null,
      });
      setSuccess(true);
      setTimeout(() => {
        handleCloseFn();
      }, 1200);
    } catch {
      setError('Failed to submit delay concern');
    } finally {
      setSubmitting(false);
    }
  }, [handleCloseFn]);

  const update = (patch: Partial<typeof emptyForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const buttons = useMemo(
    () => [
      {
        buttonModel: { content: 'Cancel', cssClass: 'e-flat', disabled: submitting },
        click: () => handleCloseFn(),
      },
      {
        buttonModel: { content: submitting ? 'Submitting…' : 'Raise Concern', cssClass: 'e-flat e-primary', isPrimary: true, disabled: submitting },
        click: () => handleSubmit(),
      },
    ],
    [submitting, handleCloseFn, handleSubmit]
  );

  const content = useMemo(() => {
    if (success) {
      return (
        <p style={{ color: '#28A745', textAlign: 'center', padding: 24 }} role="status">
          ✅ Delay concern raised. It has been added to the Kanban board and People Ops has been notified.
        </p>
      );
    }
    return (
      <div className="ee-form">
        <div className="ee-field">
          <label htmlFor="delay-type">Related To</label>
          <DropDownListComponent
            id="delay-type"
            dataSource={DELAY_RELATED_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            fields={{ text: 'label', value: 'value' }}
            value={form.relatedEntityType}
            change={(e) => update({ relatedEntityType: (e.value as DelayRelatedEntityType) })}
          />
        </div>
        <div className="ee-field">
          <label htmlFor="delay-entity-id">Related ID (optional)</label>
          <TextBoxComponent
            id="delay-entity-id"
            value={form.relatedEntityId}
            input={(e) => update({ relatedEntityId: (e as any).value ?? '' })}
            change={(e) => update({ relatedEntityId: (e as any).value ?? '' })}
            placeholder="e.g., ssr_1024"
          />
        </div>
        <div className="ee-field full">
          <label htmlFor="delay-subject">Subject</label>
          <TextBoxComponent
            id="delay-subject"
            value={form.subject}
            input={(e) => update({ subject: (e as any).value ?? '' })}
            change={(e) => update({ subject: (e as any).value ?? '' })}
          />
        </div>
        <div className="ee-field full">
          <label htmlFor="delay-details">Details</label>
          <TextAreaComponent
            id="delay-details"
            value={form.details}
            input={(e) => update({ details: (e as any).value ?? '' })}
            change={(e) => update({ details: (e as any).value ?? '' })}
            rows={3}
          />
        </div>
        <div className="ee-field">
          <label htmlFor="delay-days">Days Waiting</label>
          <NumericTextBoxComponent
            id="delay-days"
            value={form.daysWaiting}
            min={0}
            change={(e) => update({ daysWaiting: typeof e.value === 'number' ? e.value : 0 })}
          />
        </div>
        <div className="ee-field">
          <label htmlFor="delay-slack">Expected SLA Days (optional)</label>
          <NumericTextBoxComponent
            id="delay-slack"
            value={form.expectedSlackDays === '' ? undefined : Number(form.expectedSlackDays)}
            min={0}
            format="n0"
            change={(e) => update({ expectedSlackDays: typeof e.value === 'number' ? String(e.value) : '' })}
          />
        </div>
        <div className="ee-field">
          <label htmlFor="delay-severity">Severity</label>
          <DropDownListComponent
            id="delay-severity"
            dataSource={SEVERITY_OPTIONS.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
            fields={{ text: 'label', value: 'value' }}
            value={form.severity}
            change={(e) => update({ severity: (e.value as typeof form.severity) })}
          />
        </div>
        {error && (
          <div className="ee-field full">
            <span className="error" role="alert">{error}</span>
          </div>
        )}
      </div>
    );
  }, [form, error, success]);

  return (
    <DialogComponent
      ref={dialogRef}
      header="⏱ Raise a Delay Concern"
      width="500px"
      visible={false}
      isModal={true}
      showCloseIcon={true}
      closeOnEscape={true}
      buttons={success ? [] : buttons}
    >
      {content}
    </DialogComponent>
  );
};
