// PageHeader — mirrors the PageHeader subcomponent in src/components/Layout.tsx
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h1 class="page-title">{{ title() }}</h1>
      @if (subtitle()) {
        <p class="page-subtitle">{{ subtitle() }}</p>
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .page-header { margin-bottom: 16px; }
      .page-title {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--color-sf-fg-primary);
      }
      .page-subtitle {
        margin: 4px 0 0;
        color: var(--color-sf-fg-tertiary);
        font-size: 14px;
      }
    `,
  ],
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | undefined>(undefined);
}
