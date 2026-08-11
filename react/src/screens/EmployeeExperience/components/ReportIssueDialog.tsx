import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { TextBoxComponent, TextAreaComponent } from '@syncfusion/ej2-react-inputs';
import { createIssueReport } from '../../../services/employeeExperienceService';
import {
  ISSUE_CATEGORIES,
  PRIORITY_OPTIONS,
  PRIORITY_LABELS,
} from '../employeeExperienceConfig';
import type { IssueCategory } from '../../../types';

const emptyForm = {
  category: 'system-rendering' as IssueCategory,
  subject: '',
  description: '',
  url: '',
  browser: '',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportIssueDialog: React.FC<Props> = ({ isOpen, onClose }) => {
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
    // Belt-and-braces: read live DOM first (catches paste / IME-commit cases
    // that the EJ2 wrapper's `input` event may miss before submit), then fall
    // back to the ref, then to React state.
    const subject =
      (document.getElementById('issue-subject') as HTMLInputElement | null)?.value ??
      formRef.current.subject;
    const description =
      (document.getElementById('issue-desc') as HTMLTextAreaElement | null)?.value ??
      formRef.current.description;
    const url =
      (document.getElementById('issue-url') as HTMLInputElement | null)?.value ??
      formRef.current.url;
    const browser =
      (document.getElementById('issue-browser') as HTMLInputElement | null)?.value ??
      formRef.current.browser;

    const live = { ...formRef.current, subject, description, url, browser };
    if (!live.subject.trim() || !live.description.trim()) {
      setError('Subject and description are required');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createIssueReport(live);
      setSuccess(true);
      setTimeout(() => {
        handleCloseFn();
      }, 1200);
    } catch {
      setError('Failed to submit issue report');
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
        buttonModel: { content: submitting ? 'Submitting…' : 'Submit Issue', cssClass: 'e-flat e-primary', isPrimary: true, disabled: submitting },
        click: () => handleSubmit(),
      },
    ],
    [submitting, handleCloseFn, handleSubmit]
  );

  const content = useMemo(() => {
    if (success) {
      return (
        <p style={{ color: '#28A745', textAlign: 'center', padding: 24 }} role="status">
          ✅ Issue report submitted. It has been added to the Kanban board.
        </p>
      );
    }
    return (
      <div className="ee-form">
        <div className="ee-field">
          <label htmlFor="issue-category">Category</label>
          <DropDownListComponent
            id="issue-category"
            dataSource={ISSUE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            fields={{ text: 'label', value: 'value' }}
            value={form.category}
            change={(e) => update({ category: (e.value as IssueCategory) })}
          />
        </div>
        <div className="ee-field">
          <label htmlFor="issue-priority">Priority</label>
          <DropDownListComponent
            id="issue-priority"
            dataSource={PRIORITY_OPTIONS.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))}
            fields={{ text: 'label', value: 'value' }}
            value={form.priority}
            change={(e) => update({ priority: (e.value as typeof form.priority) })}
          />
        </div>
        <div className="ee-field full">
          <label htmlFor="issue-subject">Subject</label>
          <TextBoxComponent
            id="issue-subject"
            value={form.subject}
            input={(e) => update({ subject: (e as any).value ?? '' })}
            change={(e) => update({ subject: (e as any).value ?? '' })}
          />
        </div>
        <div className="ee-field full">
          <label htmlFor="issue-desc">Description</label>
          <TextAreaComponent
            id="issue-desc"
            value={form.description}
            input={(e) => update({ description: (e as any).value ?? '' })}
            change={(e) => update({ description: (e as any).value ?? '' })}
            rows={3}
          />
        </div>
        <div className="ee-field">
          <label htmlFor="issue-url">Page URL (optional)</label>
          <TextBoxComponent
            id="issue-url"
            value={form.url}
            input={(e) => update({ url: (e as any).value ?? '' })}
            change={(e) => update({ url: (e as any).value ?? '' })}
          />
        </div>
        <div className="ee-field">
          <label htmlFor="issue-browser">Browser (optional)</label>
          <TextBoxComponent
            id="issue-browser"
            value={form.browser}
            input={(e) => update({ browser: (e as any).value ?? '' })}
            change={(e) => update({ browser: (e as any).value ?? '' })}
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
      header="⚠ Report an Issue"
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
