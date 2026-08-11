// EmptyState — mirrors src/components/states/EmptyState.tsx
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <div class="empty-state__icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      </div>
      <h3 class="empty-state__title">{{ title() }}</h3>
      @if (description()) {
        <p class="empty-state__message">{{ description() }}</p>
      }
      @if (actionLabel() && hasAction()) {
        <button type="button" class="empty-state__button" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .empty-state {
        text-align: center;
        padding: 48px 24px;
      }
      .empty-state__icon {
        margin-bottom: 16px;
        color: #6C757D;
      }
      .empty-state__title {
        margin: 0 0 8px;
        color: #212529;
      }
      .empty-state__message {
        margin: 0 0 24px;
        color: #6C757D;
      }
      .empty-state__button {
        background: #3B8CDE;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .empty-state__button:hover {
        background: #2c7ac7;
      }
    `,
  ],
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string | undefined>(undefined);
  readonly actionLabel = input<string | undefined>(undefined);

  readonly onAction = input<(() => void) | undefined>(undefined);

  protected hasAction(): boolean {
    return this.onAction() !== undefined;
  }

  readonly action = output<void>();
}
