// CareerSection — mirrors src/screens/EmployeeExperience/components/CareerSection.tsx
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import {
  ProgressBarModule,
} from '@syncfusion/ej2-angular-progressbar';
import {
  GridModule,
  PageService,
  SortService,
} from '@syncfusion/ej2-angular-grids';
import {
  DropDownListModule,
} from '@syncfusion/ej2-angular-dropdowns';

import { LoadingStateComponent } from '../../../components/states/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../components/states/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../components/states/error-state/error-state.component';
import { EmployeeExperienceService } from '../../../services/employee-experience.service';
import {
  CAREER_PLAN_STATUS_LABELS,
  MILESTONE_STATUS_OPTIONS,
  STATUS_COLORS,
} from '../employee-experience.config';
import type {
  CareerDevelopmentPlan,
  MilestoneStatus,
} from '../../../models/employee-experience.model';

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

@Component({
  selector: 'app-career-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ProgressBarModule,
    GridModule,
    DropDownListModule,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  providers: [PageService, SortService],
  templateUrl: './career-section.component.html',
  styleUrl: './career-section.component.css',
})
export class CareerSectionComponent implements OnInit {
  private readonly service = inject(EmployeeExperienceService);

  protected readonly plans = signal<CareerDevelopmentPlan[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly milestoneStatusOptions: typeof MILESTONE_STATUS_OPTIONS =
    MILESTONE_STATUS_OPTIONS;
  protected readonly milestoneStatusValues: MilestoneStatus[] =
    MILESTONE_STATUS_OPTIONS.map((o) => o.value);
  protected readonly milestoneStatusFields = { text: 'label', value: 'value' };
  protected readonly horizonLabels: Record<string, string> = HORIZON_LABELS;

  protected milestoneStatusLabel(s: string): string {
    return MILESTONE_STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
  }

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      const data = await this.service.getCareerPlans();
      this.plans.set(data);
    } catch {
      this.error.set('Failed to load career plans');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected retry(): void {
    void this.load();
  }

  protected progressFor(plan: CareerDevelopmentPlan): number {
    if (plan.milestones.length === 0) return 0;
    const completed = plan.milestones.filter(
      (m) => m.status === 'completed',
    ).length;
    return Math.round((completed / plan.milestones.length) * 100);
  }

  protected completedCount(plan: CareerDevelopmentPlan): number {
    return plan.milestones.filter((m) => m.status === 'completed').length;
  }

  protected statusLabel(s: string): string {
    return CAREER_PLAN_STATUS_LABELS[s] ?? s;
  }
  protected statusColor(s: string): string {
    return STATUS_COLORS[s] ?? '#6C757D';
  }
  protected milestoneStatusColor(s: string): string {
    return MILESTONE_STATUS_COLORS[s] ?? '#6C757D';
  }
  protected formatDate(value: string): string {
    return new Date(value).toLocaleDateString();
  }

  protected async onMilestoneChange(
    planId: string,
    milestoneId: string,
    value: string | number | null,
  ): Promise<void> {
    if (typeof value !== 'string') return;
    try {
      const updated = await this.service.updateMilestoneStatus(
        planId,
        milestoneId,
        value as MilestoneStatus,
      );
      if (updated) {
        this.plans.update((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
      }
    } catch {
      this.error.set('Failed to update milestone');
    }
  }

  protected readonly retryFn: () => void = () => this.retry();
  protected readonly noopFn: () => void = () => undefined;
}
