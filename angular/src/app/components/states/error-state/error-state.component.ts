// ErrorState — mirrors src/components/states/ErrorState.tsx
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-state">
      <div class="error-state__icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 class="error-state__title">Something went wrong</h3>
      <p class="error-state__message">{{ message() }}</p>
      @if (showRetry()) {
        <button type="button" class="error-state__button" (click)="retry.emit()">
          Try Again
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .error-state {
        text-align: center;
        padding: 48px 24px;
      }
      .error-state__icon {
        margin-bottom: 16px;
        color: #DC3545;
      }
      .error-state__title {
        margin: 0 0 8px;
        color: #DC3545;
      }
      .error-state__message {
        margin: 0 0 24px;
        color: #6C757D;
      }
      .error-state__button {
        padding: 10px 20px;
        background: #3B8CDE;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .error-state__button:hover {
        background: #2c7ac7;
      }
    `,
  ],
})
export class ErrorStateComponent {
  readonly message = input.required<string>();
  readonly onRetry = input<(() => void) | undefined>(undefined);

  protected readonly showRetry = computed<boolean>(() => this.onRetry() !== undefined);

  readonly retry = output<void>();
}
