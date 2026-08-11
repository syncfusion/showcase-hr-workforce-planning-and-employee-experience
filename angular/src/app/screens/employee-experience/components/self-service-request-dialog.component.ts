// SelfServiceRequestDialog — mirrors
// src/screens/EmployeeExperience/components/SelfServiceRequestDialog.tsx
//
// Modal Syncfusion Dialog that captures a new self-service request
// (type, priority, subject, details). Follows the same shape as the
// sibling ReportIssueDialogComponent / DelayConcernDialogComponent.
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { FormsModule } from '@angular/forms';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import {
  TextBoxModule,
  TextAreaModule,
} from '@syncfusion/ej2-angular-inputs';

import { EmployeeExperienceService } from '../../../services/employee-experience.service';
import {
  SELF_SERVICE_TYPES,
  PRIORITY_OPTIONS,
  PRIORITY_LABELS,
} from '../employee-experience.config';
import type { SelfServiceType } from '../../../models/employee-experience.model';

type Priority = 'low' | 'medium' | 'high';

interface FormState {
  type: SelfServiceType;
  subject: string;
  details: string;
  priority: Priority;
}

const EMPTY_FORM: FormState = {
  type: 'address-change',
  subject: '',
  details: '',
  priority: 'medium',
};

@Component({
  selector: 'app-self-service-request-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DialogModule,
    DropDownListModule,
    TextBoxModule,
    TextAreaModule,
    FormsModule,
  ],
  templateUrl: './self-service-request-dialog.component.html',
  styleUrl: './self-service-request-dialog.component.css',
})
export class SelfServiceRequestDialogComponent implements OnChanges {
  private readonly service = inject(EmployeeExperienceService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  protected readonly typeOptions = SELF_SERVICE_TYPES.map((t) => ({
    value: t.value,
    label: t.label,
  }));
  // Self-service requests are user-facing; "critical" is reserved for ops
  // escalations, so we expose the same subset the React dialog does.
  protected readonly priorityOptions = PRIORITY_OPTIONS.filter(
    (p): p is Priority => p !== 'critical',
  ).map((p) => ({ value: p, label: PRIORITY_LABELS[p] ?? p }));

  protected readonly visible = signal(false);
  // Plain object (not a signal) so `[(ngModel)]` can two-way bind the text
  // inputs. The Syncfusion <ejs-textbox> / <ejs-textarea> wrappers race with
  // one-way `[value]` + `(input)` because `setProperties({ value })` clobbers
  // the DOM input on every change-detection pass. Two-way binding lets the
  // wrapper own the DOM and avoids that write-back entirely.
  protected form: FormState = { ...EMPTY_FORM };
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly success = signal(false);

  // Dialog footer button model: matches the Syncfusion Dialog `buttons`
  // input shape (ButtonPropsModel from ej2-popups). Typed as a structural
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
          content: this.submitting() ? 'Submitting…' : 'Submit Request',
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
    this.form = { ...EMPTY_FORM };
    this.error.set(null);
    this.success.set(false);
    this.submitting.set(false);
    this.cdr.markForCheck();
  }

  protected close(): void {
    if (this.submitting()) return;
    this.reset();
    this.visible.set(false);
    this.isOpenChange.emit(false);
    this.closed.emit();
  }

  protected onTypeChange(value: string | number | null): void {
    if (typeof value === 'string') {
      this.form = { ...this.form, type: value as SelfServiceType };
      this.cdr.markForCheck();
    }
  }

  protected onPriorityChange(value: string | number | null): void {
    if (typeof value === 'string') {
      this.form = { ...this.form, priority: value as Priority };
      this.cdr.markForCheck();
    }
  }

  protected onSubjectInput(value: string): void {
    this.form = { ...this.form, subject: value ?? '' };
    this.cdr.markForCheck();
  }

  protected onDetailsInput(value: string): void {
    this.form = { ...this.form, details: value ?? '' };
    this.cdr.markForCheck();
  }

  protected async submit(): Promise<void> {
    const f = this.form;
    if (!f.subject.trim() || !f.details.trim()) {
      this.error.set('Subject and details are required');
      return;
    }
    this.error.set(null);
    this.submitting.set(true);
    try {
      await this.service.createSelfServiceRequest(f);
      this.success.set(true);
      this.submitted.emit();
      setTimeout(() => this.close(), 1200);
    } catch {
      this.error.set('Failed to submit request');
    } finally {
      this.submitting.set(false);
    }
  }
}
