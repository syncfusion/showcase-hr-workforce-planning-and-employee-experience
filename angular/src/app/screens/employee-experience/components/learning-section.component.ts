// LearningSection — mirrors src/screens/EmployeeExperience/components/LearningSection.tsx
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import {
  ProgressBarModule,
} from '@syncfusion/ej2-angular-progressbar';
import {
  DropDownListModule,
} from '@syncfusion/ej2-angular-dropdowns';

import { LoadingStateComponent } from '../../../components/states/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../components/states/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../components/states/error-state/error-state.component';
import { EmployeeExperienceService } from '../../../services/employee-experience.service';
import {
  LEARNING_FORMATS,
  LEARNING_STATUS_OPTIONS,
} from '../employee-experience.config';
import type {
  LearningRecommendation,
  LearningStatus,
} from '../../../models/employee-experience.model';

const FORMAT_LABELS: Record<string, string> = Object.fromEntries(
  LEARNING_FORMATS.map((f) => [f.value, f.label]),
);

type StatusFilter = LearningStatus | 'all';
type FormatFilter = string | 'all';

interface StatusOption {
  value: StatusFilter;
  label: string;
}
interface FormatOption {
  value: FormatFilter;
  label: string;
}

@Component({
  selector: 'app-learning-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ProgressBarModule,
    DropDownListModule,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  providers: [],
  templateUrl: './learning-section.component.html',
  styleUrl: './learning-section.component.css',
})
export class LearningSectionComponent implements OnInit {
  private readonly service = inject(EmployeeExperienceService);

  protected readonly items = signal<LearningRecommendation[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly statusFilter = signal<StatusFilter>('all');
  protected readonly formatFilter = signal<FormatFilter>('all');

  protected readonly statusOptions: StatusOption[] = [
    { value: 'all', label: 'All' },
    ...LEARNING_STATUS_OPTIONS,
  ];
  protected readonly formatOptions: FormatOption[] = [
    { value: 'all', label: 'All' },
    ...LEARNING_FORMATS,
  ];

  protected readonly filtered = computed<LearningRecommendation[]>(() => {
    const status = this.statusFilter();
    const format = this.formatFilter();
    return this.items().filter(
      (l) =>
        (status === 'all' || l.status === status) &&
        (format === 'all' || l.format === format),
    );
  });

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      const data = await this.service.getLearningRecommendations();
      this.items.set(data);
    } catch {
      this.error.set('Failed to load recommendations');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected retry(): void {
    void this.load();
  }

  protected onStatusFilterChange(value: string | number | null): void {
    if (value === null || value === undefined) return;
    this.statusFilter.set(value as StatusFilter);
  }

  protected onFormatFilterChange(value: string | number | null): void {
    if (value === null || value === undefined) return;
    this.formatFilter.set(value as FormatFilter);
  }

  protected async setStatus(
    id: string,
    status: LearningStatus,
  ): Promise<void> {
    try {
      const updated = await this.service.updateLearningStatus(id, status);
      if (updated) {
        this.items.update((prev) =>
          prev.map((l) => (l.id === id ? updated : l)),
        );
      }
    } catch {
      this.error.set('Failed to update recommendation');
    }
  }

  protected formatLabel(format: string): string {
    return FORMAT_LABELS[format] ?? format;
  }
  protected matchScorePercent(score: number | null | undefined): number {
    return Math.round((score ?? 0) * 100);
  }

  protected readonly retryFn: () => void = () => this.retry();
}
