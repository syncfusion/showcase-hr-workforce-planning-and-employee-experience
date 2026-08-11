import React from 'react';
import { ProgressBarComponent } from '@syncfusion/ej2-react-progressbar';
import { ChipDirective, ChipListComponent, ChipsDirective } from '@syncfusion/ej2-react-buttons';

interface ActionPlan {
  id: string;
  title: string;
  description: string;
  category: string;
  statusColor: 'primary' | 'success' | 'warning' | 'danger';
  statusLabel: string;
  progress: number;
}

interface ActionPlansProps {
  data: ActionPlan[];
}

const statusStyleMap: Record<string, { border: string; badgeBg: string; badgeText: string; track: string; barColor: string }> = {
  danger: {
    border: 'var(--color-sf-error-500)',
    badgeBg: 'var(--color-sf-error-100)',
    badgeText: 'var(--color-sf-error-700)',
    track: 'var(--color-sf-border-secondary)',
    barColor: 'var(--color-sf-error-500)',
  },
  warning: {
    border: 'var(--color-sf-warning-500)',
    badgeBg: 'var(--color-sf-warning-100)',
    badgeText: 'var(--color-sf-warning-700)',
    track: 'var(--color-sf-border-secondary)',
    barColor: 'var(--color-sf-warning-500)',
  },
  success: {
    border: 'var(--color-sf-success-500)',
    badgeBg: 'var(--color-sf-success-100)',
    badgeText: 'var(--color-sf-success-700)',
    track: 'var(--color-sf-border-secondary)',
    barColor: 'var(--color-sf-brand-500)',
  },
  primary: {
    border: 'var(--color-sf-brand-500)',
    badgeBg: 'var(--color-sf-brand-100)',
    badgeText: 'var(--color-sf-brand-700)',
    track: 'var(--color-sf-border-secondary)',
    barColor: 'var(--color-sf-brand-500)',
  },
};

export const ActionPlans: React.FC<ActionPlansProps> = ({ data }) => {
  return (
    <div className="action-plans-grid">
      {data.map((plan) => {
        const style = statusStyleMap[plan.statusColor];
        return (
          <div
            key={plan.id}
            className="e-card"
            style={{
              padding: '0',
              borderRadius: 'var(--card-sm-radius)',
              borderTop: `3px solid ${style.border}`,
              overflow: 'hidden',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '';
              e.currentTarget.style.transform = '';
            }}
          >
            {/* Category & Status top area */}
            <div
              style={{
                padding: '16px 20px 8px',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  color: 'var(--color-sf-fg-quaternary)',
                }}
              >
                {plan.category}
              </span>
              <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center' }}>
                <ChipListComponent>
                  <ChipsDirective>
                    <ChipDirective
                      text={plan.statusLabel}
                      cssClass={`e-${plan.statusColor}`}
                    />
                  </ChipsDirective>
                </ChipListComponent>
              </div>
            </div>

            {/* Title and description */}
            <div style={{ padding: '0 20px 16px' }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: 'var(--color-sf-fg-primary)',
                  marginBottom: '4px',
                }}
              >
                {plan.title}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  lineHeight: 1.45,
                  color: 'var(--color-sf-fg-secondary)',
                  minHeight: '32px',
                }}
              >
                {plan.description}
              </div>
            </div>

            {/* Progress bar bottom */}
            <div
              style={{
                padding: '12px 20px 16px',
                marginTop: 'auto',
                backgroundColor: 'var(--color-sf-surface)',
                borderTop: '1px solid var(--color-sf-border-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                <ProgressBarComponent
                  id={`progress-${plan.id}`}
                  type="Linear"
                  value={plan.progress}
                  height="6"
                  width="100%"
                  trackThickness={6}
                  progressThickness={6}
                  cornerRadius="Round"
                  showProgressValue={false}
                  animation={{ enable: true, duration: 800 }}
                  style={{ display: 'block' }}
                />
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-sf-fg-primary)',
                  minWidth: '36px',
                  textAlign: 'right',
                }}
              >
                {plan.progress}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
