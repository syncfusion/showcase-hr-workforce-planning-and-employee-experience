// ReportIssueDialog — mirrors src/screens/EmployeeExperience/components/ReportIssueDialog.tsx
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
} from '@syncfusion/ej2-angular-inputs';

import { EmployeeExperienceService } from '../../../services/employee-experience.service';
import {
  ISSUE_CATEGORIES,
  PRIORITY_OPTIONS,
  PRIORITY_LABELS,
} from '../employee-experience.config';
import type { IssueCategory } from '../../../models/employee-experience.model';

type Priority = 'low' | 'medium' | 'high' | 'critical';

interface FormState {
  category: IssueCategory;
  subject: string;
  description: string;
  url: string;
  browser: string;
  priority: Priority;
}

const EMPTY_FORM: FormState = {
  category: 'system-rendering',
  subject: '',
  description: '',
  url: '',
  browser: '',
  priority: 'medium',
};

@Component({
  selector: 'app-report-issue-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DialogModule,
    DropDownListModule,
    TextBoxModule,
    TextAreaModule,
  ],
  templateUrl: './report-issue-dialog.component.html',
  styleUrl: './report-issue-dialog.component.css',
})
export class ReportIssueDialogComponent implements OnChanges {
  private readonly service = inject(EmployeeExperienceService);

  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  protected readonly categoryOptions = ISSUE_CATEGORIES.map((c) => ({
    value: c.value,
    label: c.label,
  }));
  protected readonly priorityOptions = PRIORITY_OPTIONS.map((p) => ({
    value: p,
    label: PRIORITY_LABELS[p],
  }));

  protected readonly visible = signal(false);
  protected readonly form = signal<FormState>({ ...EMPTY_FORM });
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly success = signal(false);

  // Dialog footer button model: matches the Syncfusion Dialog `buttons`
  // input shape. Typed as a structural shape to avoid pulling in a private
  // export path from the popups package.
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
          content: this.submitting() ? 'Submitting…' : 'Submit Issue',
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
        // Wait a microtask so the dialog input picks up `visible = true`.
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

  protected onCategoryChange(value: string | number | null): void {
    if (typeof value === 'string') {
      this.form.update((f) => ({ ...f, category: value as IssueCategory }));
    }
  }

  protected onPriorityChange(value: string | number | null): void {
    if (typeof value === 'string') {
      this.form.update((f) => ({ ...f, priority: value as Priority }));
    }
  }

  protected onSubjectInput(value: string): void {
    this.form.update((f) => ({ ...f, subject: value ?? '' }));
  }

  protected onDescriptionInput(value: string): void {
    this.form.update((f) => ({ ...f, description: value ?? '' }));
  }

  protected onUrlInput(value: string): void {
    this.form.update((f) => ({ ...f, url: value ?? '' }));
  }

  protected onBrowserInput(value: string): void {
    this.form.update((f) => ({ ...f, browser: value ?? '' }));
  }

  protected async submit(): Promise<void> {
    const f = this.form();
    if (!f.subject.trim() || !f.description.trim()) {
      this.error.set('Subject and description are required');
      return;
    }
    this.error.set(null);
    this.submitting.set(true);
    try {
      await this.service.createIssueReport(f);
      this.success.set(true);
      setTimeout(() => this.close(), 1200);
    } catch {
      this.error.set('Failed to submit issue report');
    } finally {
      this.submitting.set(false);
    }
  }
}
