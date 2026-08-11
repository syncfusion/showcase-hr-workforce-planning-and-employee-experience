// Workforce Planning screen — mirrors src/screens/WorkforcePlanning/index.tsx
// API:
//   GET https://localhost:59527/api/workforce-planning/plans
//   GET https://localhost:59527/api/workforce-planning/scenarios?planId=<id>
//   GET https://localhost:59527/api/workforce-planning/line-items
// (no changes to endpoint or payload shape)

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import {
  ChartModule,
  BarSeriesService,
  CategoryService,
  TooltipService,
  LegendService,
  DataLabelService,
} from '@syncfusion/ej2-angular-charts';
import { DropDownListModule, ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ChipListModule } from '@syncfusion/ej2-angular-buttons';

import { PageHeaderComponent } from '../../components/layout/page-header/page-header.component';
import { LoadingStateComponent } from '../../components/states/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../components/states/error-state/error-state.component';
import { EmptyStateComponent } from '../../components/states/empty-state/empty-state.component';
import { WorkforcePlanningService } from '../../services/workforce-planning.service';
import { planningSnapshots } from '../../services/planning-snapshots.mock';
import type {
  WorkforcePlan,
  WorkforceScenario,
  WorkforceLineItem,
  PlanningSnapshot,
  WorkforceConfidence,
  WorkforcePlanStatus,
} from '../../models/workforce-planning.model';

interface ChartRow {
  functionName: string;
  current: number;
  planned: number;
  open: number;
}

const STATUS_COLOR_MAP: Record<string, string> = {
  active: 'e-success',
  draft: 'e-warning',
  archived: 'e-info',
};

const CONFIDENCE_COLOR_MAP: Record<string, string> = {
  high: 'e-danger',
  medium: 'e-warning',
  low: 'e-success',
};

const CONFIDENCE_LABEL_MAP: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

@Component({
  selector: 'app-workforce-planning',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ChartModule,
    DropDownListModule,
    ChipListModule,
    PageHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  providers: [
    BarSeriesService,
    CategoryService,
    TooltipService,
    LegendService,
    DataLabelService,
  ],
  templateUrl: './workforce-planning.component.html',
  styleUrl: './workforce-planning.component.css',
})
export class WorkforcePlanningComponent implements OnInit {
  private readonly service = inject(WorkforcePlanningService);
  private readonly cdr = inject(ChangeDetectorRef);

  // --- State signals (mirror the React useState hooks) ---
  protected readonly plans = signal<WorkforcePlan[]>([]);
  protected readonly scenarios = signal<WorkforceScenario[]>([]);
  protected readonly lineItems = signal<WorkforceLineItem[]>([]);
  protected readonly snapshots = signal<PlanningSnapshot[]>(planningSnapshots);
  protected readonly selectedScenarioId = signal<string>('');
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  // --- Derived: the plan rendered in the summary card row ---
  protected readonly activePlan = computed<WorkforcePlan | undefined>(
    () => this.plans()[0],
  );

  protected readonly selectedScenario = computed<WorkforceScenario | undefined>(
    () => {
      const list = this.scenarios();
      const id = this.selectedScenarioId();
      return list.find((s) => s.id === id) || list[0];
    },
  );

  protected readonly baselineScenario = computed<WorkforceScenario | undefined>(
    () =>
      this.scenarios().find((s) => s.type === 'baseline') || this.scenarios()[0],
  );

  // --- Chip-class helpers (mapped through getters so template stays clean) ---
  protected statusChipClass(status: WorkforcePlanStatus | undefined): string {
    if (!status) return 'e-outline';
    return STATUS_COLOR_MAP[status] || 'e-outline';
  }

  protected confidenceChipClass(
    confidence: WorkforceConfidence | undefined,
  ): string {
    if (!confidence) return 'e-outline';
    return CONFIDENCE_COLOR_MAP[confidence] || 'e-outline';
  }

  protected confidenceLabel(
    confidence: WorkforceConfidence | undefined,
  ): string {
    if (!confidence) return '';
    return CONFIDENCE_LABEL_MAP[confidence] || confidence;
  }

  // --- Chart row building (mirrors the React useMemo for chartData) ---
  protected readonly scenarioLineItems = computed<WorkforceLineItem[]>(() => {
    const scenario = this.selectedScenario();
    if (!scenario) return [];
    return this.lineItems().filter((item) => item.scenarioId === scenario.id);
  });

  protected readonly chartData = computed<ChartRow[]>(() => {
    const plan = this.activePlan();
    const items = this.scenarioLineItems();
    if (!plan || items.length === 0) return [];

    const grouped = items.reduce(
      (acc, item) => {
        const key = item.function;
        if (!acc[key]) {
          acc[key] = { current: 0, planned: 0, open: 0 };
        }
        acc[key].current += item.currentHeadcount;
        acc[key].planned += item.plannedHeadcount;
        acc[key].open += item.openRoles || 0;
        return acc;
      },
      {} as Record<string, { current: number; planned: number; open: number }>,
    );

    return Object.entries(grouped).map(([name, vals]) => ({
      functionName: name,
      current: vals.current,
      planned: vals.planned,
      open: vals.open,
    }));
  });

  // --- Scenario picker (DropDownList data + handlers) ---
  protected readonly scenarioOptions = computed<WorkforceScenario[]>(() => {
    const plan = this.activePlan();
    return this.scenarios().filter((scenario) => scenario.planId === plan?.id);
  });

  protected readonly scenarioFields = { text: 'name', value: 'id' };

  protected onScenarioChange(event: ChangeEventArgs): void {
    const value = (event.value as string | null) ?? '';
    this.selectedScenarioId.set(value);
  }

  // --- Chart configuration (mirrors the React ChartComponent props) ---
  protected readonly primaryXAxis = {
    valueType: 'Category' as const,
    title: 'Function',
  };

  protected readonly primaryYAxis = {
    title: 'Headcount',
  };

  protected readonly legendSettings = {
    visible: true,
    position: 'Bottom' as const,
  };

  protected readonly tooltipSettings = { enable: true };

  protected readonly chartHeight = '400px';

  // --- Variance / totals (mirrors the React useMemo blocks) ---
  protected readonly baselineTotals = computed(() => {
    const baseline = this.baselineScenario();
    return {
      headcount: baseline ? baseline.headcountTarget : 0,
      budget: baseline ? baseline.budgetImpact : 0,
      hiring: baseline?.hiringTarget || 0,
    };
  });

  protected readonly selectedTotals = computed(() => {
    const selected = this.selectedScenario();
    return {
      headcount: selected ? selected.headcountTarget : 0,
      budget: selected ? selected.budgetImpact : 0,
      hiring: selected?.hiringTarget || 0,
    };
  });

  protected readonly variance = computed(() => ({
    headcount:
      this.selectedTotals().headcount - this.baselineTotals().headcount,
    budget: this.selectedTotals().budget - this.baselineTotals().budget,
    hiring: this.selectedTotals().hiring - this.baselineTotals().hiring,
  }));

  // --- Variance card helpers (string formatters) ---
  protected formatVarianceHeadcount(): string {
    const v = this.variance().headcount;
    return `${v > 0 ? '+' : ''}${v}`;
  }

  protected formatVarianceBudget(): string {
    const v = this.variance().budget;
    const sign = v > 0 ? '+' : v < 0 ? '-' : '';
    return `${sign}$${(Math.abs(v) / 1_000_000).toFixed(2)}M`;
  }

  protected formatVarianceHiring(): string {
    const v = this.variance().hiring;
    return `${v > 0 ? '+' : ''}${v}`;
  }

  protected formatValue(n: number, isCurrency?: boolean): string {
    return isCurrency ? `$${n.toLocaleString()}` : n.toLocaleString();
  }

  protected formatBudgetMillions(n: number): string {
    return (n / 1_000_000).toFixed(2);
  }

  protected varianceTrendClass(selected: number, baseline: number): string {
    if (selected > baseline) return 'positive';
    if (selected < baseline) return 'negative';
    return 'neutral';
  }

  // --- Plan period helpers ---
  protected formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  protected durationLabel(start: string, end: string): string {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);
    const ms = e.getTime() - s.getTime();
    if (Number.isNaN(ms)) return '';
    const days = Math.round(ms / (1000 * 60 * 60 * 24));
    if (days < 30) return `${days} days`;
    const months = Math.round(days / 30);
    return `${months} month${months === 1 ? '' : 's'}`;
  }

  protected formatPlanPeriodStart(): string {
    return this.formatDate(this.activePlan()?.planningPeriodStart);
  }

  protected formatPlanPeriodEnd(): string {
    return this.formatDate(this.activePlan()?.planningPeriodEnd);
  }

  protected planDurationLabel(): string {
    return this.durationLabel(
      this.activePlan()?.planningPeriodStart ?? '',
      this.activePlan()?.planningPeriodEnd ?? '',
    );
  }

  // --- PlanCard helpers ---
  protected planName(): string {
    return this.activePlan()?.name ?? '—';
  }

  protected planStatus(): WorkforcePlanStatus | undefined {
    return this.activePlan()?.status;
  }

  protected planSnapshotLabel(): string {
    return 'Snapshot: Not Taken';
  }

  // --- ScenarioCard helpers ---
  protected scenarioName(): string {
    return this.selectedScenario()?.name ?? '—';
  }

  protected scenarioConfidence():
    | WorkforceConfidence
    | undefined {
    return this.selectedScenario()?.confidence;
  }

  protected scenarioHeadcount(): number | undefined {
    return this.selectedScenario()?.headcountTarget;
  }

  protected scenarioBudgetMillions(): string {
    const budget = this.selectedScenario()?.budgetImpact;
    if (budget === undefined) return '0.00';
    return (budget / 1_000_000).toFixed(2);
  }

  protected showScenarioMeta(): boolean {
    const s = this.selectedScenario();
    return s !== undefined && (
      s.headcountTarget !== undefined || s.budgetImpact !== undefined
    );
  }

  // --- SnapshotCard helpers ---
  protected snapshotsCount(): number {
    return this.snapshots().length;
  }

  protected latestSnapshotLabel(): string | undefined {
    const list = this.snapshots();
    if (list.length === 0) return undefined;
    return this.formatDate(list[0].capturedAt);
  }

  // --- Header text ---
  protected readonly headerSubtitle =
    'Compare scenarios, staffing gaps, and budget impact';

  // --- EmptyState handlers ---
  protected refresh(): void {
    window.location.reload();
  }

  protected noop(): void {
    // EmptyState action handlers that intentionally do nothing in the
    // current build (the React source uses inline arrow functions).
  }

  // --- Lifecycle ---
  async ngOnInit(): Promise<void> {
    try {
      this.isLoading.set(true);
      const planResult = await firstValueFrom(this.service.getPlans());
      const activePlan = planResult[0];

      const [scenarioResult, lineItemResult] = await Promise.all([
        firstValueFrom(this.service.getScenarios(activePlan?.id)),
        firstValueFrom(this.service.getLineItems()),
      ]);

      this.plans.set(planResult);
      this.scenarios.set(scenarioResult);
      this.lineItems.set(lineItemResult);

      const baseline = scenarioResult.find(
        (s: WorkforceScenario) => s.type === 'baseline',
      );
      this.selectedScenarioId.set(baseline?.id || scenarioResult[0]?.id || '');
      this.error.set(null);
    } catch (err) {
      console.error('Failed to load workforce planning data', err);
      this.error.set('Failed to load workforce planning data');
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }
}
