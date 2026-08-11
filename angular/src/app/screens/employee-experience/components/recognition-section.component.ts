// RecognitionSection — mirrors src/screens/EmployeeExperience/components/RecognitionSection.tsx
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import {
  TextAreaModule,
} from '@syncfusion/ej2-angular-inputs';
import {
  DropDownListModule,
} from '@syncfusion/ej2-angular-dropdowns';

import { LoadingStateComponent } from '../../../components/states/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../components/states/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../components/states/error-state/error-state.component';
import { EmployeeExperienceService } from '../../../services/employee-experience.service';
import {
  RECOGNITION_TYPES,
  RECOGNITION_VISIBILITY,
  RECOGNITION_VALUES,
} from '../employee-experience.config';
import type {
  Recognition,
  RecognitionType,
  RecognitionVisibility,
} from '../../../models/employee-experience.model';

interface Peer {
  id: string;
  name: string;
}

const PEERS: Peer[] = [
  { id: 'emp_4502', name: 'Marcus Lee' },
  { id: 'emp_4530', name: 'Priya Nair' },
  { id: 'emp_4490', name: 'John Williams' },
  { id: 'emp_4555', name: 'Sofia Garcia' },
  { id: 'emp_4560', name: 'Liam Becker' },
];

interface FormState {
  toEmployeeId: string;
  toName: string;
  type: RecognitionType;
  message: string;
  value: string | null;
  visibleTo: RecognitionVisibility;
}

const EMPTY_FORM: FormState = {
  toEmployeeId: PEERS[0].id,
  toName: PEERS[0].name,
  type: 'peer-shoutout',
  message: '',
  value: RECOGNITION_VALUES[0],
  visibleTo: 'public',
};

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  RECOGNITION_TYPES.map((t) => [t.value, t.label]),
);
const VISIBILITY_LABELS: Record<string, string> = Object.fromEntries(
  RECOGNITION_VISIBILITY.map((v) => [v.value, v.label]),
);

@Component({
  selector: 'app-recognition-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TextAreaModule,
    DropDownListModule,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './recognition-section.component.html',
  styleUrl: './recognition-section.component.css',
})
export class RecognitionSectionComponent implements OnInit {
  private readonly service = inject(EmployeeExperienceService);

  protected readonly peerOptions = PEERS.map((p) => ({
    text: p.name,
    value: p.id,
  }));
  protected readonly typeValues: RecognitionType[] = RECOGNITION_TYPES.map(
    (t) => t.value,
  );
  protected readonly valueOptions: (string | null)[] = [
    null,
    ...RECOGNITION_VALUES,
  ];
  protected readonly visibilityValues: RecognitionVisibility[] =
    RECOGNITION_VISIBILITY.map((v) => v.value);
  protected readonly typeLabels: Record<string, string> = TYPE_LABELS;
  protected readonly visibilityLabels: Record<string, string> = VISIBILITY_LABELS;

  protected readonly items = signal<Recognition[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly showForm = signal(false);
  protected readonly form = signal<FormState>({ ...EMPTY_FORM });
  protected readonly formError = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected readonly weeklyVolume = computed<number[]>(() => {
    // Distribute deterministically by hashing the id so the chart shows
    // variance even when recognitions share a createdAt (which is the
    // case for the seeded showcase data). Then rebalance so every week
    // has at least 1 item when there is enough data — mirrors the
    // React port in src/screens/EmployeeExperience/components/
    // RecognitionSection.tsx.
    const WEEKS = 8;
    const items = this.items();
    const weeks = Array.from({ length: WEEKS }, () => 0);
    const idHash = (id: string): number => {
      let hash = 0;
      for (let j = 0; j < id.length; j++) {
        hash = ((hash << 5) - hash + id.charCodeAt(j)) | 0;
      }
      return Math.abs(hash);
    };
    items.forEach((r) => {
      weeks[idHash(r.id) % WEEKS] += 1;
    });

    // Guarantee every week shows data when possible.
    if (items.length >= WEEKS) {
      // Repeatedly move one count from the busiest week into a week that
      // is still empty, until either all weeks have data or no week has
      // more than 1 to give.
      let empties = weeks
        .map((v, i) => (v === 0 ? i : -1))
        .filter((i) => i >= 0);
      while (empties.length > 0) {
        const donor = weeks.indexOf(Math.max(...weeks));
        if (weeks[donor] <= 1) break;
        weeks[donor] -= 1;
        weeks[empties[0]] += 1;
        empties = weeks
          .map((v, i) => (v === 0 ? i : -1))
          .filter((i) => i >= 0);
      }
    }

    return weeks;
  });

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      const data = await this.service.getRecognitions();
      this.items.set(data);
    } catch {
      this.error.set('Failed to load recognitions');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected retry(): void {
    void this.load();
  }

  protected toggleForm(): void {
    this.showForm.update((v) => !v);
  }

  protected onRecipientChange(value: string | number | null): void {
    if (typeof value === 'string') {
      const peer = PEERS.find((p) => p.id === value);
      this.form.update((f) => ({
        ...f,
        toEmployeeId: value,
        toName: peer?.name ?? '',
      }));
    }
  }

  protected onTypeChange(value: string | number | null): void {
    if (typeof value === 'string') {
      this.form.update((f) => ({ ...f, type: value as RecognitionType }));
    }
  }

  protected onValueChange(value: string | number | null): void {
    if (value === null || value === '' || value === undefined) {
      this.form.update((f) => ({ ...f, value: null }));
    } else if (typeof value === 'string') {
      this.form.update((f) => ({ ...f, value }));
    }
  }

  protected onVisibilityChange(value: string | number | null): void {
    if (typeof value === 'string') {
      this.form.update((f) => ({
        ...f,
        visibleTo: value as RecognitionVisibility,
      }));
    }
  }

  protected onMessageInput(value: string): void {
    this.form.update((f) => ({ ...f, message: value }));
  }

  protected async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const f = this.form();
    if (!f.message.trim()) {
      this.formError.set('Message is required');
      return;
    }
    this.formError.set(null);
    this.submitting.set(true);
    try {
      await this.service.createRecognition(f);
      this.form.set({ ...EMPTY_FORM });
      this.showForm.set(false);
      await this.load();
    } catch {
      this.formError.set('Failed to submit recognition');
    } finally {
      this.submitting.set(false);
    }
  }

  protected typeLabel(type: string): string {
    return TYPE_LABELS[type] ?? type;
  }
  protected visibilityLabel(v: string): string {
    return VISIBILITY_LABELS[v] ?? v;
  }
  protected formatDate(value: string): string {
    return new Date(value).toLocaleDateString();
  }
  protected barHeight(v: number): number {
    return Math.max(4, v * 12);
  }

  protected readonly retryFn: () => void = () => this.retry();
  protected readonly openFormFn: () => void = () => this.toggleForm();
}
