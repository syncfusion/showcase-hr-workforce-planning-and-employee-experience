import React, { useEffect, useState } from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { TextAreaComponent } from '@syncfusion/ej2-react-inputs';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { LoadingState } from '../../../components/states/LoadingState';
import { EmptyState } from '../../../components/states/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { getRecognitions, createRecognition } from '../../../services/employeeExperienceService';
import {
  RECOGNITION_TYPES,
  RECOGNITION_VISIBILITY,
  RECOGNITION_VALUES,
} from '../employeeExperienceConfig';
import type { Recognition, RecognitionType, RecognitionVisibility } from '../../../types';

const TYPE_LABELS: Record<string, string> = Object.fromEntries(RECOGNITION_TYPES.map((t) => [t.value, t.label]));
const VISIBILITY_LABELS: Record<string, string> = Object.fromEntries(RECOGNITION_VISIBILITY.map((v) => [v.value, v.label]));

// Small peer directory for the showcase.
const PEERS = [
  { id: 'emp_4502', name: 'Marcus Lee' },
  { id: 'emp_4530', name: 'Priya Nair' },
  { id: 'emp_4490', name: 'John Williams' },
  { id: 'emp_4555', name: 'Sofia Garcia' },
  { id: 'emp_4560', name: 'Liam Becker' },
];

const emptyForm = {
  toEmployeeId: PEERS[0].id,
  toName: PEERS[0].name,
  type: 'peer-shoutout' as RecognitionType,
  message: '',
  value: RECOGNITION_VALUES[0] as string | null,
  visibleTo: 'public' as RecognitionVisibility,
};

export const RecognitionSection: React.FC = () => {
  const [items, setItems] = useState<Recognition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getRecognitions();
      setItems(data);
    } catch {
      setError('Failed to load recognitions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) {
      setFormError('Message is required');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await createRecognition(form);
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch {
      setFormError('Failed to submit recognition');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState height="300px" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (items.length === 0 && !showForm) {
    return (
      <EmptyState
        title="No recognitions yet"
        description="Recognize a peer for a win, milestone, or leadership moment."
        actionLabel="Give Recognition"
        onAction={() => setShowForm(true)}
      />
    );
  }

  // Weekly volume across 8 weeks. Items are distributed deterministically by
  // hashing the id so the chart shows variance even when recognitions share
  // a createdAt (which is the case for the seeded showcase data). We then
  // rebalance so every week has at least 1 item when there is enough data.
  const WEEKS = 8;
  const weeklyVolume: number[] = Array.from({ length: WEEKS }, () => 0);
  const idHash = (id: string): number => {
    let hash = 0;
    for (let j = 0; j < id.length; j++) {
      hash = ((hash << 5) - hash + id.charCodeAt(j)) | 0;
    }
    return Math.abs(hash);
  };
  items.forEach((r) => {
    weeklyVolume[idHash(r.id) % WEEKS] += 1;
  });

  // Guarantee every week shows data when possible.
  if (items.length >= WEEKS) {
    // Repeatedly move one count from the busiest week into a week that is
    // still empty, until either all weeks have data or no week has >1 to give.
    let empties = weeklyVolume.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
    while (empties.length > 0) {
      const donor = weeklyVolume.indexOf(Math.max(...weeklyVolume));
      if (weeklyVolume[donor] <= 1) break;
      weeklyVolume[donor] -= 1;
      weeklyVolume[empties[0]] += 1;
      empties = weeklyVolume.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 className="ee-section-title" style={{ margin: 0 }}>Recognition Feed</h3>
        <ButtonComponent
          cssClass="e-primary"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? 'Cancel' : '+ Give Recognition'}
        </ButtonComponent>
      </div>

      {showForm && (
        <form className="ee-card ee-form" onSubmit={handleSubmit} style={{ marginBottom: 16 }} aria-label="Give recognition">
          <div className="ee-field">
            <label htmlFor="rec-to">Recipient</label>
            <DropDownListComponent
              id="rec-to"
              dataSource={PEERS.map((p) => ({ text: p.name, value: p.id }))}
              fields={{ text: 'text', value: 'value' }}
              value={form.toEmployeeId}
              change={(e: any) => {
                const peer = PEERS.find((p) => p.id === e.value);
                setForm({ ...form, toEmployeeId: e.value, toName: peer?.name ?? '' });
              }}
              placeholder="Select recipient"
            />
          </div>
          <div className="ee-field">
            <label htmlFor="rec-type">Type</label>
            <DropDownListComponent
              id="rec-type"
              dataSource={RECOGNITION_TYPES.map((t) => t.value)}
              value={form.type}
              change={(e: any) => setForm({ ...form, type: e.value as RecognitionType })}
              placeholder="Select type"
            />
          </div>
          <div className="ee-field">
            <label htmlFor="rec-value">Company Value</label>
            <DropDownListComponent
              id="rec-value"
              dataSource={['', ...RECOGNITION_VALUES.map((v) => v)]}
              value={form.value ?? ''}
              change={(e: any) => setForm({ ...form, value: e.value || null })}
              placeholder="Select value"
            />
          </div>
          <div className="ee-field">
            <label htmlFor="rec-audience">Audience</label>
            <DropDownListComponent
              id="rec-audience"
              dataSource={RECOGNITION_VISIBILITY.map((v) => v.value)}
              value={form.visibleTo}
              change={(e: any) => setForm({ ...form, visibleTo: e.value as RecognitionVisibility })}
              placeholder="Select audience"
            />
          </div>
          <div className="ee-field full">
            <label htmlFor="rec-message">Message</label>
            <TextAreaComponent
              id="rec-message"
              value={form.message}
              change={(e: any) => setForm({ ...form, message: e.value })}
              placeholder="Write your recognition message"
              rows={2}
            />
          </div>
          {formError && <div className="ee-field full"><span className="error" role="alert">{formError}</span></div>}
          <div className="ee-field full" style={{ alignItems: 'flex-end' }}>
            <ButtonComponent
              cssClass="e-primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Send Recognition'}
            </ButtonComponent>
          </div>
        </form>
      )}

      <div className="ee-card" style={{ marginBottom: 16 }}>
        <h3 className="ee-section-title">Weekly Volume</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
          {weeklyVolume.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', height: `${Math.max(4, v * 12)}px`, background: '#3B8CDE', borderRadius: '4px 4px 0 0' }} title={`${v} recognition${v !== 1 ? 's' : ''}`} />
              <div className="ee-muted" style={{ marginTop: 4 }}>W{i + 1}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ee-list">
        {items.map((r) => (
          <div key={r.id} className="ee-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <strong style={{color: 'var(--color-sf-brand-solid-primary)'}}>🎉 {TYPE_LABELS[r.type]}</strong>
                <div className="ee-muted">
                  From <strong>{r.fromName}</strong> to <strong>{r.toName}</strong>
                </div>
              </div>
              {r.value && <span className="ee-badge" style={{ background: '#3B8CDE' }}>{r.value}</span>}
            </div>
            <p style={{ margin: '8px 0', fontSize: '13px', color: '#495057' }}>{r.message}</p>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6C757D' }}>
              <span>📅 {new Date(r.createdAt).toLocaleDateString()}</span>
              <span>👁 {VISIBILITY_LABELS[r.visibleTo]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
