import React, { useMemo, useState, useEffect } from 'react';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { ChartComponent, SeriesCollectionDirective, SeriesDirective, Inject, BarSeries, Category, Tooltip, Legend, DataLabel } from '@syncfusion/ej2-react-charts';
import { ChipDirective, ChipListComponent, ChipsDirective } from '@syncfusion/ej2-react-buttons';
import { PageHeader } from '../../components/Layout';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { workforcePlanningService } from '../../services/workforcePlanningService';
import type { WorkforcePlan, WorkforceScenario, WorkforceLineItem, PlanningSnapshot } from '../../types';

// Local snapshot fixture — the only slice previously kept from
// `src/services/mockData.ts` (now removed in the unused-code audit).
const planningSnapshots: PlanningSnapshot[] = [
  { id: 'snap_2026_06_18', planId: 'wp_2026_q3', capturedAt: '2026-06-18T09:00:00-04:00', createdBy: 'u_209', sourceSystem: 'hris' },
  { id: 'snap_2026_06_15', planId: 'wp_2026_q3', capturedAt: '2026-06-15T18:30:00+01:00', createdBy: 'u_104', sourceSystem: 'planning-sheet' },
];

interface VarianceCardProps {
  label: string;
  value: string;
  baseline: number;
  selected: number;
  unit: string;
  isCurrency?: boolean;
}

const formatValue = (n: number, isCurrency?: boolean): string =>
  isCurrency ? `$${(n / 1_000_000).toFixed(2)}M` : n.toLocaleString();

/** Format an ISO date string into a readable date (e.g., "Jul 1, 2026") */
const formatDate = (iso: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/** Return a rough duration label like "3 months" */
const durationLabel = (startIso: string, endIso: string): string => {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const ms = e.getTime() - s.getTime();
  if (Number.isNaN(ms)) return '';
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  return `${months} month${months === 1 ? '' : 's'}`;
};

interface PlanPeriodCardProps {
  start: string;
  end: string;
}

const PlanPeriodCard: React.FC<PlanPeriodCardProps> = ({ start, end }) => {
  const startLabel = formatDate(start);
  const endLabel = formatDate(end);
  const duration = durationLabel(start, end);

  return (
    <div className="e-card wp-period-card">
      <div className="e-card-header">
        <div className="e-card-title wp-stat-label">Period</div>
        {duration && (
          <ChipListComponent>
            <ChipsDirective>
              <ChipDirective text={duration} cssClass="e-success" />
            </ChipsDirective>
          </ChipListComponent>
        )}
      </div>
      <div className="e-card-content">
        <div className="wp-period-timeline">
          <div className="wp-timeline-track">
            <div className="wp-timeline-progress" />
          </div>
          <div className="wp-timeline-labels">
            <div className="wp-timeline-point">
              <span className="wp-timeline-date">{startLabel}</span>
              <span className="wp-timeline-tag">Start</span>
            </div>
            <div className="wp-timeline-point wp-timeline-end">
              <span className="wp-timeline-date">{endLabel}</span>
              <span className="wp-timeline-tag">End</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PlanCardProps {
  name: string;
  status?: string;
  latestSnapshotAt?: string;
}

const statusColorMap: Record<string, string> = {
  active: 'e-success',
  draft: 'e-warning',
  archived: 'e-info',
};

const PlanCard: React.FC<PlanCardProps> = ({ name, status, latestSnapshotAt }) => {
  const chipClass = statusColorMap[status ?? ''] || 'e-outline';
  const snapshotLabel = latestSnapshotAt
    ? `Snapshot: ${formatDate(latestSnapshotAt)}`
    : 'No snapshot taken';
  return (
    <div className="e-card wp-stat-card-accent">
      <div className="e-card-header">
        <div className="e-card-title wp-stat-label">Plan</div>
        {status && (
          <ChipListComponent>
            <ChipsDirective>
              <ChipDirective text={status.toUpperCase()} cssClass={chipClass} />
            </ChipsDirective>
          </ChipListComponent>
        )}
      </div>
      <div className="e-card-content">
        <span className="wp-stat-value">{name}</span>
        <span className="wp-stat-subtext">{snapshotLabel}</span>
      </div>
    </div>
  );
};

interface ScenarioCardProps {
  name: string;
  confidence?: string;
  headcountTarget?: number;
  budgetImpact?: number;
}

const confidenceColorMap: Record<string, string> = {
  high: 'e-danger',
  medium: 'e-warning',
  low: 'e-success',
};

const ScenarioCard: React.FC<ScenarioCardProps> = ({ name, confidence, headcountTarget, budgetImpact }) => {
  const chipClass = confidenceColorMap[confidence ?? ''] || 'e-outline';
  return (
    <div className="e-card wp-stat-card-accent">
      <div className="e-card-header">
        <div className="e-card-header-caption">
          <div className="e-card-title wp-stat-label">Selected Scenario</div>
        </div>
        {confidence && (
          <ChipListComponent key={confidence}>
            <ChipsDirective>
              <ChipDirective text={confidence.toUpperCase()} cssClass={chipClass} />
            </ChipsDirective>
          </ChipListComponent>
        )}
      </div>
      <div className="e-card-content">
        <span className="wp-stat-value">{name}</span>
        {(headcountTarget !== undefined || budgetImpact !== undefined) && (
          <div className="wp-scenario-meta">
            {headcountTarget !== undefined && (
              <span>
                <strong>{headcountTarget.toLocaleString()}</strong> FTE
              </span>
            )}
            {budgetImpact !== undefined && (
              <span>
                <strong>${(budgetImpact / 1_000_000).toFixed(2)}M</strong> Budget
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface SnapshotCardProps {
  count: number;
  lastSnapshotAt?: string;
}

const SnapshotCard: React.FC<SnapshotCardProps> = ({ count, lastSnapshotAt }) => {
  const lastLabel = lastSnapshotAt ? formatDate(lastSnapshotAt) : undefined;
  return (
    <div className="e-card wp-stat-card-accent">
      <div className="e-card-header">
        <div className="e-card-title wp-stat-label">Snapshots Captured</div>
      </div>
      <div className="e-card-content">
        <span className="wp-stat-value wp-stat-number">{count}</span>
        {lastLabel && <span className="wp-stat-subtext">Latest: {lastLabel}</span>}
      </div>
    </div>
  );
};

const VarianceCard: React.FC<VarianceCardProps> = ({ label, value, baseline, selected, unit, isCurrency }) => {
  const trendClass = selected > baseline ? 'positive' : selected < baseline ? 'negative' : 'neutral';
  return (
    <div className={`wp-variance-card`}>
      <div className="wp-variance-label">{label}</div>
      <div className={`wp-variance-value ${trendClass}`}>{value}</div>
      <div className="wp-variance-meta">
        <span>Baseline <strong>{formatValue(baseline, isCurrency)} {isCurrency ? '' : unit}</strong></span>
        <span>Selected <strong>{formatValue(selected, isCurrency)} {isCurrency ? '' : unit}</strong></span>
      </div>
    </div>
  );
};

export const WorkforcePlanning: React.FC = () => {
  const [plans, setPlans] = useState<WorkforcePlan[]>([]);
  const [scenarios, setScenarios] = useState<WorkforceScenario[]>([]);
  const [lineItems, setLineItems] = useState<WorkforceLineItem[]>([]);
  const [snapshots] = useState<PlanningSnapshot[]>(planningSnapshots);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const planResult = await workforcePlanningService.getPlans();
        const activePlan = planResult[0];
        
        const scenarioResult = await workforcePlanningService.getScenarios(activePlan?.id);
        const lineItemResult = await workforcePlanningService.getLineItems();

        setPlans(planResult);
        setScenarios(scenarioResult);
        setLineItems(lineItemResult);
        const baseline = scenarioResult.find((s: WorkforceScenario) => s.type === 'baseline');
        setSelectedScenarioId(baseline?.id || scenarioResult[0]?.id || '');
      } catch (err) {
        setError('Failed to load workforce planning data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const activePlan = plans[0];
  const selectedScenario = scenarios.find((scenario) => scenario.id === selectedScenarioId) || scenarios[0];
  const baselineScenario = scenarios.find((scenario) => scenario.type === 'baseline') || scenarios[0];

  const scenarioLineItems = useMemo(() => {
    return lineItems.filter((item) => item.scenarioId === selectedScenario?.id);
  }, [lineItems, selectedScenario?.id]);

  // Transform line items into staffing breakdown chart data (by function)
  const chartData = useMemo(() => {
    if (!activePlan || scenarioLineItems.length === 0) return [];

    const grouped = scenarioLineItems.reduce((acc, item) => {
      const key = item.function;
      if (!acc[key]) {
        acc[key] = { current: 0, planned: 0, open: 0 };
      }
      acc[key].current += item.currentHeadcount;
      acc[key].planned += item.plannedHeadcount;
      acc[key].open += item.openRoles || 0;
      return acc;
    }, {} as Record<string, { current: number; planned: number; open: number }>);

    return Object.entries(grouped).map(([name, vals]) => ({
      functionName: name,
      current: vals.current,
      planned: vals.planned,
      open: vals.open,
    }));
  }, [activePlan, scenarioLineItems]);

  // const taskFields = {
  //   id: 'TaskID',
  //   name: 'TaskName',
  //   startDate: 'StartDate',
  //   endDate: 'EndDate',
  //   duration: 'Duration',
  //   progress: 'Progress',
  //   child: 'subtasks',
  // };

  const baselineTotals = useMemo(() => {
    return {
      headcount: baselineScenario ? baselineScenario.headcountTarget : 0,
      budget: baselineScenario ? baselineScenario.budgetImpact : 0,
      hiring: baselineScenario?.hiringTarget || 0,
    };
  }, [baselineScenario]);

  const selectedTotals = useMemo(() => {
    return {
      headcount: selectedScenario ? selectedScenario.headcountTarget : 0,
      budget: selectedScenario ? selectedScenario.budgetImpact : 0,
      hiring: selectedScenario?.hiringTarget || 0,
    };
  }, [selectedScenario]);

  const variance = {
    headcount: selectedTotals.headcount - baselineTotals.headcount,
    budget: selectedTotals.budget - baselineTotals.budget,
    hiring: selectedTotals.hiring - baselineTotals.hiring,
  };

  if (isLoading) {
    return <LoadingState height="400px" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  if (plans.length === 0) {
    return (
      <EmptyState
        title="No workforce planning data yet"
        description="Create or import a workforce plan to compare scenarios and track staffing gaps."
        actionLabel="Create Plan"
        onAction={() => {}}
      />
    );
  }

  return (
    <div className="workforce-planning-screen">
      <PageHeader
        title="Workforce Planning"
        subtitle="Compare scenarios, staffing gaps, and budget impact"
      />

      <div className="summary-grid wp-stat-cards" aria-label="Workforce planning summary">
        <PlanCard name={activePlan?.name ?? '—'} status={activePlan?.status} latestSnapshotAt={"Not Taken"} />
        <PlanPeriodCard
          start={activePlan?.planningPeriodStart ?? ''}
          end={activePlan?.planningPeriodEnd ?? ''}
        />
        <ScenarioCard
          name={selectedScenario?.name ?? '—'}
          confidence={selectedScenario?.confidence}
          headcountTarget={selectedScenario?.headcountTarget}
          budgetImpact={selectedScenario?.budgetImpact}
        />
        <SnapshotCard
          count={snapshots.length}
          lastSnapshotAt={snapshots.length > 0 ? snapshots[0].capturedAt : undefined}
        />
      </div>

      <section className="e-card wp-card section-container">
        <div className="e-card-header wp-section-header">
          <div className="e-card-header-caption">
            <h2 className="e-card-title wp-section-title">Staffing Breakdown</h2>
          </div>
          <div className="wp-section-actions">
            <DropDownListComponent
              id="scenario-picker"
              dataSource={scenarios.filter((scenario) => scenario.planId === activePlan?.id) as any}
              fields={{ text: 'name', value: 'id' }}
              value={selectedScenarioId}
              change={(args: { value?: string; itemData?: { id?: string } }) => {
                const newValue = args?.value ?? args?.itemData?.id;
                if (typeof newValue === 'string' && newValue.length > 0) {
                  setSelectedScenarioId(newValue);
                }
              }}
            />
          </div>
        </div>
        {chartData.length > 0 ? (
          <ChartComponent
            id="staffing-breakdown-chart"
            height="400px"
            primaryXAxis={{ valueType: 'Category', title: 'Function' }}
            primaryYAxis={{ title: 'Headcount' }}
            legendSettings={{ visible: true, position: 'Bottom' }}
            tooltip={{ enable: true }}
          >
            <Inject services={[BarSeries, Category, Tooltip, Legend, DataLabel]} />
            <SeriesCollectionDirective>
              <SeriesDirective
                dataSource={chartData}
                xName="functionName"
                yName="current"
                name="Current"
                type="Bar"
                fill="var(--color-sf-brand-600)"
                marker={{ dataLabel: { visible: true, position: 'Top' } }}
              />
              <SeriesDirective
                dataSource={chartData}
                xName="functionName"
                yName="planned"
                name="Planned"
                type="Bar"
                fill="var(--color-sf-success-600)"
                marker={{ dataLabel: { visible: true, position: 'Top' } }}
              />
              <SeriesDirective
                dataSource={chartData}
                xName="functionName"
                yName="open"
                name="Open Roles"
                type="Bar"
                fill="var(--color-sf-warning-500)"
                marker={{ dataLabel: { visible: true, position: 'Top' } }}
              />
            </SeriesCollectionDirective>
          </ChartComponent>
        ) : (
          <EmptyState
            title="No staffing data"
            description="Select a scenario to view staffing breakdown."
            actionLabel="Refresh"
            onAction={() => window.location.reload()}
          />
        )}
      </section>


      <section className="e-card wp-card wp-comparison-panel">
        <div className="e-card-header wp-section-header">
          <div className="e-card-header-caption">
            <h2 className="e-card-title wp-section-title">Scenario Comparison</h2>
          </div>
        </div>
        <div className="e-card-content">
        <p className="wp-comparison-subtitle">
          Variance of <strong>{selectedScenario?.name}</strong> against the baseline scenario{' '}
          <strong>{baselineScenario?.name}</strong>.
        </p>

        <div className="wp-variance-grid">
          <VarianceCard
            label="Headcount Variance"
            value={`${variance.headcount > 0 ? '+' : ''}${variance.headcount}`}
            baseline={baselineTotals.headcount}
            selected={selectedTotals.headcount}
            unit="FTE"
          />
          <VarianceCard
            label="Budget Variance"
            value={`${variance.budget > 0 ? '+' : variance.budget < 0 ? '-' : ''}$${(Math.abs(variance.budget) / 1_000_000).toFixed(2)}M`}
            baseline={baselineTotals.budget}
            selected={selectedTotals.budget}
            unit=""
            isCurrency
          />
          <VarianceCard
            label="Hiring Variance"
            value={`${variance.hiring > 0 ? '+' : ''}${variance.hiring}`}
            baseline={baselineTotals.hiring}
            selected={selectedTotals.hiring}
            unit="requisitions"
          />
        </div>
        </div>
      </section>

      <style>{`
        /* ============ Workforce Planning — Premium Styling ============ */
        .workforce-planning-screen {
          animation: wp-fade-in 0.3s ease-in;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @keyframes wp-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ---- Stat cards (summary grid) ---- */
        .summary-grid.wp-stat-cards {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }
        .summary-grid.wp-stat-cards .e-card {
          border-radius: 12px !important;
          border: 1px solid var(--color-sf-border-secondary) !important;
          box-shadow: var(--shadow-sm) !important;
          background: var(--color-sf-bg-primary);
          padding: 0 !important;
          overflow: hidden;
          transition: box-shadow 0.2s ease, transform 0.2s ease !important;
        }
        .summary-grid.wp-stat-cards .e-card:hover {
          box-shadow: var(--shadow-md) !important;
          transform: translateY(-1px);
        }

        .workforce-planning-screen .e-card .e-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          border-bottom: 1px solid var(--color-sf-border-tertiary);
          background: var(--color-sf-bg-secondary-subtle);
        }
        /* Syncfusion Card header caption / title wrappers — match the
           header's flex layout so the optional chip on the right stays
           aligned with the title text. */
        .workforce-planning-screen .e-card .e-card-header-caption {
          display: flex;
          align-items: center;
          min-width: 0;
          flex: 1 1 auto;
        }
        .workforce-planning-screen .e-card .e-card-title {
          margin: 0;
        }
        .wp-stat-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-sf-fg-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .workforce-planning-screen .e-card .e-card-content {
          padding: 18px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .wp-stat-value {
          font-size: 18px;
          font-weight: 700;
          color: var(--color-sf-fg-primary);
          line-height: 1.3;
        }
        .wp-stat-subtext {
          font-size: 12px;
          color: var(--color-sf-fg-tertiary);
        }

        /* ---- Plan Period Timeline Card ---- */
        .wp-period-card {
          overflow: hidden !important;
        }
        .wp-period-badge {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-sf-fg-success-primary);
          background: var(--color-sf-bg-success-primary);
          padding: 2px 8px;
          border-radius: 8px;
          text-transform: lowercase;
          letter-spacing: 0.3px;
        }
        .wp-period-timeline {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .wp-timeline-track {
          position: relative;
          height: 4px;
          border-radius: 9999px;
          background: var(--color-sf-border-secondary);
          overflow: hidden;
        }
        .wp-timeline-progress {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 100%;
          border-radius: 9999px;
          background: linear-gradient(90deg, var(--color-sf-brand-600), var(--color-sf-success-600));
        }
        .wp-timeline-labels {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }
        .wp-timeline-point {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .wp-timeline-end {
          align-items: flex-end;
          text-align: right;
        }
        .wp-timeline-date {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-sf-fg-primary);
          line-height: 1.2;
        }
        .wp-timeline-tag {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-sf-fg-quaternary);
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        /* ---- Stat card accent variants ---- */
        .wp-stat-card-accent {
          border-left: 4px solid var(--color-sf-brand-primary) !important;
        }
        .wp-scenario-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: var(--color-sf-fg-tertiary);
          padding-top: 6px;
          border-top: 1px dashed var(--color-sf-border-secondary);
          margin-top: 4px;
        }
        .wp-scenario-meta strong {
          color: var(--color-sf-fg-primary);
          font-weight: 700;
          font-size: 13px;
        }
        .wp-stat-number {
          font-size: 28px !important;
          line-height: 1.1;
        }

        /* ---- Generic card container ----
           Now uses the Syncfusion e-card surface; the original .wp-card
           / .section-container visual language is preserved by overriding
           the e-card defaults to the same brand surface + radius + shadow.
           The header carries the section title via e-card-header, the body
           lives inside e-card-content — so the 24px padding is applied
           to the content rather than the wrapper, otherwise the header
           would inherit it. */
        .workforce-planning-screen section.e-card.wp-card,
        .workforce-planning-screen .section-container.e-card,
        .workforce-planning-screen .wp-comparison-panel.e-card {
          background: var(--color-sf-bg-primary);
          border: 1px solid var(--color-sf-border-secondary);
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.2s ease;
          overflow: hidden;
        }
        .workforce-planning-screen section.e-card.wp-card:hover,
        .workforce-planning-screen .section-container.e-card:hover,
        .workforce-planning-screen .wp-comparison-panel.e-card:hover {
          box-shadow: var(--shadow-md);
        }
        /* The section header is now an e-card-header — suppress the
           duplicate border-bottom that .wp-section-header would add on
           top of the one e-card-header already paints. */
        .workforce-planning-screen .e-card-header.wp-section-header {
          border-bottom: 0;
          padding: 16px 24px 0;
          background: transparent;
        }
        /* The section body sits inside e-card-content — apply the original
           24px container padding here so the layout matches what we had
           when .wp-card was the wrapper. */
        .workforce-planning-screen section.e-card.wp-card > .e-card-content,
        .workforce-planning-screen .section-container.e-card > .e-card-content,
        .workforce-planning-screen .wp-comparison-panel.e-card > .e-card-content {
          padding: 16px 24px 24px;
        }

        /* ---- Section headers ---- */
        .wp-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 14px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--color-sf-border-tertiary);
          gap: 16px;
          flex-wrap: wrap;
        }
        /* When the section header is also an .e-card-header the border is
           already painted by the wrapper, so just use the inner divider. */
        .e-card-header.wp-section-header .wp-section-header {
          border-bottom: 0;
        }
        .wp-section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-sf-fg-primary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .wp-row-count {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-sf-fg-tertiary);
          background: var(--color-sf-bg-secondary);
          padding: 3px 10px;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          white-space: nowrap;
        }

        /* ---- Comparison panel ---- */
        .wp-control-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .wp-control-group label {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-sf-fg-secondary);
          white-space: nowrap;
        }
        .wp-control-group .e-control-wrapper,
        .wp-control-group .e-ddl {
          min-width: 240px;
        }

        .wp-comparison-subtitle {
          font-size: 13px;
          color: var(--color-sf-fg-tertiary);
          margin: -8px 0 20px;
        }
        .wp-comparison-subtitle strong {
          color: var(--color-sf-fg-primary);
          font-weight: 600;
        }

        /* ---- Variance cards ---- */
        .wp-variance-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        .wp-variance-card {
          border: 1px solid var(--color-sf-border-secondary);
          border-radius: 12px;
          background: var(--color-sf-bg-primary);
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .wp-variance-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }
        .wp-variance-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-sf-fg-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .wp-variance-value {
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
        }
        .wp-variance-value.positive { color: var(--color-sf-fg-warning-primary); }
        .wp-variance-value.negative { color: var(--color-sf-fg-error-primary); }
        .wp-variance-value.neutral { color: var(--color-sf-fg-primary); }
        .wp-variance-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--color-sf-fg-tertiary);
          padding-top: 6px;
          border-top: 1px dashed var(--color-sf-border-secondary);
          margin-top: 2px;
        }
        .wp-variance-meta strong {
          color: var(--color-sf-fg-primary);
          font-weight: 600;
        }

        /* ---- Gantt Chart polish ---- */
        .wp-table-card .e-gantt,
        .section-container .e-gantt {
          border: none !important;
          font-family: inherit !important;
        }
        .section-container .e-gantt .e-headercell,
        .section-container .e-gantt .e-headercelldiv {
          background: var(--color-sf-bg-secondary) !important;
          color: var(--color-sf-fg-secondary) !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        .section-container .e-gantt .e-rowcell {
          font-size: 13px !important;
          color: var(--color-sf-fg-primary) !important;
        }
        .section-container .e-gantt .e-row:hover .e-rowcell {
          background: var(--color-sf-bg-secondary) !important;
        }
        .section-container .e-gantt .e-gantt-treegrid-pane .e-rowcell {
          font-weight: 500;
        }
        .section-container .e-gantt .e-taskbar-main-container {
          border-radius: 4px;
        }
        .section-container .e-gantt .e-gantt-chart .e-timeline-header-container {
          background: var(--color-sf-bg-secondary) !important;
        }

        /* ---- Chart polish ---- */
        .section-container .e-chart {
          border: none !important;
          font-family: inherit !important;
        }
        .section-container .e-chart text {
          font-family: inherit !important;
        }
        .section-container .e-chart .e-legend-item {
          font-size: 13px !important;
          color: var(--color-sf-fg-secondary) !important;
        }
        .section-container .e-chart .e-axis-title {
          font-size: 12px !important;
          font-weight: 600 !important;
          fill: var(--color-sf-fg-secondary) !important;
        }
        .section-container .e-chart .e-label {
          font-size: 12px !important;
          fill: var(--color-sf-fg-primary) !important;
        }

        /* ---- Assumptions ---- */
        .wp-assumptions-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }
        .wp-assumption-item {
          border: 1px solid var(--color-sf-border-secondary);
          border-radius: 10px;
          background: var(--color-sf-bg-secondary-subtle);
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: background 0.2s ease, box-shadow 0.2s ease;
        }
        .wp-assumption-item:hover {
          background: var(--color-sf-bg-primary);
          box-shadow: var(--shadow-default);
        }
        .wp-assumption-category {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-sf-fg-brand-primary);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .wp-assumption-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-sf-fg-primary);
          line-height: 1.2;
        }
        .wp-assumption-unit {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-sf-fg-tertiary);
        }
        .wp-assumption-note {
          font-size: 12px;
          color: var(--color-sf-fg-tertiary);
          padding-top: 6px;
          border-top: 1px dashed var(--color-sf-border-secondary);
          margin-top: 2px;
        }
        .wp-assumptions-empty {
          grid-column: 1 / -1;
          text-align: center;
          color: var(--color-sf-fg-tertiary);
          font-size: 13px;
          padding: 24px 0;
        }

        /* ---- Section actions ---- */
        .wp-section-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        /* ---- Dark mode overrides ---- */
        [data-theme="dark"] .workforce-planning-screen .e-card .e-card-header {
          background: linear-gradient(to bottom, var(--color-sf-bg-primary-alt), var(--color-sf-bg-primary));
        }
        /* Section header is transparent on the wrapper card, so don't paint
           the dark-mode gradient header there. */
        [data-theme="dark"] .workforce-planning-screen .e-card-header.wp-section-header {
          background: transparent;
        }

        [data-theme="dark"] .summary-grid.wp-stat-cards .e-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
        }

        [data-theme="dark"] .wp-variance-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        [data-theme="dark"] .wp-card:hover,
        [data-theme="dark"] .section-container:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        [data-theme="dark"] .wp-assumption-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        /* ---- Responsive ---- */
        @media (max-width: 1024px) {
          .summary-grid.wp-stat-cards {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .wp-variance-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .summary-grid.wp-stat-cards {
            grid-template-columns: 1fr;
          }
          .wp-variance-grid {
            grid-template-columns: 1fr;
          }
          .wp-section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .wp-control-group {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
            width: 100%;
          }
          .wp-control-group .e-control-wrapper,
          .wp-control-group .e-ddl {
            width: 100%;
            min-width: 0;
          }
          .wp-card {
            padding: 18px;
          }
          .wp-assumptions-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
