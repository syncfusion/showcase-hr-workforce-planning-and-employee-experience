// LoadingState — mirrors src/components/states/LoadingState.tsx
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="loading-state"
      [style.height]="height()"
      [style.width]="width()"
    >
      <div class="e-spinner e-spinner-medium">
        <div class="e-spinner-circle e-spinner-marker"></div>
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class LoadingStateComponent {
  readonly height = input<string>('200px');
  readonly width = input<string>('100%');
}
