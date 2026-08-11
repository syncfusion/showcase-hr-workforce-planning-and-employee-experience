import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent, TextAreaComponent } from '@syncfusion/ej2-react-inputs';
import { createSelfServiceRequest } from '../../../services/employeeExperienceService';
import {
  SELF_SERVICE_TYPES,
  PRIORITY_OPTIONS,
  PRIORITY_LABELS,
} from '../employeeExperienceConfig';
import type { SelfServiceType } from '../../../types';

const emptyForm = {
  type: 'address-change' as SelfServiceType,
  subject: '',
  details: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const SelfServiceRequestDialog: React.FC<Props> = ({ isOpen, onClose, onSubmitted }) => {
  const dialogRef = useRef<DialogComponent | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const ssTypeData = useMemo(
    () => SELF_SERVICE_TYPES.map((t) => ({ value: t.value, label: t.label })),
    []
  );
  const ssPriorityData = useMemo(
    () =>
      PRIORITY_OPTIONS.filter((p) => p !== 'critical').map((p) => ({
        value: p,
        label: PRIORITY_LABELS[p] ?? p,
      })),
    []
  );

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

  // We read the latest form via a ref at submit time. Reason: the EJ2
  // `<DialogComponent>` `buttons` array is a `useMemo`-cached config; if the
  // submit handler closes over `form` directly, a stale closure can fire when
  // the user clicks Submit (see the sibling report-issue / delay-concern
  // dialogs for the same pattern). Reading through a ref guarantees we always
  // see the most recent typed value, even if the React render cycle hasn't
  // re-memoized the buttons yet.
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    // Pull the freshest values: in case the React state hasn't propagated
    // through the buttons memo (or the user pasted / IME-completed in the
    // last keystroke), also read the live DOM. The EJ2 wrapper mirrors the
    // value into the underlying input/textarea element.
    const live = {
      type: formRef.current.type,
      priority: formRef.current.priority,
      subject:
        (document.getElementById('ss-subject') as HTMLInputElement | null)?.value ??
        formRef.current.subject,
      details:
        (document.getElementById('ss-details') as HTMLTextAreaElement | null)?.value ??
        formRef.current.details,
    };
    if (!live.subject.trim() || !live.details.trim()) {
      setError('Subject and details are required');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createSelfServiceRequest(live);
      setSuccess(true);
      onSubmitted?.();
      setTimeout(() => {
        handleCloseFn();
      }, 1200);
    } catch {
      setError('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }, [onSubmitted, handleCloseFn]);

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
        buttonModel: {
          content: submitting ? 'Submitting…' : 'Submit Request',
          cssClass: 'e-flat e-primary',
          isPrimary: true,
          disabled: submitting,
        },
        click: () => {
          void handleSubmit();
        },
      },
    ],
    [submitting, handleCloseFn, handleSubmit]
  );

  const content = useMemo(() => {
    if (success) {
      return (
        <p style={{ color: '#28A745', textAlign: 'center', padding: 24 }} role="status">
          ✅ Request submitted. HR has been notified and will route it to the right team.
        </p>
      );
    }
    return (
      <div className="ee-form">
        <div className="ee-field">
          <label htmlFor="ss-type">Type</label>
          <DropDownListComponent
            id="ss-type"
            dataSource={ssTypeData}
            fields={{ text: 'label', value: 'value' }}
            value={form.type}
            change={(e) => update({ type: e.value as SelfServiceType })}
            placeholder="Select type"
          />
        </div>
        <div className="ee-field">
          <label htmlFor="ss-priority">Priority</label>
          <DropDownListComponent
            id="ss-priority"
            dataSource={ssPriorityData}
            fields={{ text: 'label', value: 'value' }}
            value={form.priority}
            change={(e) => update({ priority: e.value as typeof form.priority })}
            placeholder="Select priority"
          />
        </div>
        <div className="ee-field full">
          <label htmlFor="ss-subject">Subject</label>
          <TextBoxComponent
            id="ss-subject"
            value={form.subject}
            // Use the per-keystroke `input` event (EJ2 fires `change` only on
            // focus-out, so the form would be empty when the user clicks
            // Submit while still focused). Mirrors the Angular fix in
            // self-service-request-dialog.component.html where ngModel drives
            // the wrapper and the DOM is never written back from state.
            input={(e) => update({ subject: (e as any).value ?? '' })}
            change={(e) => update({ subject: (e as any).value ?? '' })}
            placeholder="Short summary, e.g. Update home address"
          />
        </div>
        <div className="ee-field full">
          <label htmlFor="ss-details">Details</label>
          <TextAreaComponent
            id="ss-details"
            value={form.details}
            // See `ss-subject` above — `input` fires per keystroke; `change`
            // only fires on blur and leaves the form empty on submit.
            input={(e) => update({ details: (e as any).value ?? '' })}
            change={(e) => update({ details: (e as any).value ?? '' })}
            placeholder="Add the context HR needs to action this quickly"
            rows={4}
          />
        </div>
        {error && (
          <div className="ee-field full">
            <span className="error" role="alert">{error}</span>
          </div>
        )}
      </div>
    );
  }, [form, error, success, ssTypeData, ssPriorityData]);

  return (
    <DialogComponent
      ref={dialogRef}
      header="✍️ New Self-Service Request"
      width="520px"
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
