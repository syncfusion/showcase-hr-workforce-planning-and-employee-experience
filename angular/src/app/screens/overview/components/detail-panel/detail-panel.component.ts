// DetailPanel — mirrors src/screens/Overview/components/DetailPanel.tsx
//
// Right-side detail rail that combines:
//   - an AI Insight card with three states (empty / loading / insight
//     with notes + drop + Create Action Plan CTA) plus an inline error
//     fallback and a dismiss (X) button on the card header once an
//     insight is on screen.
//   - a Quick Actions list (always rendered; AI-supplied actions
//     replace the defaults when an insight is on screen). `clipboard`
//     CTAs fire immediately; every other kind opens the shared
//     `QuickActionDialog`.
//   - a pure-CSS/Angular Activity Timeline (a plain `<ol>` with dot +
//     connector, same shape as the React/Blazor ports).
//   - a "Create Action Plan" modal that closes the insight with the
//     (currently no-op) Save handler.
//   - an inline toast for clipboard / mailto / tel confirmations
//     that bypass the dialog. Dialog submissions bubble up via
//     `(showToast)` so the parent screen's `<ejs-toast>` is the single
//     feedback surface for both paths.
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  computed,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineAllModule } from '@syncfusion/ej2-angular-layouts';
import { ButtonAllModule } from '@syncfusion/ej2-angular-buttons';
import { DialogAllModule } from '@syncfusion/ej2-angular-popups';
import { QuickActionDialogComponent } from './quick-action-dialog.component';
import {
  QuickAction,
  QuickActionResult,
  resolveActions,
  resolveDefaultEmployeeId,
} from './quick-action.config';
import type { ActivityTimelineEvent, AiInsight } from '../../../../models/overview.model';

@Component({
  selector: 'app-detail-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TimelineAllModule, ButtonAllModule, DialogAllModule, QuickActionDialogComponent],
  template: `
    <div class="detail-panel">
      <!-- Header -->
      <div class="detail-panel__header">
        <span class="detail-panel__title">Activity Insights</span>
      </div>

      <!-- AI Insight -->
      <div class="detail-panel__ai-card e-card">
        <div class="detail-panel__ai-row">
          <span aria-hidden="true" class="detail-panel__ai-bolt">⚡</span>
          <span class="detail-panel__ai-label">AI Insight</span>

          <!-- Close (X) button — only rendered once an insight is on
               screen, so the empty/error/loading states stay clean.
               Calls the parent's (dismissInsight) output to clear
               the insight and fall back to "Generate AI Insight". -->
          @if (hasInsight() && dismissInsight.observed) {
            <button
              type="button"
              class="detail-panel__ai-dismiss"
              aria-label="Dismiss AI insight"
              title="Dismiss AI insight"
              (click)="onDismissClick()"
            >
              <span aria-hidden="true">×</span>
            </button>
          }
        </div>

        <!-- Note: the conditional chain prefers hasInsight() first so
             the fallback insight (seeded) shows up after a 503, with
             the non-blocking error toast surfacing the failure. The
             React client does the same: setAiInsight(fallback) on
             catch, then a separate toast surfaces the failure. -->
        @if (hasInsight() && aiInsight(); as insight) {
          <div class="detail-panel__ai-quote">{{ insight.notes }}</div>
          @if (insight.engagementDrop > 0) {
            <div class="detail-panel__ai-drop">
              Engagement dropped {{ insight.engagementDrop }}% in {{ insight.quarter }}
            </div>
          }
        } @else if (generatingInsight()) {
          <div class="detail-panel__ai-status">
            Analyzing activity, pulse, and career data with AI…
          </div>
        } @else if (insightError()) {
          <div class="detail-panel__ai-error" role="alert">{{ insightError() }}</div>
        }

        @if (!hasInsight() && !generatingInsight() && generateInsight.observed) {
          <button
            ejs-button
            cssClass="e-primary e-small detail-panel__ai-cta"
            (click)="onGenerateClick()"
          >Generate AI Insight</button>
        } @else if (hasInsight()) {
          <button
            ejs-button
            cssClass="e-primary e-small detail-panel__ai-cta"
            (click)="openActionPlanModal()"
          >Create Action Plan</button>
        }
      </div>

      <!-- Quick Actions — always rendered, even without an AI insight,
           so the sidebar is interactive from first paint. AI-supplied
           actions replace the defaults. -->
      <div class="detail-panel__section">
        <span class="detail-panel__section-title">Quick Actions</span>
        <div class="detail-panel__quick-actions">
          @for (action of quickActions(); track action.id) {
            <button
              ejs-button
              cssClass="e-outline e-small"
              (click)="onQuickActionClick(action)"
            >{{ action.label }}</button>
          }
        </div>
      </div>

      <!-- Activity Timeline -->
      <div class="detail-panel__section">
        <span class="detail-panel__section-title">Activity Timeline</span>
        <div class="detail-panel__timeline">
          <ol class="detail-timeline">
            @for (event of timeline(); track event.id; let i = $index, isLast = $last) {
              <li class="detail-timeline__item">
                <span class="detail-timeline__dot" aria-hidden="true"></span>
                @if (!isLast) {
                  <span class="detail-timeline__line" aria-hidden="true"></span>
                }
                <div class="detail-timeline__content">
                  <div class="detail-timeline__title">{{ event.title }}</div>
                  @if (event.detail) {
                    <div class="detail-timeline__detail">{{ event.detail }}</div>
                  }
                  <div class="detail-timeline__time">{{ event.timestamp }}</div>
                </div>
              </li>
            }
          </ol>
        </div>
      </div>

      <!-- Create Action Plan Modal -->
      <ejs-dialog
        isModal="true"
        [visible]="showActionPlanModal()"
        header="Create Action Plan"
        showCloseIcon="true"
        closeOnEscape="true"
        width="450px"
        (overlayClick)="closeActionPlanModal()"
        (close)="closeActionPlanModal()"
        [animationSettings]="{ effect: 'Fade', duration: 200, delay: 0 }"
        [buttons]="actionPlanDialogButtons"
      >
        <div class="detail-panel__modal">
          <div class="detail-panel__field">
            <label class="detail-panel__label">Plan Name</label>
            <input
              type="text"
              placeholder="e.g., Engagement Recovery - Q3"
              class="detail-panel__input"
            />
          </div>
          <div class="detail-panel__field">
            <label class="detail-panel__label">Focus Areas</label>
            <div class="detail-panel__chips">
              @for (action of (aiInsight()?.actions ?? []); track action.id) {
                <label class="detail-panel__chip">
                  <input type="checkbox" checked />
                  <span>{{ action.label }}</span>
                </label>
              }
            </div>
          </div>
          <div class="detail-panel__field">
            <label class="detail-panel__label">Priority</label>
            <select class="detail-panel__select">
              <option>High - Immediate attention needed</option>
              <option>Medium - Address within 2 weeks</option>
              <option>Low - Schedule for next month</option>
            </select>
          </div>
          <div class="detail-panel__field">
            <label class="detail-panel__label">Notes</label>
            <textarea
              placeholder="Add context or goals for this action plan..."
              rows="3"
              class="detail-panel__textarea"
            ></textarea>
          </div>
        </div>
      </ejs-dialog>

      <!-- Single QuickActionDialog re-used for every CTA. Renders
           nothing while _activeCta is null so it doesn't keep state
           across opens. The parent owns the toast surface. -->
      <app-quick-action-dialog
        [activeCta]="_activeCta()"
        [defaultEmployeeId]="defaultEmployeeId()"
        (close)="onQuickActionDialogClose()"
        (submit)="onQuickActionDialogSubmit($event)"
      ></app-quick-action-dialog>

      <!-- Lightweight inline toast for clipboard / mailto / tel
           confirmations that bypass the dialog. Auto-dismisses after
           2.5s. Dialog submissions surface through the parent
           Overview's ejs-toast via (showToast). -->
      @if (_inlineToast(); as message) {
        <div
          class="detail-panel__toast"
          role="status"
          aria-live="polite"
          (click)="dismissInlineToast()"
        >{{ message }}</div>
      }
    </div>
  `,
  styleUrl: './detail-panel.component.css',
})
export class DetailPanelComponent implements OnInit, OnDestroy {
  // Why signal inputs (`input()`) instead of the legacy `@Input()`
  // decorator: every read of `aiInsight`, `generatingInsight`, and
  // `insightError` is funneled through the `hasInsight` / `quickActions`
  // / `defaultEmployeeId` `computed` signals. Computed signals only
  // re-evaluate when a *signal* they read changes — a plain
  // `@Input()` field is not a signal, so the previous implementation
  // never refreshed after the parent pushed a new `aiInsight` value
  // (the React equivalent worked because React re-renders the whole
  // component on prop change, but Angular's `OnPush` + computed combo
  // needs a real signal source). Switching to `input()` makes the
  // inputs reactive and fixes the "click Generate AI Insight and
  // nothing happens" symptom.
  readonly timeline = input.required<ActivityTimelineEvent[]>();
  readonly aiInsight = input<AiInsight | null>(null);
  readonly generatingInsight = input<boolean>(false);
  readonly insightError = input<string | null>(null);

  // Imperative handle for the parent's `generateAiInsight` call —
  // mirrors the React `onGenerateInsight` prop. The parent owns
  // loading + error state and the cached-insight fallback.
  @Output() readonly generateInsight = new EventEmitter<void>();

  // Fired when the user dismisses the generated AI insight card via
  // the close (X) button in the card header. Lets the parent clear
  // the `aiInsight` input so the card collapses back to "Generate
  // AI Insight".
  @Output() readonly dismissInsight = new EventEmitter<void>();

  // Imperative toast trigger so `QuickActionDialog` can show a
  // Syncfusion `<ToastComponent>` confirmation when the user sends
  // a CTA. The toast is owned by the `Overview` screen so it sits
  // at the screen level (not inside the sidebar) and survives the
  // dialog closing.
  @Output() readonly showToast = new EventEmitter<{ title: string; content: string }>();

  protected readonly showActionPlanModal = signal(false);
  protected readonly _activeCta = signal<QuickAction | null>(null);
  protected readonly _inlineToast = signal<string | null>(null);

  // `hasInsight` is true exactly when an insight is on screen AND
  // we're not currently regenerating — matches the React
  // `Boolean(aiInsight && !generatingInsight)` definition. The
  // loading + error states are independent branches in the template
  // but `hasInsight` is the single source of truth for "show the
  // dismiss button and the Create Action Plan CTA".
  //
  // `quickActions` and `defaultEmployeeId` recompute when `aiInsight`
  // changes so AI-supplied actions replace the defaults and the
  // dialog's recipient picker pre-selects the right employee.
  protected readonly hasInsight = computed(
    () => !!this.aiInsight() && !this.generatingInsight(),
  );

  protected readonly quickActions = computed(() => resolveActions(this.aiInsight()?.actions));

  protected readonly defaultEmployeeId = computed(() =>
    resolveDefaultEmployeeId(this.aiInsight()),
  );

  protected readonly actionPlanDialogButtons = [
    { click: () => this.closeActionPlanModal(), buttonModel: { content: 'Cancel' } },
    { click: () => this.closeActionPlanModal(), buttonModel: { content: 'Save Action', isPrimary: true } },
  ];

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    // No defensive guard needed for `timeline` — `input.required()`
    // throws a compile-time error if the parent doesn't bind it, and
    // the runtime value is guaranteed to be an array.
  }

  ngOnDestroy(): void {
    if (this.toastTimer !== null) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }

  // -------------------------------------------------------------------------
  // AI Insight card actions
  // -------------------------------------------------------------------------

  protected onGenerateClick(): void {
    this.generateInsight.emit();
  }

  protected onDismissClick(): void {
    // Close any open CTA dialog and dismiss the insight so the card
    // collapses back to the "Generate AI Insight" CTA.
    this._activeCta.set(null);
    this.dismissInsight.emit();
  }

  protected openActionPlanModal(): void {
    this.showActionPlanModal.set(true);
  }

  protected closeActionPlanModal(): void {
    this.showActionPlanModal.set(false);
  }

  // -------------------------------------------------------------------------
  // Quick Actions
  // -------------------------------------------------------------------------

  protected onQuickActionClick(action: QuickAction): void {
    if (action.kind === 'clipboard') {
      const text = action.value ?? action.label;
      void this.copyToClipboardAsync(text);
      return;
    }
    this._activeCta.set(action);
  }

  protected onQuickActionDialogClose(): void {
    this._activeCta.set(null);
  }

  protected onQuickActionDialogSubmit(result: QuickActionResult): void {
    if (result.kind === 'message' && result.clipboardText) {
      // For `message` CTAs we additionally write the body to the
      // clipboard; on failure we fall back to a visible-text toast
      // so the user never loses the message. The success path is
      // silent because the dialog already shows the "Copied" toast.
      void this.copyToClipboardAsync(result.clipboardText, { silent: true });
    }
    // Surface every dialog submission to the parent's `<ejs-toast>`.
    this.showToast.emit({
      title: 'Success',
      content: result.message,
    });
  }

  // -------------------------------------------------------------------------
  // Inline toast
  // -------------------------------------------------------------------------

  protected dismissInlineToast(): void {
    this._inlineToast.set(null);
    if (this.toastTimer !== null) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }

  private scheduleInlineToastClear(): void {
    // Auto-dismiss after 2.5s. Clear the previous timer (if any) so
    // successive toasts reset the countdown instead of stacking.
    if (this.toastTimer !== null) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this._inlineToast.set(null);
      this.toastTimer = null;
    }, 2500);
  }

  /**
   * Best-effort clipboard write. Returns `true` on success, `false`
   * when the API is unavailable / the write was rejected. On the
   * non-silent path a visible-text toast is shown on success too so
   * the user always gets feedback (matches the React
   * `navigator.clipboard.writeText(...).then(setToast, setToast)`
   * chain). On the silent path only the failure case is surfaced —
   * used by `message` CTAs where the dialog already confirmed the
   * copy.
   */
  private async copyToClipboardAsync(
    text: string,
    options: { silent?: boolean } = {},
  ): Promise<boolean> {
    const { silent = false } = options;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        if (!silent) {
          this._inlineToast.set(`Copied "${text}" to clipboard.`);
          this.scheduleInlineToastClear();
        }
        return true;
      } catch {
        // fall through to the visible-text fallback below
      }
    }

    this._inlineToast.set(
      silent
        ? `Clipboard not available. Message: ${text}`
        : `Clipboard not available. Value: ${text}`,
    );
    this.scheduleInlineToastClear();
    return false;
  }
}
