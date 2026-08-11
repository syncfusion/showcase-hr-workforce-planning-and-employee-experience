import React, { useEffect, useState } from 'react';
import { LoadingState } from '../../../components/states/LoadingState';
import { EmptyState } from '../../../components/states/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { ProgressBarComponent } from '@syncfusion/ej2-react-progressbar';
import { GridComponent, ColumnDirective, ColumnsDirective } from '@syncfusion/ej2-react-grids';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { getCareerPlans, updateMilestoneStatus } from '../../../services/employeeExperienceService';
import {
  CAREER_PLAN_STATUS_LABELS,
  MILESTONE_STATUS_OPTIONS,
  STATUS_COLORS,
} from '../employeeExperienceConfig';
import type { CareerDevelopmentPlan, MilestoneStatus } from '../../../types';

const MILESTONE_STATUS_COLORS: Record<string, string> = {
  'not-started': '#6C757D',
  'in-progress': '#3B8CDE',
  completed: '#28A745',
  blocked: '#DC3545',
};

const HORIZON_LABELS: Record<string, string> = {
  '6-months': '6 Months',
  '12-months': '12 Months',
  '24-months': '24 Months',
};

export const CareerSection: React.FC = () => {
  const [plans, setPlans] = useState<CareerDevelopmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCareerPlans();
      setPlans(data);
    } catch {
      setError('Failed to load career plans');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (planId: string, milestoneId: string, status: MilestoneStatus) => {
    try {
      const updated = await updateMilestoneStatus(planId, milestoneId, status);
      if (updated) {
        setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      }
    } catch {
      setError('Failed to update milestone');
    }
  };

  if (isLoading) return <LoadingState height="300px" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (plans.length === 0) {
    return (
      <EmptyState
        title="No career plan yet"
        description="Create a career development plan with milestones to track your growth."
        actionLabel="Create a Career Plan"
        onAction={() => {}}
      />
    );
  }

  return (
    <div className="ee-list">
      {plans.map((plan) => {
        const completed = plan.milestones.filter((m) => m.status === 'completed').length;
        const progress = Math.round((completed / plan.milestones.length) * 100);
        return (
          <div key={plan.id} className="ee-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <div>
                <strong style={{color: 'var(--color-sf-brand-solid-primary)'}}>{plan.employeeName}</strong>
                <div className="ee-muted">
                  {plan.currentRole}
                  {plan.targetRole ? <> → <strong>{plan.targetRole}</strong></> : ' → Exploratory'}
                </div>
              </div>
              <span className="ee-badge" style={{ background: STATUS_COLORS[plan.status] }}>
                {CAREER_PLAN_STATUS_LABELS[plan.status]}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6C757D', marginBottom: 12 }}>
              <span>⏳ {HORIZON_LABELS[plan.horizon]}</span>
              <span>📊 {completed}/{plan.milestones.length} milestones ({progress}%)</span>
              {plan.lastReviewedAt && <span>🔍 Reviewed {new Date(plan.lastReviewedAt).toLocaleDateString()}</span>}
            </div>

            <div style={{ marginBottom: 12 }}>
              <ProgressBarComponent
                id={`career-progress-${plan.id}`}
                type="Linear"
                height="8px"
                value={progress}
                trackThickness={8}
                progressThickness={8}
                animation={{ enable: true, duration: 800 }}
              />
            </div>

            <GridComponent
              dataSource={plan.milestones}
              allowPaging={false}
              allowSorting={false}
              height="auto"
            >
              <ColumnsDirective>
                <ColumnDirective field="title" headerText="Milestone" clipMode='EllipsisWithTooltip' width='150' />
                <ColumnDirective field="targetDate" headerText="Target" width='80' textAlign='Right' template={(props: any) => new Date(props.targetDate).toLocaleDateString()} />
                <ColumnDirective
                  field="status" width='110'
                  headerText="Status"
                  template={(props: any) => (
                    <span className="ee-badge" style={{ background: MILESTONE_STATUS_COLORS[props.status] }}>
                      {props.status.replace('-', ' ')}
                    </span>
                  )}
                />
                <ColumnDirective
                  headerText="Update" width='130'
                  template={(props: any) => (
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropDownListComponent
                        id={`status-${props.id}`}
                        dataSource={MILESTONE_STATUS_OPTIONS}
                        fields={{ text: 'label', value: 'value' }}
                        text={MILESTONE_STATUS_OPTIONS.find((o) => o.value === props.status)?.label ?? props.status}
                        value={props.status}
                        change={(e: any) => handleStatusChange(plan.id, props.id, e.value as MilestoneStatus)}
                        width="130px"
                      />
                    </div>
                  )}
                />
              </ColumnsDirective>
            </GridComponent>
          </div>
        );
      })}
    </div>
  );
};
