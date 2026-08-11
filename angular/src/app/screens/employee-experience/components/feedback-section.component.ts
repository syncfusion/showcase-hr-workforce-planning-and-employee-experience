// FeedbackSection — mirrors src/screens/EmployeeExperience/components/FeedbackSection.tsx
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import {
  NumericTextBoxModule,
  TextAreaModule,
} from '@syncfusion/ej2-angular-inputs';
import {
  AccumulationChartModule,
  PieSeriesService,
  AccumulationDataLabelService,
  AccumulationLegendService,
  AccumulationTooltipService,
} from '@syncfusion/ej2-angular-charts';
import {
  GridModule,
  PageService,
  SortService,
} from '@syncfusion/ej2-angular-grids';
import {
  ChipListModule,
  ButtonModule,
} from '@syncfusion/ej2-angular-buttons';

import { LoadingStateComponent } from '../../../components/states/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../components/states/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../components/states/error-state/error-state.component';
import { EmployeeExperienceService } from '../../../services/employee-experience.service';
import type {
  PulseSurvey,
  ThemeSentiment,
} from '../../../models/employee-experience.model';

// -----------------------------------------------------------------------------
// Visual helpers — map raw values onto Syncfusion chip variants and design
// tokens used elsewhere in the Employee Experience screen. Keeping the mapping
// in one place makes it trivial to retune the palette without touching JSX.
// -----------------------------------------------------------------------------

type ChipVariant = 'e-success' | 'e-warning' | 'e-danger' | 'e-info' | 'e-outline';

const STATUS_TO_CHIP: Record<string, ChipVariant> = {
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

const rateFill = (rate: number): string =>
  rate >= 75 ? RATE_FILL_HIGH : rate >= 50 ? RATE_FILL : RATE_FILL_LOW;

interface ChartPoint {
  x: string;
  y: number;
}

interface PriorityTag {
  label: string;
  icon: string;
  variant: ChipVariant;
  title?: string;
}

function getPriorityTags(survey: PulseSurvey): PriorityTag[] {
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
    tags.push({
      label: 'Participation below target',
      icon: '🟡',
      variant: 'e-warning',
    });
  }

  if (!survey.closeAt && survey.responseRate >= 75) {
    tags.push({ label: 'High impact', icon: '🟢', variant: 'e-success' });
  }

  return tags;
}

@Component({
  selector: 'app-feedback-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NumericTextBoxModule,
    TextAreaModule,
    AccumulationChartModule,
    GridModule,
    ChipListModule,
    ButtonModule,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  providers: [
    PieSeriesService,
    AccumulationDataLabelService,
    AccumulationLegendService,
    AccumulationTooltipService,
    PageService,
    SortService,
  ],
  templateUrl: './feedback-section.component.html',
  styleUrl: './feedback-section.component.css',
})
export class FeedbackSectionComponent implements OnInit {
  private readonly service = inject(EmployeeExperienceService);

  protected readonly surveys = signal<PulseSurvey[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly activeSurveyId = signal<string | null>(null);
  protected readonly sentimentValue = signal(75);
  protected readonly comment = signal('');
  protected readonly submitting = signal(false);

  // Expose rate-fill helper to the template.
  protected readonly rateFill = (rate: number) => rateFill(rate);

  // Chart binding — derived only from active surveys.
  protected readonly chartData = computed<ChartPoint[]>(() =>
    this.surveys()
      .filter((s) => s.status === 'active')
      .map((s) => ({ x: s.title, y: s.responseRate })),
  );

  protected readonly allThemes = computed<ThemeSentiment[]>(() =>
    this.surveys()
      .filter((s) => s.themes.length > 0)
      .flatMap((s) => s.themes),
  );

  protected readonly openCount = computed<number>(
    () => this.surveys().filter((s) => s.status !== 'closed').length,
  );
  protected readonly closedCount = computed<number>(
    () => this.surveys().length - this.openCount(),
  );

  // Pie chart configuration.
  protected readonly pieInnerRadius = '40%';
  protected readonly pieDataLabel = {
    visible: true,
    name: 'y',
    position: 'Outside',
  } as const;

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      const data = await this.service.getPulseSurveys();
      this.surveys.set(data);
    } catch {
      this.error.set('Failed to load pulse surveys');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected retry(): void {
    void this.load();
  }

  protected readonly retryFn: () => void = () => this.retry();

  protected startSurvey(id: string): void {
    this.activeSurveyId.set(id);
  }

  protected cancelSurvey(): void {
    this.activeSurveyId.set(null);
    this.comment.set('');
    this.sentimentValue.set(75);
  }

  protected tagsFor(survey: PulseSurvey): PriorityTag[] {
    return getPriorityTags(survey);
  }

  protected statusVariant(s: PulseSurvey): ChipVariant {
    return STATUS_TO_CHIP[s.status] ?? 'e-outline';
  }

  protected onSentimentChange(value: number | null | undefined): void {
    if (typeof value === 'number') {
      this.sentimentValue.set(value);
    }
  }

  protected onCommentInput(value: string): void {
    this.comment.set(value);
  }

  protected async handleSubmitResponse(event: Event): Promise<void> {
    event.preventDefault();
    const surveyId = this.activeSurveyId();
    if (!surveyId) return;
    this.submitting.set(true);
    try {
      await this.service.submitPulseResponse(
        surveyId,
        this.sentimentValue(),
        this.comment() || null,
      );
      this.activeSurveyId.set(null);
      this.comment.set('');
      this.sentimentValue.set(75);
      await this.load();
    } catch {
      this.error.set('Failed to submit pulse response');
    } finally {
      this.submitting.set(false);
    }
  }

  protected buildMeta(s: PulseSurvey): string {
    const cadence = s.cadence ? `${s.cadence} • ` : '';
    const responses = `${s.totalResponses} response${s.totalResponses === 1 ? '' : 's'}`;
    const close = s.closeAt
      ? ` • closes ${new Date(s.closeAt).toLocaleDateString()}`
      : ' • evergreen';
    return `${cadence}${responses} • ${s.responseRate}% response rate${close}`;
  }

  protected clampRate(rate: number): number {
    return Math.max(0, Math.min(100, rate));
  }

  protected sentimentVariant(sentiment: number): ChipVariant {
    return sentimentToChip(sentiment);
  }

  protected sentimentText(sentiment: number): string {
    return sentimentLabel(sentiment);
  }
}
