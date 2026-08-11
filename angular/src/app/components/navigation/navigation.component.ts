// Navigation — Angular port of src/components/Navigation.tsx
// Uses the Syncfusion Angular Sidebar wrapper (ej2-angular-navigations) for
// the dock/push layout, plus a flat toggle button (ej2-angular-buttons) and
// an inline SVG icon set so the port stays self-contained.
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  SidebarComponent,
  SidebarModule,
} from '@syncfusion/ej2-angular-navigations';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

import { ThemeSwitcherComponent } from '../theme-switcher/theme-switcher.component';

interface NavItem {
  readonly id: 'overview' | 'workforce' | 'hiring' | 'experience';
  readonly label: string;
  readonly path: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: 'overview', label: 'Overview', path: '/' },
  { id: 'workforce', label: 'Workforce Planning', path: '/workforce' },
  { id: 'hiring', label: 'Hiring Pipeline', path: '/hiring' },
  { id: 'experience', label: 'Employee Experience', path: '/experience' },
] as const;

@Component({
  selector: 'app-navigation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-open]': 'isOpen()',
    '[class.is-closed]': '!isOpen()',
  },
  imports: [
    RouterLink,
    RouterLinkActive,
    // The legacy Syncfusion EJ2 Angular components are not standalone, so
    // they must be pulled in through their NgModule wrappers.
    SidebarModule,
    ButtonModule,
    ThemeSwitcherComponent,
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
})
export class NavigationComponent {
  @ViewChild('sidebar', { static: true })
  private readonly sidebar?: SidebarComponent;

  // Emitted synchronously on user click so the layout can update its
  // state in the same change-detection cycle as the toggle — this keeps
  // the main-content animation perfectly aligned with the sidebar's own
  // animation (no lag from waiting for the sidebar's `change` event).
  @Output() public readonly toggle = new EventEmitter<void>();

  protected readonly navItems = NAV_ITEMS;
  // Exposed publicly so the layout component can react to sidebar state.
  public readonly isOpen = signal(true);

  protected onToggle(): void {
    this.toggle.emit();
    this.sidebar?.toggle();
  }

  protected onSidebarChange(): void {
    // Sync local open state with the Sidebar's actual DOM state so the
    // header logo/labels and the toggle icon stay in lock-step.
    const isOpen = !!this.sidebar?.isOpen;
    this.isOpen.set(isOpen);
  }
}
