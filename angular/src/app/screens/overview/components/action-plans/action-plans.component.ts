// ActionPlans — mirrors src/screens/Overview/components/ActionPlans.tsx
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProgressBarAllModule } from '@syncfusion/ej2-angular-progressbar';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import type { ActionPlan } from '../../../../models/overview.model';

interface StatusStyle {
  border: string;
  badgeBg: string;
  badgeText: string;
  track: string;
  barColor: string;
}

const STATUS_STYLE_MAP: Record<string, StatusStyle> = {
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

@Component({
  selector: 'app-action-plans',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressBarAllModule, ChipListModule],
  template: `
    <div class="action-plans-grid">
      @for (plan of data(); track plan.id) {
        @let style = statusStyleFor(plan.statusColor);
        <div
          class="action-card e-card"
          [style.border-top]="'3px solid ' + style.border"
          (mouseenter)="onMouseEnter($event)"
          (mouseleave)="onMouseLeave($event)"
        >
          <!-- Category & Status top area -->
          <div class="action-card__head">
            <span class="action-card__category">{{ plan.category }}</span>
            <div class="action-card__badge-wrap">
              <ejs-chiplist
                class="action-card__badge"
                [cssClass]="chipClassFor(plan.statusColor)"
              >
                <e-chips>
                  <e-chip [text]="plan.statusLabel"></e-chip>
                </e-chips>
              </ejs-chiplist>
            </div>
          </div>

          <!-- Title and description -->
          <div class="action-card__body">
            <div class="action-card__title">{{ plan.title }}</div>
            <div class="action-card__description">{{ plan.description }}</div>
          </div>

          <!-- Progress bar bottom -->
          <div class="action-card__progress-row">
            <ejs-progressbar
              [id]="'progress-' + plan.id"
              type="Linear"
              [value]="plan.progress"
              height="6"
              width="100%"
              trackThickness="6"
              progressThickness="6"
              cornerRadius="Round"
              [showProgressValue]="false"
              [progressColor]="style.barColor"
              [trackColor]="style.track"
              [animation]="{ enable: true, duration: 800 }"
            ></ejs-progressbar>
            <span class="action-card__progress-label">{{ plan.progress }}%</span>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './action-plans.component.css',
})
export class ActionPlansComponent {
  readonly data = input.required<ActionPlan[]>();

  protected statusStyleFor(color: string): StatusStyle {
    return STATUS_STYLE_MAP[color] ?? STATUS_STYLE_MAP['primary'];
  }

  /** Maps a plan statusColor to a Syncfusion chip cssClass. */
  protected chipClassFor(color: ActionPlan['statusColor']): string {
    switch (color) {
      case 'danger':
        return 'e-danger';
      case 'warning':
        return 'e-warning';
      case 'success':
        return 'e-success';
      case 'primary':
        return 'e-primary';
    }
  }

  protected onMouseEnter(ev: MouseEvent): void {
    const el = ev.currentTarget as HTMLElement;
    el.style.boxShadow = 'var(--shadow-md)';
    el.style.transform = 'translateY(-1px)';
  }

  protected onMouseLeave(ev: MouseEvent): void {
    const el = ev.currentTarget as HTMLElement;
    el.style.boxShadow = '';
    el.style.transform = '';
  }
}
