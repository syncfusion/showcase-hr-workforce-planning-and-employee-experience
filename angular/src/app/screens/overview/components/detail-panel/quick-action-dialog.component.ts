// QuickActionDialog — a single SfDialog re-used for every Quick Action
// emitted by the AI insight card (Schedule 1:1, Send Recognition, Assign
// Training, Request Pulse Check) plus a generic `message` fallback for
// AI-supplied actions that don't map to a known form.
//
// Why one component:
//   All five flows share the same shell — header, employee picker
//   (where applicable), form fields, and a footer with Cancel +
//   primary action. Splitting them into five files would be 5x the
//   boilerplate with no readability win. Mirrors the React
//   `QuickActionDialog` companion to keep the Angular port in
//   lock-step with the React client.
//
// Why an explicit `(submit)` callback instead of an internal toast:
//   The parent (DetailPanel) owns the sticky toast so clipboard,
//   mailto, and tel CTAs — which never open this dialog — share the
//   same surface as dialog confirmations. Lifting the toast up keeps
//   "user feedback after a CTA" in one place.

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogAllModule } from '@syncfusion/ej2-angular-popups';
import { ButtonAllModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListAllModule } from '@syncfusion/ej2-angular-dropdowns';
import {
  CadenceOption,
  CourseOption,
  HEADER_FOR_KIND,
  PEER_DIRECTORY,
  PULSE_CADENCES,
  QuickAction,
  QuickActionResult,
  RECOGNITION_TYPES,
  RECOGNITION_VALUES,
  RECOGNITION_VISIBILITIES,
  TRAINING_COURSES,
} from './quick-action.config';
import { PeerOption } from './quick-action.config';

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface CtaFormState {
  employeeId: string;
  meetingDate: string;
  meetingTime: string;
  agenda: string;
  recognitionType: string;
  recognitionValue: string;
  recognitionVisibility: string;
  recognitionMessage: string;
  trainingCourse: string;
  trainingDueDate: string;
  pulseCadence: string;
  pulseQuestions: string;
}

function buildEmptyForm(defaultEmployeeId: string): CtaFormState {
  return {
    employeeId: defaultEmployeeId,
    meetingDate: '',
    meetingTime: '',
    agenda: '',
    recognitionType: RECOGNITION_TYPES[0],
    recognitionValue: RECOGNITION_VALUES[0],
    recognitionVisibility: RECOGNITION_VISIBILITIES[0],
    recognitionMessage: '',
    trainingCourse: TRAINING_COURSES[0].value,
    trainingDueDate: '',
    pulseCadence: PULSE_CADENCES[0].value,
    pulseQuestions: '',
  };
}

@Component({
  selector: 'app-quick-action-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DialogAllModule, ButtonAllModule, DropDownListAllModule],
  template: `
    @if (activeCta) {
      <ejs-dialog
        isModal="true"
        [visible]="true"
        [header]="resolveHeader(activeCta)"
        showCloseIcon="true"
        closeOnEscape="true"
        width="460px"
        (overlayClick)="handleCancel()"
        (close)="handleCancel()"
        [cssClass]="cssClassFor(activeCta)"
        [animationSettings]="{ effect: 'Fade', duration: 200, delay: 0 }"
      >
        <ng-template #content>
          <div class="quick-action-form">
            @if (activeCta.kind === 'message') {
              <div class="quick-action-field">
                <label class="quick-action-field-label">Message</label>
                <div class="quick-action-message-preview">
                  {{ activeCta.body ?? activeCta.label }}
                </div>
              </div>
            } @else {
              <div class="quick-action-field">
                <label class="quick-action-field-label">Employee</label>
                <ejs-dropdownlist
                  [dataSource]="peerOptions"
                  [fields]="{ text: 'name', value: 'id' }"
                  [value]="form.employeeId"
                  placeholder="Select an employee"
                  cssClass="e-outline"
                  (change)="onEmployeeChange($event)"
                ></ejs-dropdownlist>
              </div>

              @switch (activeCta.kind) {
                @case ('schedule-1on1') {
                  <div class="quick-action-row">
                    <div class="quick-action-field">
                      <label class="quick-action-field-label">Date</label>
                      <input
                        type="date"
                        class="quick-action-input"
                        [value]="form.meetingDate"
                        (change)="onFormChange('meetingDate', $event)"
                      />
                    </div>
                    <div class="quick-action-field">
                      <label class="quick-action-field-label">Time</label>
                      <input
                        type="time"
                        class="quick-action-input"
                        [value]="form.meetingTime"
                        (change)="onFormChange('meetingTime', $event)"
                      />
                    </div>
                  </div>
                  <div class="quick-action-field">
                    <label class="quick-action-field-label">Agenda</label>
                    <textarea
                      class="quick-action-textarea"
                      rows="3"
                      placeholder="What would you like to cover?"
                      [value]="form.agenda"
                      (input)="onFormChange('agenda', $event)"
                    ></textarea>
                  </div>
                }
                @case ('recognition') {
                  <div class="quick-action-row">
                    <div class="quick-action-field">
                      <label class="quick-action-field-label">Type</label>
                      <ejs-dropdownlist
                        [dataSource]="recognitionTypes"
                        [value]="form.recognitionType"
                        placeholder="Recognition type"
                        cssClass="e-outline"
                        (change)="onFormChange('recognitionType', $event)"
                      ></ejs-dropdownlist>
                    </div>
                    <div class="quick-action-field">
                      <label class="quick-action-field-label">Company Value</label>
                      <ejs-dropdownlist
                        [dataSource]="recognitionValues"
                        [value]="form.recognitionValue"
                        placeholder="Pick a value"
                        cssClass="e-outline"
                        (change)="onFormChange('recognitionValue', $event)"
                      ></ejs-dropdownlist>
                    </div>
                  </div>
                  <div class="quick-action-field">
                    <label class="quick-action-field-label">Audience</label>
                    <ejs-dropdownlist
                      [dataSource]="recognitionVisibilities"
                      [value]="form.recognitionVisibility"
                      placeholder="Who can see this"
                      cssClass="e-outline"
                      (change)="onFormChange('recognitionVisibility', $event)"
                    ></ejs-dropdownlist>
                  </div>
                  <div class="quick-action-field">
                    <label class="quick-action-field-label">Message</label>
                    <textarea
                      class="quick-action-textarea"
                      rows="3"
                      placeholder="Why is this person worth recognizing?"
                      [value]="form.recognitionMessage"
                      (input)="onFormChange('recognitionMessage', $event)"
                    ></textarea>
                  </div>
                }
                @case ('training') {
                  <div class="quick-action-field">
                    <label class="quick-action-field-label">Course</label>
                    <ejs-dropdownlist
                      [dataSource]="trainingCourses"
                      [fields]="{ text: 'label', value: 'value' }"
                      [value]="form.trainingCourse"
                      placeholder="Pick a course"
                      cssClass="e-outline"
                      (change)="onFormChange('trainingCourse', $event)"
                    ></ejs-dropdownlist>
                  </div>
                  <div class="quick-action-field">
                    <label class="quick-action-field-label">Due Date</label>
                    <input
                      type="date"
                      class="quick-action-input"
                      [value]="form.trainingDueDate"
                      (change)="onFormChange('trainingDueDate', $event)"
                    />
                  </div>
                }
                @case ('pulse') {
                  <div class="quick-action-field">
                    <label class="quick-action-field-label">Cadence</label>
                    <ejs-dropdownlist
                      [dataSource]="pulseCadences"
                      [fields]="{ text: 'label', value: 'value' }"
                      [value]="form.pulseCadence"
                      placeholder="How often?"
                      cssClass="e-outline"
                      (change)="onFormChange('pulseCadence', $event)"
                    ></ejs-dropdownlist>
                  </div>
                  <div class="quick-action-field">
                    <label class="quick-action-field-label">Questions (optional)</label>
                    <textarea
                      class="quick-action-textarea"
                      rows="3"
                      placeholder="What would you like the employee to reflect on?"
                      [value]="form.pulseQuestions"
                      (input)="onFormChange('pulseQuestions', $event)"
                    ></textarea>
                  </div>
                }
              }
            }

            @if (error) {
              <div class="quick-action-error" role="alert">{{ error }}</div>
            }
          </div>
        </ng-template>
        <ng-template #footerTemplate>
          <div class="quick-action-footer">
            <button
              ejs-button
              cssClass="e-outline e-small"
              (click)="handleCancel()"
            >Cancel</button>
            <button
              ejs-button
              cssClass="e-primary e-small"
              (click)="handleSubmit()"
            >{{ primaryLabel }}</button>
          </div>
        </ng-template>
      </ejs-dialog>
    }
  `,
  styles: [`
    :host { display: contents; }

    .quick-action-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px;
    }

    .quick-action-row {
      display: flex;
      gap: 12px;
    }
    .quick-action-row > .quick-action-field { flex: 1; min-width: 0; }

    .quick-action-field { display: flex; flex-direction: column; }

    .quick-action-field-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-sf-fg-tertiary);
      display: block;
      margin-bottom: 6px;
    }

    .quick-action-input,
    .quick-action-textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--color-sf-border-primary);
      border-radius: var(--input-md-radius, 6px);
      font-size: 13px;
      box-sizing: border-box;
      background: var(--color-sf-bg-primary);
      color: var(--color-sf-fg-primary);
      font-family: inherit;
    }

    .quick-action-textarea { resize: vertical; }

    .quick-action-message-preview {
      font-size: 13px;
      line-height: 1.5;
      color: var(--color-sf-fg-primary);
      padding: 10px 12px;
      background: var(--color-sf-bg-secondary);
      border: 1px solid var(--color-sf-border-secondary);
      border-radius: 6px;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .quick-action-error {
      font-size: 12px;
      color: var(--color-sf-fg-error-primary);
    }

    .quick-action-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 12px;
      border-top: 1px solid var(--color-sf-border-tertiary);
    }
  `],
})
export class QuickActionDialogComponent implements OnChanges {
  /** The CTA the dialog is currently showing. `null` hides the dialog. */
  @Input() activeCta: QuickAction | null = null;

  /** Preferred employee for the dialog's recipient picker. */
  @Input() defaultEmployeeId?: string;

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<QuickActionResult>();

  protected readonly peerOptions: PeerOption[] = [...PEER_DIRECTORY];
  protected readonly recognitionTypes: ReadonlyArray<string> = RECOGNITION_TYPES;
  protected readonly recognitionValues: ReadonlyArray<string> = RECOGNITION_VALUES;
  protected readonly recognitionVisibilities: ReadonlyArray<string> = RECOGNITION_VISIBILITIES;
  protected readonly trainingCourses: ReadonlyArray<CourseOption> = TRAINING_COURSES;
  protected readonly pulseCadences: ReadonlyArray<CadenceOption> = PULSE_CADENCES;

  // The form is re-keyed by `activeCta?.id` in `ngOnChanges` so a new
  // mount happens on every open and we get a clean form without an
  // explicit reset effect (mirrors the React `key={activeCta.id}` pattern).
  protected form: CtaFormState = buildEmptyForm(PEER_DIRECTORY[0].id);
  protected error: string | null = null;

  private readonly cdr = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges): void {
    if ('activeCta' in changes) {
      const resolved = this.resolveDefaultEmployeeId();
      this.form = buildEmptyForm(resolved);
      this.error = null;
    }
  }

  protected get primaryLabel(): string {
    return this.activeCta?.kind === 'message' ? 'Copy & Close' : 'Send';
  }

  protected resolveHeader(cta: QuickAction): string {
    return HEADER_FOR_KIND[cta.kind] ?? cta.title ?? cta.label ?? 'Quick Action';
  }

  protected cssClassFor(cta: QuickAction): string {
    return `quick-action-dialog quick-action-dialog--${cta.kind}`;
  }

  protected onEmployeeChange(event: { value: string | null }): void {
    this.form = { ...this.form, employeeId: event.value ?? PEER_DIRECTORY[0].id };
  }

  /**
   * Single updater used by every form field. Accepts either a native
   * DOM event (input / change on `<input>` and `<textarea>`) or a
   * Syncfusion-style `{ value: string | null }` payload from
   * `ejs-dropdownlist`. The two paths converge on a string value,
   * so the same helper can be wired to every call site.
   */
  protected onFormChange<K extends keyof CtaFormState>(
    key: K,
    event: Event | { value: string | null },
  ): void {
    if (isDropdownChange(event)) {
      this.form = { ...this.form, [key]: event.value ?? '' };
      return;
    }
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.form = { ...this.form, [key]: target?.value ?? '' };
  }

  protected handleCancel(): void {
    this.close.emit();
  }

  protected handleSubmit(): void {
    if (!this.activeCta) return;

    const peer = PEER_DIRECTORY.find((p) => p.id === this.form.employeeId);
    const peerName = peer?.name ?? 'the selected employee';
    let toast: string;
    let ok = true;

    switch (this.activeCta.kind) {
      case 'schedule-1on1':
        if (!this.form.meetingDate || !this.form.meetingTime) {
          ok = false;
          toast = 'Please pick a date and time for the 1:1.';
          break;
        }
        toast = `1:1 invitation drafted for ${peerName} on ${this.form.meetingDate} at ${this.form.meetingTime}.`;
        break;

      case 'recognition':
        if (!this.form.recognitionMessage.trim()) {
          ok = false;
          toast = 'Please add a short recognition message.';
          break;
        }
        toast = `Recognition sent to ${peerName} (${this.form.recognitionValue}).`;
        break;

      case 'training':
        if (!this.form.trainingDueDate) {
          ok = false;
          toast = 'Please pick a due date for the training.';
          break;
        }
        toast = `${this.form.trainingCourse} assigned to ${peerName} (due ${this.form.trainingDueDate}).`;
        break;

      case 'pulse':
        toast = `Pulse ${this.form.pulseCadence} survey queued for ${peerName}.`;
        break;

      case 'message':
      default:
        toast = 'Message copied to clipboard.';
        break;
    }

    if (!ok) {
      this.error = toast;
      this.cdr.markForCheck();
      return;
    }

    const clipboardText =
      this.activeCta.kind === 'message'
        ? this.activeCta.body ?? this.activeCta.label
        : undefined;

    this.submit.emit({
      kind: this.activeCta.kind,
      message: toast,
      clipboardText,
    });
    this.close.emit();
  }

  private resolveDefaultEmployeeId(): string {
    const id = this.defaultEmployeeId;
    if (id && PEER_DIRECTORY.some((p) => p.id === id)) {
      return id;
    }
    return PEER_DIRECTORY[0].id;
  }
}

/**
 * Type guard for the `change` event payload from Syncfusion's
 * `ejs-dropdownlist`. The EJ2 wrappers emit a `{ value: ... }`
 * object, while native input / textarea `change` events emit
 * `Event` instances with a `target.value`. Distinguishing the two
 * at the type level lets `onFormChange` branch safely.
 */
function isDropdownChange(
  event: Event | { value: string | null },
): event is { value: string | null } {
  return (
    typeof event === 'object' &&
    event !== null &&
    !('target' in event) &&
    'value' in event
  );
}
