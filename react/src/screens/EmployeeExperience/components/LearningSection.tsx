import React, { useEffect, useState } from 'react';
import { LoadingState } from '../../../components/states/LoadingState';
import { EmptyState } from '../../../components/states/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { getLearningRecommendations, updateLearningStatus } from '../../../services/employeeExperienceService';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { ProgressBarComponent } from '@syncfusion/ej2-react-progressbar';
import {
  LEARNING_FORMATS,
  LEARNING_STATUS_OPTIONS,
} from '../employeeExperienceConfig';
import type { LearningRecommendation, LearningStatus } from '../../../types';

const FORMAT_LABELS: Record<string, string> = Object.fromEntries(LEARNING_FORMATS.map((f) => [f.value, f.label]));

export const LearningSection: React.FC = () => {
  const [items, setItems] = useState<LearningRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LearningStatus | 'all'>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getLearningRecommendations();
      setItems(data);
    } catch {
      setError('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id: string, status: LearningStatus) => {
    try {
      const updated = await updateLearningStatus(id, status);
      if (updated) {
        setItems((prev) => prev.map((l) => (l.id === id ? updated : l)));
      }
    } catch {
      setError('Failed to update recommendation');
    }
  };

  if (isLoading) return <LoadingState height="300px" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const filtered = items.filter(
    (l) =>
      (statusFilter === 'all' || l.status === statusFilter) &&
      (formatFilter === 'all' || l.format === formatFilter),
  );

  if (items.length === 0) {
    return (
      <EmptyState
        title="No learning recommendations yet"
        description="Recommendations appear when you have a career plan with active milestones."
      />
    );
  }

  return (
    <div>
      <h3 className="ee-section-title">Learning Recommendations</h3>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="ee-field" style={{ minWidth: 160 }}>
          <label htmlFor="learn-status-filter">Status</label>
          <DropDownListComponent
            id="learn-status-filter"
            dataSource={[
              { value: 'all', label: 'All' },
              ...LEARNING_STATUS_OPTIONS,
            ]}
            sortOrder='Ascending'
            fields={{ text: 'label', value: 'value' }}
            value={statusFilter}
            change={(e) => setStatusFilter((e.value as LearningStatus) || 'all')}
          />
        </div>
        <div className="ee-field" style={{ minWidth: 160 }}>
          <label htmlFor="learn-format-filter">Format</label>
          <DropDownListComponent
            id="learn-format-filter"
            dataSource={[
              { value: 'all', label: 'All' },
              ...LEARNING_FORMATS,
            ]}
            sortOrder='Ascending'
            fields={{ text: 'label', value: 'value' }}
            value={formatFilter}
            change={(e) => setFormatFilter((e.value as string) || 'all')}
          />
        </div>
        <div className="ee-muted" style={{ marginBottom: 6 }}>{filtered.length} item(s)</div>
      </div>

      {filtered.length === 0 ? (
        <p className="ee-muted" style={{ padding: 20, textAlign: 'center' }}>No recommendations match the selected filters.</p>
      ) : (
        <div className="ee-list">
          {filtered.map((l) => (
            <div key={l.id} className="ee-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <strong style={{color: 'var(--color-sf-brand-solid-primary)'}}>{l.title}</strong>
                  <div className="ee-card-meta">
                    {l.format && (
                      <span className="ee-meta-chip ee-meta-chip--format">{FORMAT_LABELS[l.format]}</span>
                    )}
                    {l.provider && (
                      <span className="ee-meta-chip ee-meta-chip--provider">{l.provider}</span>
                    )}
                    {l.estHours != null && l.estHours > 0 && (
                      <span className="ee-meta-chip ee-meta-chip--hours">{l.estHours}h</span>
                    )}
                    {l.skillTag && (
                      <span className="ee-meta-chip ee-meta-chip--skill">{l.skillTag.toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <span className="ee-badge" style={{ background: '#6C757D' }}>{l.status}</span>
              </div>
              {l.reason && <p style={{ margin: '8px 0', fontSize: '13px', color: 'var(--color-sf-fg-tertiary)' }}>{l.reason}</p>}
              {l.matchScore != null && (
                <div style={{ fontSize: 12, color: '#6C757D', marginBottom: 8 }}>
                  Match: <strong>{Math.round(l.matchScore * 100)}%</strong>
                  <ProgressBarComponent
                    id={`match-${l.id}`}
                    type="Linear"
                    height="4px"
                    width="160px"
                    value={Math.round(l.matchScore * 100)}
                    progressColor="#28A745"
                    trackColor="#f0f0f0"
                    showProgressValue={false}
                    animation={{ enable: false }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {l.status === 'suggested' && (
                  <>
                    <ButtonComponent cssClass="e-flat" onClick={() => handleStatusChange(l.id, 'saved')}>Save</ButtonComponent>
                    <ButtonComponent cssClass="e-flat" onClick={() => handleStatusChange(l.id, 'in-progress')}>Start</ButtonComponent>
                    <ButtonComponent cssClass="e-flat" onClick={() => handleStatusChange(l.id, 'dismissed')}>Dismiss</ButtonComponent>
                  </>
                )}
                {l.status === 'saved' && (
                  <>
                    <ButtonComponent cssClass="e-flat" onClick={() => handleStatusChange(l.id, 'in-progress')}>Start</ButtonComponent>
                    <ButtonComponent cssClass="e-flat" onClick={() => handleStatusChange(l.id, 'dismissed')}>Dismiss</ButtonComponent>
                  </>
                )}
                {l.status === 'in-progress' && (
                  <>
                    <ButtonComponent cssClass="e-flat" onClick={() => handleStatusChange(l.id, 'completed')}>Complete</ButtonComponent>
                    <ButtonComponent cssClass="e-flat" onClick={() => handleStatusChange(l.id, 'dismissed')}>Dismiss</ButtonComponent>
                  </>
                )}
                {(l.status === 'completed' || l.status === 'dismissed') && (
                  <ButtonComponent cssClass="e-flat" onClick={() => handleStatusChange(l.id, 'suggested')}>Reset</ButtonComponent>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .ee-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .ee-meta-chip {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          line-height: 1;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid transparent;
          white-space: nowrap;
          text-transform: capitalize;
        }

        .ee-meta-chip--format {
          background: #EEF4FF;
          color: #2a6bb5;
          border-color: #CFE0FB;
        }

        .ee-meta-chip--provider {
          background: #F4F0FB;
          color: #5b3aa5;
          border-color: #E1D6F4;
          font-weight: 500;
        }

        .ee-meta-chip--hours {
          background: #FFF7E6;
          color: #8a5a00;
          border-color: #FCE5B5;
          font-variant-numeric: tabular-nums;
        }

        .ee-meta-chip--skill {
          background: #E8F6EE;
          color: #1e6b3a;
          border-color: #BFDFCC;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.06em;
        }
      `}</style>
    </div>
  );
};
