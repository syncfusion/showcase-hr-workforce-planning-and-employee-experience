// KpiCard — mirrors src/screens/Overview/components/KpiCard.tsx
// (SparklineComponent comes from ej2-angular wrapper, imported via the
// AllModule export to get its required services.)
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SparklineAllModule } from '@syncfusion/ej2-angular-charts';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';
import type { KpiTrendPoint } from '../../../../models/overview.model';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SparklineAllModule, ChipListModule],
  template: `
    <div
      class="e-card"
      [class.kpi-card--risk]="isRiskHighlight()"
      [class.kpi-card--clickable]="!!onClick()"
      [style.cursor]="onClick() ? 'pointer' : 'default'"
      [attr.role]="onClick() ? 'button' : null"
      [attr.tabindex]="onClick() ? 0 : null"
      [attr.aria-label]="title() + ': ' + value()"
      (click)="onClick()?.()"
      (mouseenter)="onMouseEnter($event)"
      (mouseleave)="onMouseLeave($event)"
    >
      <!-- ── Header row: Title + badge ── -->
      <div class="e-card-header">
        <div class="kpi-card__title">{{ title() }}</div>
        @if (isRiskHighlight()) {
          <ejs-chiplist
            cssClass="e-danger risk-chip"
            title="Risk exceeded threshold"
          >
            <e-chips>
              <e-chip text="HIGH RISK"></e-chip>
            </e-chips>
          </ejs-chiplist>
        }
      </div>

      <!-- ── Body ── -->
      <div class="e-card-content">
        <!-- Value + Context -->
        <div class="kpi-card__value-row">
          <div class="kpi-card__value-col">
            <div
              class="kpi-card__value"
              [class.kpi-card__value--risk]="isRiskHighlight()"
            >
              {{ value() }}
            </div>
            <ejs-chiplist
              class="kpi-card__change"
              [cssClass]="isPositive() ? 'e-success' : 'e-danger'"
              title="Change since previous month"
            >
              <e-chips>
                <e-chip [text]="changeLabel()"></e-chip>
              </e-chips>
            </ejs-chiplist>
          </div>

          <!-- Sparkline — last 6 months -->
          <div
            class="kpi-card__sparkline"
            title="Last 6 months trend"
          >
            <ejs-sparkline
              [id]="sparkId()"
              [dataSource]="trendData()"
              xName="x"
              yName="yval"
              type="Line"
              height="40px"
              width="100%"
              [fill]="color()"
              lineWidth="2"
              [border]="{ color: color(), width: 2 }"
              [tooltipSettings]="{ visible: true, format: '&#36;{x}: &#36;{yval}' }"
            ></ejs-sparkline>
          </div>
        </div>

        <!-- Contextual line -->
        <div class="kpi-card__context">{{ context() }}</div>
      </div>
    </div>
  `,
  styleUrl: './kpi-card.component.css',
})
export class KpiCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string>();
  readonly change = input.required<number>();
  readonly trendData = input.required<KpiTrendPoint[]>();
  readonly context = input.required<string>();
  readonly color = input<string>('#3B8CDE');
  readonly riskThreshold = input<number>(20);
  readonly riskValue = input<number | undefined>(undefined);
  /**
   * When true, an UPWARD change is treated as a NEGATIVE outcome
   * (e.g. Retention Risk, Open Requisitions). The delta arrow,
   * sign prefix, and chip color are all flipped accordingly.
   */
  readonly invertTrend = input<boolean>(false);
  readonly onClick = input<(() => void) | undefined>(undefined);

  // Raw direction: 'up' if change is non-negative, otherwise 'down'.
  // The chip color (isPositive) is then derived by inverting based on invertTrend:
  //   invertTrend=false (default): change >= 0 → good (green ▲), change < 0 → bad (red ▼)
  //   invertTrend=true             : change >= 0 → bad  (red ▲), change < 0 → good (green ▼)
  protected readonly isPositive = computed(() => {
    const isUp = this.change() >= 0;
    return this.invertTrend() ? !isUp : isUp;
  });
  protected readonly isRiskHighlight = computed(
    () => this.riskValue() !== undefined && this.riskValue()! > this.riskThreshold(),
  );

  protected readonly changeLabel = computed(() => {
    const isUp = this.change() >= 0;
    const arrow = isUp ? '▲' : '▼';
    const sign = isUp ? '+' : '−';
    return `${arrow} ${sign}${Math.abs(this.change())} since last month`;
  });

  protected readonly sparkId = computed(() => `spark-${this.title().replace(/\s+/g, '-').toLowerCase()}`);

  protected onMouseEnter(ev: MouseEvent): void {
    const el = ev.currentTarget as HTMLElement;
    if (this.isRiskHighlight()) {
      el.style.boxShadow = '0 0 0 1px var(--color-sf-error-200), var(--shadow-md)';
    } else {
      el.style.boxShadow = 'var(--shadow-md)';
    }
    el.style.transform = 'translateY(-1px)';
  }

  protected onMouseLeave(ev: MouseEvent): void {
    const el = ev.currentTarget as HTMLElement;
    if (this.isRiskHighlight()) {
      el.style.boxShadow = '0 0 0 1px var(--color-sf-error-100), var(--shadow-default)';
    } else {
      el.style.boxShadow = 'var(--shadow-default)';
    }
    el.style.transform = 'translateY(0)';
  }
}
