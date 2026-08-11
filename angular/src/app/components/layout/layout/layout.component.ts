// Layout — Angular port of src/components/Layout.tsx
// Renders the navigation sidebar and projects the routed screen content next
// to it.
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../../navigation/navigation.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Reflect the navigation's open/closed state on the host element so the
  // layout CSS can target it with a simple class selector. The host is an
  // ancestor of <app-navigation>, so ancestor-walking selectors work; sibling
  // selectors (e.g. :has() or :host-context on a sibling) do not.
  host: {
    '[class.sidebar-docked]': 'sidebarDocked()',
  },
  imports: [RouterOutlet, NavigationComponent],
  template: `
    <div class="app-layout">
      <app-navigation (toggle)="onSidebarToggle()" />
      <main class="main-content">
        <div class="content-container">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  // Single source of truth for sidebar state on the layout side. Starts
  // false (sidebar open by default) and flips on each toggle event so the
  // host class changes in the same change-detection cycle as the click.
  protected readonly sidebarDocked = signal<boolean>(false);

  protected onSidebarToggle(): void {
    this.sidebarDocked.update(v => !v);
  }
}
