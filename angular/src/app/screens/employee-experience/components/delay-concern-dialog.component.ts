// DelayConcernDialog — mirrors src/screens/EmployeeExperience/components/DelayConcernDialog.tsx
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
  signal,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import {
  TextBoxModule,
  TextAreaModule,
  NumericTextBoxModule,
} from '@syncfusion/ej2-angular-inputs';

import { EmployeeExperienceService } from '../../../services/employee-experience.service';
import {
  DELAY_RELATED_TYPES,
  SEVERITY_OPTIONS,
} from '../employee-experience.config';
import type { DelayRelatedEntityType } from '../../../models/employee-experience.model';

type Severity = 'low' | 'medium' | 'high';

interface FormState {
  relatedEntityType: DelayRelatedEntityType;
  relatedEntityId: string;
  subject: string;
  details: string;
  daysWaiting: number;
  expectedSlackDays: string;
  severity: Severity;
}

const EMPTY_FORM: FormState = {
  relatedEntityType: 'self-service',
  relatedEntityId: '',
  subject: '',
  details: '',
  daysWaiting: 1,
  expectedSlackDays: '',
  severity: 'medium',
};

@Component({
  selector: 'app-delay-concern-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DialogModule,
    DropDownListModule,
    TextBoxModule,
    TextAreaModule,
    NumericTextBoxModule,
  ],
  templateUrl: './delay-concern-dialog.component.html',
  styleUrl: './delay-concern-dialog.component.css',
})
export class DelayConcernDialogComponent implements OnChanges {
  private readonly service = inject(EmployeeExperienceService);

  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  protected readonly relatedTypeOptions = DELAY_RELATED_TYPES.map((t) => ({
    value: t.value,
    label: t.label,
  }));
  protected readonly severityOptions = SEVERITY_OPTIONS.map((s) => ({
    value: s,
    label: s.charAt(0).toUpperCase() + s.slice(1),
  }));

  protected readonly visible = signal(false);
  protected readonly form = signal<FormState>({ ...EMPTY_FORM });
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly success = signal(false);

  // Dialog footer button model: matches the Syncfusion Dialog `buttons`
  // input shape (ButtonPropsModel from ej2-popups). We type as a structural
  // shape to avoid pulling in a private export path.
  protected readonly footerButtons = computed<unknown[]>(() => {
    if (this.success()) return [];
    const disabled = this.submitting();
    return [
      {
        buttonModel: {
          content: 'Cancel',
          cssClass: 'e-flat',
          disabled,
        },
        click: () => this.close(),
      },
      {
        buttonModel: {
          content: this.submitting() ? 'Submitting…' : 'Raise Concern',
          cssClass: 'e-flat e-primary',
          isPrimary: true,
          disabled,
        },
        click: () => {
          void this.submit();
        },
      },
    ];
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.reset();
        queueMicrotask(() => this.visible.set(true));
      } else {
        this.visible.set(false);
      }
    }
  }

  protected reset(): void {
    this.form.set({ ...EMPTY_FORM });
    this.error.set(null);
    this.success.set(false);
    this.submitting.set(false);
  }

  protected close(): void {
    if (this.submitting()) return;
    this.reset();
    this.visible.set(false);
    this.isOpenChange.emit(false);
    this.closed.emit();
  }

  protected onRelatedTypeChange(value: string | number | null): void {
    if (typeof value === 'string') {
      this.form.update((f) => ({
        ...f,
        relatedEntityType: value as DelayRelatedEntityType,
      }));
    }
  }

  protected onSeverityChange(value: string | number | null): void {
    if (typeof value === 'string') {
      this.form.update((f) => ({ ...f, severity: value as Severity }));
    }
  }

  protected onEntityIdInput(value: string): void {
    this.form.update((f) => ({ ...f, relatedEntityId: value ?? '' }));
  }

  protected onSubjectInput(value: string): void {
    this.form.update((f) => ({ ...f, subject: value ?? '' }));
  }

  protected onDetailsInput(value: string): void {
    this.form.update((f) => ({ ...f, details: value ?? '' }));
  }

  protected onDaysWaitingChange(value: number | null | undefined): void {
    if (typeof value === 'number') {
      this.form.update((f) => ({ ...f, daysWaiting: value }));
    }
  }

  protected onExpectedSlackChange(value: number | null | undefined): void {
    if (value === null || value === undefined) {
      this.form.update((f) => ({ ...f, expectedSlackDays: '' }));
    } else {
      this.form.update((f) => ({ ...f, expectedSlackDays: String(value) }));
    }
  }

  protected get expectedSlackNumeric(): number | undefined {
    const raw = this.form().expectedSlackDays;
    if (raw === '' || raw === undefined) return undefined;
    const n = Number(raw);
    return Number.isNaN(n) ? undefined : n;
  }

  protected async submit(): Promise<void> {
    const f = this.form();
    if (!f.subject.trim() || !f.details.trim()) {
      this.error.set('Subject and details are required');
      return;
    }
    if (f.daysWaiting < 0) {
      this.error.set('Days waiting must be a non-negative number');
      return;
    }
    this.error.set(null);
    this.submitting.set(true);
    try {
      await this.service.createDelayConcern({
        ...f,
        relatedEntityId: f.relatedEntityId || null,
        expectedSlackDays: f.expectedSlackDays
          ? Number(f.expectedSlackDays)
          : null,
      });
      this.success.set(true);
      setTimeout(() => this.close(), 1200);
    } catch {
      this.error.set('Failed to submit delay concern');
    } finally {
      this.submitting.set(false);
    }
  }
}
