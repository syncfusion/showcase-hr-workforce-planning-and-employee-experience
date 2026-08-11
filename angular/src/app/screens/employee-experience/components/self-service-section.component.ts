// SelfServiceSection — mirrors src/screens/EmployeeExperience/components/SelfServiceSection.tsx
// Modern SaaS table view: hero header (title + search + CTA), quick stats row,
// Syncfusion Grid with rich cell templates (subject, type/status/priority chips,
// relative date).
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import {
  TextBoxModule,
} from '@syncfusion/ej2-angular-inputs';
import {
  GridModule,
  PageService,
  SortService,
  FilterService,
} from '@syncfusion/ej2-angular-grids';
import {
  ButtonModule,
  ChipListModule,
} from '@syncfusion/ej2-angular-buttons';

import { LoadingStateComponent } from '../../../components/states/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../components/states/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../components/states/error-state/error-state.component';
import { SelfServiceRequestDialogComponent } from './self-service-request-dialog.component';
import { EmployeeExperienceService } from '../../../services/employee-experience.service';
import {
  SELF_SERVICE_STATUS_LABELS,
  PRIORITY_LABELS,
} from '../employee-experience.config';
import type {
  SelfServiceRequest,
} from '../../../models/employee-experience.model';

// Map each lifecycle status to a Syncfusion semantic `cssClass` for the chip.
const STATUS_CHIP: Record<string, string> = {
  submitted: 'e-primary',
  'in-review': 'e-info',
  'in-progress': 'e-warning',
  resolved: 'e-success',
  rejected: 'e-danger',
};

// Priority → Syncfusion semantic chip class.
const PRIORITY_CHIP: Record<string, string> = {
  low: 'e-primary',
  medium: 'e-info',
  high: 'e-warning',
  critical: 'e-danger',
};

// Human-readable label for each request type, used both in the type chip
// and in the in-card title.
const TYPE_LABELS: Record<string, string> = {
  'address-change': 'Address Change',
  benefits: 'Benefits',
  payroll: 'Payroll',
  equipment: 'Equipment',
  'leave-request': 'Leave Request',
  other: 'Other',
};

// Inline SVG path data for the subject-cell icon. These are byte-for-byte
// copies of the Lucide icon set used by the React screen (FileText,
// Paperclip, Calendar) — same approach the section-tab icons use in
// employee-experience.component.ts, which keeps us independent of whatever
// icon font happens to be in the loaded Syncfusion theme.
const TYPE_ICONS: Record<string, string> = {
  'address-change':
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
  benefits:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
  payroll:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
  equipment:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 17.93 8.8l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
  'leave-request':
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
  other:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
};

@Component({
  selector: 'app-self-service-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TextBoxModule,
    GridModule,
    ButtonModule,
    ChipListModule,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    SelfServiceRequestDialogComponent,
  ],
  providers: [PageService, SortService, FilterService],
  templateUrl: './self-service-section.component.html',
  styleUrl: './self-service-section.component.css',
})
export class SelfServiceSectionComponent implements OnInit {
  private readonly service = inject(EmployeeExperienceService);

  protected readonly typeLabels: Record<string, string> = TYPE_LABELS;
  protected readonly statusChip: Record<string, string> = STATUS_CHIP;
  protected readonly priorityChip: Record<string, string> = PRIORITY_CHIP;

  // Pre-sanitized SVG strings keyed by request type, used in the subject
  // cell template. The icons are static (no user input), so bypassing
  // sanitization is safe.
  private readonly sanitizer = inject(DomSanitizer);
  private readonly typeIconsSafe: Record<string, SafeHtml> = Object.fromEntries(
    Object.entries(TYPE_ICONS).map(([k, v]) => [k, this.sanitizer.bypassSecurityTrustHtml(v)]),
  );
  private readonly fallbackTypeIcon: SafeHtml =
    this.sanitizer.bypassSecurityTrustHtml(TYPE_ICONS['other']);

  // Lucide `Search` icon (16x16, 1.75 stroke) — pre-sanitized for the search
  // input wrapper. Static markup, no user input.
  protected readonly searchIcon: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  );

  protected readonly requests = signal<SelfServiceRequest[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly showForm = signal(false);
  protected readonly query = signal('');

  protected readonly stats = computed(() => {
    const list = this.requests();
    const open = list.filter((r) => r.status !== 'resolved' && r.status !== 'rejected').length;
    const inReview = list.filter((r) => r.status === 'in-review' || r.status === 'in-progress').length;
    const resolved = list.filter((r) => r.status === 'resolved').length;
    return { total: list.length, open, inReview, resolved };
  });

  protected readonly filtered = computed<SelfServiceRequest[]>(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.requests();
    if (!q) return list;
    return list.filter((r) =>
      [r.subject, r.details, r.assignedTo ?? '', TYPE_LABELS[r.type] ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  });

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      const data = await this.service.getSelfServiceRequests();
      this.requests.set(data);
    } catch {
      this.error.set('Failed to load self-service requests');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected retry(): void {
    void this.load();
  }

  /** Function reference passed to the shared EmptyState/ErrorState inputs. */
  protected readonly retryFn: () => void = () => this.retry();
  protected readonly openFormFn: () => void = () => this.toggleForm();

  protected onSearchInput(value: string): void {
    this.query.set(value ?? '');
  }

  protected toggleForm(): void {
    this.showForm.update((v) => !v);
  }

  protected closeForm(): void {
    this.showForm.set(false);
  }

  protected onRequestSubmitted(): void {
    // Refresh the list so the newly created request appears at the top.
    void this.load();
  }

  protected statusLabel(status: string): string {
    return SELF_SERVICE_STATUS_LABELS[status] ?? status;
  }

  protected priorityLabel(priority?: string): string | undefined {
    return priority ? PRIORITY_LABELS[priority] : undefined;
  }

  protected typeLabel(type: string): string {
    return TYPE_LABELS[type] ?? type;
  }

  /** Trusted inline-SVG icon for the subject cell, mapped from request type. */
  protected typeIcon(type: string): SafeHtml {
    return this.typeIconsSafe[type] ?? this.fallbackTypeIcon;
  }

  protected formatDate(value?: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  }

  protected formatRelative(value?: string | null): string {
    if (!value) return '';
    const d = new Date(value).getTime();
    const now = Date.now();
    const days = Math.floor((now - d) / 86_400_000);
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  }

  /** Returns true when the row's updatedAt differs from createdAt (i.e. the
   *  relative label should read "Updated X ago" instead of "Created X ago"). */
  protected hasUpdate(r: SelfServiceRequest): boolean {
    return !!r.updatedAt && r.updatedAt !== r.createdAt;
  }

  protected statusChipClass(status: string): string {
    return STATUS_CHIP[status] ?? 'e-primary';
  }

  protected priorityChipClass(priority?: string): string {
    return priority ? (PRIORITY_CHIP[priority] ?? 'e-primary') : 'e-primary';
  }
}
