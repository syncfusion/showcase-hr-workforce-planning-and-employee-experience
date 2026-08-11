import React, { useEffect, useMemo, useState } from 'react';
import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  AccumulationDataLabel,
  AccumulationLegend,
  AccumulationTooltip,
  Inject,
  PieSeries,
} from '@syncfusion/ej2-react-charts';
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
} from '@syncfusion/ej2-react-grids';
import {
  ButtonComponent,
  ChipDirective,
  ChipListComponent,
  ChipsDirective,
} from '@syncfusion/ej2-react-buttons';
import {
  NumericTextBoxComponent,
  TextAreaComponent,
} from '@syncfusion/ej2-react-inputs';
import { LoadingState } from '../../../components/states/LoadingState';
import { EmptyState } from '../../../components/states/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import {
  getPulseSurveys,
  submitPulseResponse,
} from '../../../services/employeeExperienceService';
import type { PulseSurvey } from '../../../types';

// -----------------------------------------------------------------------------
// Visual helpers — map raw values onto Syncfusion chip variants and design
// tokens used elsewhere in the Employee Experience screen. Keeping the mapping
// in one place makes it trivial to retune the palette without touching JSX.
// -----------------------------------------------------------------------------

type ChipVariant = 'e-success' | 'e-warning' | 'e-danger' | 'e-info' | 'e-outline';

const statusToChip: Record<string, ChipVariant> = {
  active: 'e-success',
  draft: 'e-info',
  closed: 'e-outline',
};

const sentimentToChip = (sentiment: number): ChipVariant => {
  if (sentiment >= 70) return 'e-success';
  if (sentiment >= 40) return 'e-warning';
  return 'e-danger';
};

const sentimentLabel = (sentiment: number): string => {
  if (sentiment >= 70) return 'Positive';
  if (sentiment >= 40) return 'Neutral';
  return 'Needs attention';
};

// Theme tokens aligned with the rest of the Employee Experience screen so the
// cards feel like native neighbours of the NotificationsChatPanel.
const RATE_TRACK = 'var(--color-sf-gray-100, #F2F4F7)';
const RATE_FILL = 'var(--color-sf-brand-500, #3B82F6)';
const RATE_FILL_LOW = 'var(--color-sf-warning-500, #F79009)';
const RATE_FILL_HIGH = 'var(--color-sf-success-500, #12B76A)';

const rateFill = (rate: number) =>
  rate >= 75 ? RATE_FILL_HIGH : rate >= 50 ? RATE_FILL : RATE_FILL_LOW;

interface PriorityTag {
  label: string;
  icon: string;
  variant: ChipVariant;
  title?: string;
}

const getPriorityTags = (survey: PulseSurvey): PriorityTag[] => {
  const tags: PriorityTag[] = [];

  if (survey.closeAt) {
    const closeDate = new Date(survey.closeAt);
    const now = new Date();
    const daysUntilClose = Math.ceil(
      (closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysUntilClose <= 5 && daysUntilClose >= 0) {
      tags.push({
        label: `Closes in ${daysUntilClose} day${daysUntilClose !== 1 ? 's' : ''}`,
        icon: '🔴',
        variant: 'e-danger',
        title: survey.closeAt,
      });
    }
  }

  if (survey.responseRate < 50) {
    tags.push({ label: 'Low participation', icon: '⚠️', variant: 'e-danger' });
  } else if (survey.responseRate < 75) {
    tags.push({ label: 'Participation below target', icon: '🟡', variant: 'e-warning' });
  }

  if (!survey.closeAt && survey.responseRate >= 75) {
    tags.push({ label: 'High impact', icon: '🟢', variant: 'e-success' });
  }

  return tags;
};

// Compact meta-row formatter that mirrors the muted line in the panel.
const buildMeta = (s: PulseSurvey): string => {
  const cadence = s.cadence ? `${s.cadence} • ` : '';
  const responses = `${s.totalResponses} response${s.totalResponses === 1 ? '' : 's'}`;
  const close = s.closeAt
    ? ` • closes ${new Date(s.closeAt).toLocaleDateString()}`
    : ' • evergreen';
  return `${cadence}${responses} • ${s.responseRate}% response rate${close}`;
};

export const FeedbackSection: React.FC = () => {
  const [surveys, setSurveys] = useState<PulseSurvey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSurveyId, setActiveSurveyId] = useState<string | null>(null);
  const [sentimentValue, setSentimentValue] = useState(75);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPulseSurveys();
      setSurveys(data);
    } catch {
      setError('Failed to load pulse surveys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurveyId) return;
    setSubmitting(true);
    try {
      await submitPulseResponse(activeSurveyId, sentimentValue, comment || null);
      setActiveSurveyId(null);
      setComment('');
      setSentimentValue(75);
      await load();
    } catch {
      setError('Failed to submit pulse response');
    } finally {
      setSubmitting(false);
    }
  };

  // Derived data — kept memoized so the chart and grid don't reshuffle on
  // unrelated state changes (e.g. typing in the comment field).
  const { chartData, allThemes, openCount, closedCount } = useMemo(() => {
    const active = surveys.filter((s) => s.status === 'active');
    const open = surveys.filter((s) => s.status !== 'closed').length;
    const closed = surveys.length - open;
    return {
      chartData: active.map((s) => ({ x: s.title, y: s.responseRate })),
      allThemes: surveys.filter((s) => s.themes.length > 0).flatMap((s) => s.themes),
      openCount: open,
      closedCount: closed,
    };
  }, [surveys]);

  if (isLoading) return <LoadingState height="320px" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (surveys.length === 0) {
    return (
      <EmptyState
        title="No pulse surveys yet"
        description="When pulse surveys open, you can complete them here and track sentiment themes."
      />
    );
  }

  return (
    <div className="feedback-section">
      {/* ── Section header ────────────────────────────────────────────── */}
      <div className="feedback-section__header">
        <div>
          <h3 className="ee-section-title" style={{ margin: 0 }}>
            Pulse Surveys
          </h3>
          <div className="ee-muted" style={{ marginTop: 2 }}>
            Capture how the team feels and act on emerging themes.
          </div>
        </div>
        <ChipListComponent aria-label="Survey summary">
          <ChipsDirective>
            <ChipDirective
              text={`${openCount} open`}
              cssClass="e-info"
            />
            <ChipDirective
              text={`${closedCount} closed`}
              cssClass="e-outline"
            />
          </ChipsDirective>
        </ChipListComponent>
      </div>

      {/* ── Survey cards ──────────────────────────────────────────────── */}
      <div className="ee-list" style={{ marginBottom: 24 }}>
        {surveys.map((s) => {
          const priorityTags = getPriorityTags(s);
          const statusVariant = statusToChip[s.status] ?? 'e-outline';
          const isActive = activeSurveyId === s.id;
          return (
            <div
              key={s.id}
              className={`ee-card feedback-survey-card ${isActive ? 'is-active' : ''}`}
            >
              <div className="feedback-survey-card__head">
                <div className="feedback-survey-card__title-block">
                  <div className="feedback-survey-card__title">{s.title}</div>
                  <div className="ee-muted feedback-survey-card__meta">
                    {buildMeta(s)}
                  </div>
                </div>
                <ChipListComponent aria-label="Survey status">
                  <ChipsDirective>
                    <ChipDirective
                      text={s.status}
                      cssClass={statusVariant}
                    />
                  </ChipsDirective>
                </ChipListComponent>
              </div>

              {/* Response rate progress */}
              <div
                className="feedback-rate"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={s.responseRate}
                aria-label={`${s.title} response rate`}
              >
                <div className="feedback-rate__track">
                  <div
                    className="feedback-rate__fill"
                    style={{
                      width: `${Math.max(0, Math.min(100, s.responseRate))}%`,
                      background: rateFill(s.responseRate),
                    }}
                  />
                </div>
                <div className="feedback-rate__label">
                  <span>{s.responseRate}%</span>
                  <span className="ee-muted">response rate</span>
                </div>
              </div>

              {priorityTags.length > 0 && (
                <div className="feedback-survey-card__tags">
                  <ChipListComponent aria-label="Survey priority signals">
                    <ChipsDirective>
                      {priorityTags.map((tag) => (
                        <ChipDirective
                          key={tag.label}
                          text={`${tag.icon} ${tag.label}`}
                          cssClass={tag.variant}
                        />
                      ))}
                    </ChipsDirective>
                  </ChipListComponent>
                </div>
              )}

              {s.status === 'active' && !isActive && (
                <div className="feedback-survey-card__actions">
                  <ButtonComponent
                    cssClass="e-primary"
                    onClick={() => setActiveSurveyId(s.id)}
                    aria-label={`Complete ${s.title}`}
                  >
                    Complete Survey
                  </ButtonComponent>
                </div>
              )}

              {isActive && (
                <form
                  className="ee-form feedback-survey-form"
                  onSubmit={handleSubmitResponse}
                  aria-label={`Complete ${s.title}`}
                >
                  <div className="ee-field full">
                    <label htmlFor="pulse-sentiment">Sentiment (−100 to 100)</label>
                    <NumericTextBoxComponent
                      id="pulse-sentiment"
                      value={sentimentValue}
                      change={(e: any) => setSentimentValue(e.value)}
                      min={-100}
                      max={100}
                      format="n0"
                      placeholder="Sentiment score"
                    />
                  </div>
                  <div className="ee-field full">
                    <label htmlFor="pulse-comment">Comment (optional)</label>
                    <TextAreaComponent
                      id="pulse-comment"
                      value={comment}
                      change={(e: any) => setComment(e.value)}
                      placeholder="Add context that will help HR understand your score…"
                      rows={2}
                    />
                  </div>
                  <div className="ee-field full feedback-survey-form__actions">
                    <ButtonComponent
                      cssClass="e-flat"
                      type="button"
                      onClick={() => {
                        setActiveSurveyId(null);
                        setComment('');
                        setSentimentValue(75);
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </ButtonComponent>
                    <ButtonComponent
                      cssClass="e-primary"
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting…' : 'Submit Response'}
                    </ButtonComponent>
                  </div>
                </form>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Response-rate chart ──────────────────────────────────────── */}
      {chartData.length > 0 && (
        <div className="ee-card feedback-chart-card" style={{ marginBottom: 20 }}>
          <h3 className="ee-section-title">Response Rates by Active Survey</h3>
          <div className="feedback-chart-card__body">
            <AccumulationChartComponent
              id="ee-response-chart"
              height="280px"
              width="100%"
            >
              <Inject
                services={[
                  PieSeries,
                  AccumulationLegend,
                  AccumulationTooltip,
                  AccumulationDataLabel,
                ]}
              />
              <AccumulationSeriesCollectionDirective>
                <AccumulationSeriesDirective
                  dataSource={chartData as any}
                  xName="x"
                  yName="y"
                />
              </AccumulationSeriesCollectionDirective>
            </AccumulationChartComponent>
          </div>
        </div>
      )}

      {/* ── Theme sentiment grid ─────────────────────────────────────── */}
      {allThemes.length > 0 && (
        <div className="ee-card feedback-themes-card">
          <h3 className="ee-section-title">Theme Sentiment</h3>
          <div style={{ overflowX: 'auto' }}>
            <GridComponent
              dataSource={allThemes}
              allowPaging={false}
              allowSorting={true}
              height="auto"
            >
              <ColumnsDirective>
                <ColumnDirective field="theme" headerText="Theme" />
                <ColumnDirective field="department" headerText="Department" />
                <ColumnDirective
                  field="sentiment" headerTextAlign='Left'
                  headerText="Sentiment"
                  textAlign="Center"
                  template={(props: any) => (
                    <ChipListComponent>
                      <ChipsDirective>
                        <ChipDirective
                          text={`${props.sentiment} • ${sentimentLabel(props.sentiment)}`}
                          cssClass={sentimentToChip(props.sentiment)}
                        />
                      </ChipsDirective>
                    </ChipListComponent>
                  )}
                />
              </ColumnsDirective>
            </GridComponent>
          </div>
        </div>
      )}

      {/* Local styling — kept co-located to match the NotificationsChatPanel
          pattern. Uses only design-system tokens so it stays in sync with the
          rest of the Employee Experience screen. */}
      <style>{`
        .feedback-section { display: flex; flex-direction: column; gap: 16px; }

        .feedback-section__header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
        }
        .feedback-section__header .e-chip-list { flex-shrink: 0; }

        /* Card base — rides on top of .ee-card for the panel's chrome, then
           layers elevation + interaction states. */
        .feedback-survey-card,
        .feedback-chart-card,
        .feedback-themes-card {
          background: var(--color-sf-bg-primary);
          border: 1px solid var(--color-sf-border-secondary);
          border-radius: 10px;
          padding: 16px 18px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .feedback-survey-card { margin-top: 0; }
        .feedback-survey-card:hover {
          border-color: var(--color-sf-border-primary);
          box-shadow: 0 6px 18px var(--color-sf-shadow-secondary, rgba(16, 24, 40, 0.06));
          transform: translateY(-1px);
        }
        .feedback-survey-card.is-active {
          border-color: var(--color-sf-border-brand-solid, var(--color-sf-brand-500));
          box-shadow: 0 0 0 1px var(--color-sf-border-brand-solid, var(--color-sf-brand-500)),
                      0 8px 24px var(--color-sf-shadow-secondary, rgba(16, 24, 40, 0.08));
        }

        .feedback-survey-card__head {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 12px; margin-bottom: 12px;
        }
        .feedback-survey-card__title-block { min-width: 0; flex: 1 1 auto; }
        .feedback-survey-card__title {
          font-size: 15px; font-weight: 600; line-height: 1.3;
          color: var(--color-sf-fg-primary);
        }
        .feedback-survey-card__meta { margin-top: 2px; }

        /* Response rate meter */
        .feedback-rate { margin: 4px 0 12px; }
        .feedback-rate__track {
          position: relative; height: 6px; width: 100%;
          background: ${RATE_TRACK};
          border-radius: 999px; overflow: hidden;
        }
        .feedback-rate__fill {
          height: 100%; width: 0;
          background: ${RATE_FILL};
          border-radius: inherit;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .feedback-rate__label {
          display: flex; align-items: baseline; justify-content: space-between;
          margin-top: 6px; font-size: 12px;
          color: var(--color-sf-fg-primary);
          font-weight: 600;
        }

        .feedback-survey-card__tags { margin-top: 4px; }
        .feedback-survey-card__actions { margin-top: 14px; }

        /* Inline form */
        .feedback-survey-form {
          margin-top: 14px; padding-top: 14px;
          border-top: 1px dashed var(--color-sf-border-tertiary, var(--color-sf-border-secondary));
        }
        .feedback-survey-form__actions {
          display: flex; justify-content: flex-end; gap: 8px;
        }

        .feedback-chart-card__body {
          width: 100%; min-height: 280px;
          margin-top: 4px;
        }

        /* Syncfusion chip tweaks — match the rounded pill in the rest of the
           screen and give the danger variant a soft tint. */
        .feedback-survey-card .e-chip,
        .feedback-section__header .e-chip,
        .feedback-themes-card .e-chip {
          border-radius: 999px;
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 0.2px;
        }
        .feedback-section__header .e-chip.e-info { background: var(--color-sf-brand-50); color: var(--color-sf-brand-700); }
        .feedback-section__header .e-chip.e-outline { background: var(--color-sf-gray-100); color: var(--color-sf-gray-700); }

        .feedback-survey-card__tags .e-chip-list { flex-wrap: wrap; }

        /* Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .feedback-survey-card,
          .feedback-rate__fill { transition: none; }
        }
      `}</style>
    </div>
  );
};
