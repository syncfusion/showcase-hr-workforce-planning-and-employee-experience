// ThemeSwitcher — Angular port of src/components/ThemeSwitcher.tsx
// Compact icon button that cycles Light → Dark → System on each click.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../core/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="theme-switcher"
      (click)="cycle()"
      aria-label="Change theme"
      title="Change theme"
    >
      @switch (mode()) {
        @case ('light') {
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
               aria-hidden="true">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
          </svg>
        }
        @case ('dark') {
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
               aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        }
        @case ('system') {
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
               aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        }
      }
    </button>
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; }
    .theme-switcher {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: var(--radius-8);
      border: 1px solid var(--color-sf-border-secondary);
      background: var(--color-sf-bg-primary);
      color: var(--color-sf-fg-tertiary);
      cursor: pointer;
      padding: 0;
      transition: background 0.2s, color 0.2s, border-color 0.2s;
    }
    .theme-switcher:hover {
      background: var(--color-sf-bg-primary-hover);
      color: var(--color-sf-fg-primary);
    }
    .theme-switcher:focus-visible {
      outline: 2px solid var(--color-sf-brand-solid-primary);
      outline-offset: 2px;
    }
  `],
})
export class ThemeSwitcherComponent {
  private readonly theme = inject(ThemeService);

  readonly mode = this.theme.mode;

  cycle(): void {
    this.theme.cycleMode();
  }
}
