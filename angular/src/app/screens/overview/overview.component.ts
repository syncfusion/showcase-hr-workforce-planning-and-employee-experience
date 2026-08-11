// Overview screen — mirrors src/screens/Overview/index.tsx
// API: GET https://localhost:59527/api/overview  (no changes to endpoint or payload)
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewChild,
  OnInit,
} from '@angular/core';
import { ButtonAllModule } from '@syncfusion/ej2-angular-buttons';
import { DialogAllModule } from '@syncfusion/ej2-angular-popups';
import { ToastAllModule, ToastComponent } from '@syncfusion/ej2-angular-notifications';
import { DropDownListAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { TextBoxAllModule } from '@syncfusion/ej2-angular-inputs';
import { firstValueFrom } from 'rxjs';

import { PageHeaderComponent } from '../../components/layout/page-header/page-header.component';
import { LoadingStateComponent } from '../../components/states/loading-state/loading-state.component';
import { ErrorStateComponent } from '../../components/states/error-state/error-state.component';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { RequisitionGridComponent } from './components/requisition-grid/requisition-grid.component';
import { DetailPanelComponent } from './components/detail-panel/detail-panel.component';
import { ActionPlansComponent } from './components/action-plans/action-plans.component';

import { OverviewService, OverviewResponse } from '../../services/overview.service';
import type {
  KpiData,
  KpiCardData,
  ActiveRequisition,
  ActivityTimelineEvent,
  AiInsight,
  ActionPlan,
} from '../../models/overview.model';


const KPI_CARD_ORDER = ['Total Headcount', 'Open Requisitions', 'Engagement Score', 'Retention Risk'];
const NEW_PLAN_CATEGORIES = ['Retention', 'Recruiting', 'Diversity', 'Engagement', 'Operations'];
const STATUS_COLORS = [
  { id: 'primary', label: 'Planned' },
  { id: 'success', label: 'On Track' },
  { id: 'warning', label: 'At Risk' },
  { id: 'danger', label: 'Blocked' },
];

@Component({
  selector: 'app-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonAllModule,
    DialogAllModule,
    ToastAllModule,
    DropDownListAllModule,
    TextBoxAllModule,
    PageHeaderComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    KpiCardComponent,
    RequisitionGridComponent,
    DetailPanelComponent,
    ActionPlansComponent,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css',
})
export class OverviewComponent implements OnInit {
  private readonly overviewService = inject(OverviewService);

  @ViewChild('toast', { static: false })
  private toast?: ToastComponent;

  protected readonly kpi = signal<KpiData | null>(null);
  protected readonly kpiCards = signal<KpiCardData[]>([]);
  protected readonly requisitions = signal<ActiveRequisition[]>([]);
  protected readonly activityTimeline = signal<ActivityTimelineEvent[]>([]);
  protected readonly aiInsight = signal<AiInsight | null>(null);
  protected readonly actionPlans = signal<ActionPlan[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);

  // AI Insight generation state — `generatingInsight` and `insightError`
  // are owned by the parent and pushed into `<app-detail-panel>` so the
  // child can render the right card state (empty / loading / error /
  // insight) without the parent losing the cached fallback. Mirrors
  // React's `cachedAiInsightRef` + the `generatingInsight` / `insightError`
  // useState pair in `Overview/index.tsx`.
  protected readonly generatingInsight = signal(false);
  protected readonly insightError = signal<string | null>(null);
  private cachedAiInsight: AiInsight | null = null;

  // New Plan Dialog State
  protected readonly showDialog = signal(false);
  protected readonly newPlanTitle = signal('');
  protected readonly newPlanDescription = signal('');
  protected readonly newPlanCategory = signal('Retention');
  protected readonly newPlanStatusColor = signal<string>('primary');

  protected readonly statusColors = STATUS_COLORS;
  protected readonly statusColorFields = { text: 'label', value: 'id' };
  protected readonly newPlanCategories = NEW_PLAN_CATEGORIES;

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading.set(true);
      const data: OverviewResponse = await firstValueFrom(this.overviewService.fetchOverview());
      this.kpi.set(data.kpi);
      this.kpiCards.set(this.sortKpiCards(data.kpiCards as KpiCardData[]));
      this.requisitions.set(data.requisitions);
      this.activityTimeline.set(data.activityTimeline);
      // Cache the seeded insight so the Generate-AI-Insight flow can fall
      // back to it on a 503 / network error (mirrors the React client's
      // `cachedAiInsightRef`). The signal is set to `null` so the card
      // renders the "Generate AI Insight" CTA on first paint.
      this.cachedAiInsight = data.aiInsight;
      this.aiInsight.set(null);
      this.actionPlans.set(data.actionPlans);
      this.error.set(null);
    } catch (err) {
      console.error('Failed to load overview data', err);
      this.error.set('Failed to load dashboard data');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected onRetry(): void {
    window.location.reload();
  }

  // -------------------------------------------------------------------------
  // AI Insight — Generate / Dismiss
  // -------------------------------------------------------------------------
  // Mirrors the React `onGenerateInsight` async handler in
  // `src/screens/Overview/index.tsx`. The parent owns the `cachedAiInsight`
  // fallback + the loading/error state, the child just renders whichever
  // state is current and exposes a "Generate" CTA when the insight is null.
  protected async handleGenerateInsight(): Promise<AiInsight | void> {
    if (!this.cachedAiInsight) {
      // No seed available — nothing to regenerate from. The child
      // should not have surfaced a Generate button in this case, but
      // guard anyway so we never POST an empty employeeId.
      this.insightError.set('No employee context available to generate an insight.');
      return;
    }
    const employeeId = this.cachedAiInsight.employeeId;
    const fallback = this.cachedAiInsight;
    this.generatingInsight.set(true);
    this.insightError.set(null);
    try {
      const generated = await firstValueFrom(this.overviewService.generateAiInsight(employeeId));
      this.aiInsight.set(generated);
      // Refresh the cache so a subsequent dismiss + generate still has a
      // sensible fallback (matches the React behavior where the cache is
      // only ever set once during initial load — but a generated insight
      // is a better starting point than the original seed).
      this.cachedAiInsight = generated;
    } catch (err) {
      // On 503 / network error, fall back to the cached insight so the
      // card collapses back to the seeded view (matches React's
      // `try { setAiInsight(generated) } catch { setAiInsight(fallback) }`).
      // The failure is surfaced as a non-blocking error toast so the
      // user always sees the cached insight AND knows the network call
      // didn't succeed — the React client silently swallows 503s which
      // is misleading when the AI is disabled in the environment.
      console.warn('Failed to generate AI insight, showing cached fallback.', err);
      this.aiInsight.set(fallback);
      this.handleShowToast({
        title: 'AI Insight Unavailable',
        content:
          'Live AI generation is disabled in this environment. Showing the most recent insight instead.',
      });
    } finally {
      this.generatingInsight.set(false);
    }
  }

  protected handleDismissInsight(): void {
    // Clear the insight so the card re-renders the "Generate AI Insight"
    // CTA. The cache stays so a subsequent generate re-uses the same
    // fallback path.
    this.aiInsight.set(null);
    this.insightError.set(null);
  }

  // -------------------------------------------------------------------------
  // Toast — Quick Action dialog confirmations
  // -------------------------------------------------------------------------
  // Surfaced as `onShowToast` on the child. Uses the screen-level
  // `<ejs-toast #toast>` so clipboard, mailto/tel, and dialog
  // confirmations share the same feedback surface.
  protected handleShowToast(result: { title: string; content: string }): void {
    this.toast?.show({
      title: result.title,
      content: result.content,
      cssClass: 'e-toast-success',
      icon: 'e-success toast-icons',
    });
  }

  protected handleViewRequisition(req: ActiveRequisition): void {
    // No-op: requisition detail navigation is not yet implemented.
    void req;
  }

  protected openNewPlanDialog(): void {
    this.newPlanTitle.set('');
    this.newPlanDescription.set('');
    this.newPlanCategory.set(NEW_PLAN_CATEGORIES[0]);
    this.newPlanStatusColor.set(STATUS_COLORS[0].id);
    this.showDialog.set(true);
  }

  protected closeDialog(): void {
    this.showDialog.set(false);
  }

  protected onTitleChange(value: string): void {
    this.newPlanTitle.set(value ?? '');
  }

  protected onDescriptionChange(value: string): void {
    this.newPlanDescription.set(value ?? '');
  }

  protected onCategoryChange(value: string): void {
    this.newPlanCategory.set(value ?? NEW_PLAN_CATEGORIES[0]);
  }

  protected onStatusColorChange(value: string): void {
    this.newPlanStatusColor.set(value ?? STATUS_COLORS[0].id);
  }

  protected get dialogButtons() {
    return [
      {
        click: () => this.closeDialog(),
        buttonModel: { content: 'Cancel', cssClass: 'e-secondary' },
      },
      {
        click: () => this.handleSavePlan(),
        buttonModel: { content: 'Save', cssClass: 'e-primary' },
      },
    ];
  }

  protected handleSavePlan(): void {
    const title = this.newPlanTitle().trim();
    if (!title) return;
    const description = this.newPlanDescription().trim();
    const statusId = this.newPlanStatusColor();
    const statusLabel = this.statusColors.find((s) => s.id === statusId)?.label ?? 'Planned';
    const newPlan: ActionPlan = {
      id: Date.now().toString(),
      title,
      description,
      category: this.newPlanCategory(),
      statusColor: statusId as 'primary' | 'success' | 'warning' | 'danger',
      statusLabel,
      progress: 0,
    };
    this.actionPlans.update((prev) => [newPlan, ...prev]);
    this.showDialog.set(false);
    this.toast?.show({
      title: 'Success',
      content: `Action plan "${newPlan.title}" created successfully.`,
      cssClass: 'e-toast-success',
      icon: 'e-success toast-icons',
    });
  }

  protected isRetentionRiskCard(card: KpiCardData): boolean {
    return card.title === 'Retention Risk';
  }

  private sortKpiCards(cards: KpiCardData[]): KpiCardData[] {
    return [...cards].sort((a, b) => {
      const ai = KPI_CARD_ORDER.indexOf(a.title);
      const bi = KPI_CARD_ORDER.indexOf(b.title);
      const aOrder = ai === -1 ? Number.POSITIVE_INFINITY : ai;
      const bOrder = bi === -1 ? Number.POSITIVE_INFINITY : bi;
      return aOrder - bOrder;
    });
  }
}
