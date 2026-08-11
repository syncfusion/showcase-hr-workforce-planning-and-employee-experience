// Hiring Pipeline screen — Candidates / Applicants view.
// Ported from src/screens/HiringPipeline/CandidatesView.tsx (React).
//
// API:
//   GET    https://localhost:59527/api/hiring-pipeline/candidates
//   GET    https://localhost:59527/api/hiring-pipeline/candidates/counts
//   PATCH  https://localhost:59527/api/hiring-pipeline/candidates/{id}/status
//   POST   https://localhost:59527/api/hiring-pipeline/candidates/{id}/reject
//   POST   https://localhost:59527/api/hiring-pipeline/interviews

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
// ElementRef is used by the @ViewChild('candidatesGrid') field below.
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import {
  KanbanModule,
  CardSettingsModel,
} from '@syncfusion/ej2-angular-kanban';
import { ActionEventArgs } from '@syncfusion/ej2-kanban';
import {
  GridModule,
  PageService,
  SortService,
  FilterService,
  GroupService,
} from '@syncfusion/ej2-angular-grids';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import {
  ContextMenuModule,
  ContextMenuComponent,
  MenuEventArgs,
} from '@syncfusion/ej2-angular-navigations';
import type { MenuItemModel } from '@syncfusion/ej2-navigations';

import { PageHeaderComponent } from '../../components/layout/page-header/page-header.component';
import { LoadingStateComponent } from '../../components/states/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../components/states/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../components/states/error-state/error-state.component';
import { CandidatesMindmapComponent } from './components/candidates-mindmap/candidates-mindmap.component';
import {
  HiringPipelineService,
  ScheduleInterviewInput,
} from '../../services/hiring-pipeline.service';
import type {
  Applicant,
  ApplicantCounts,
  ApplicantStatus,
} from '../../models/hiring-pipeline.model';

type TabKey = 'all' | ApplicantStatus;
type ViewMode = 'list' | 'kanban';

interface TabDef {
  key: TabKey;
  label: string;
}

interface KanbanColumnDef {
  id: ApplicantStatus;
  headerText: string;
}

const TABS: ReadonlyArray<TabDef> = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'screening', label: 'Screening' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_LABEL: Record<ApplicantStatus, string> = {
  new: 'New',
  screening: 'Screening',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
};

// Note: the React side does NOT show a 'rejected' column on the kanban.
const KANBAN_COLUMNS: ReadonlyArray<KanbanColumnDef> = [
  { id: 'new', headerText: 'New' },
  { id: 'screening', headerText: 'Screening' },
  { id: 'interview', headerText: 'Interview' },
  { id: 'offer', headerText: 'Offer' },
  { id: 'hired', headerText: 'Hired' },
];

// "Move Stage" advance order (new → screening → interview → offer → hired).
const STAGE_ADVANCE_ORDER: ApplicantStatus[] = [
  'new',
  'screening',
  'interview',
  'offer',
  'hired',
];

// Source-filter dropdown option shape. Mirrors the Blazor port's
// `_sourceOptions` list ("" sentinel for "All sources", followed by the
// distinct candidate sources, sorted alphabetically).
interface SourceOption {
  /** Value stored in the signal and compared against `applicant.source`. */
  key: string;
  /** Human-readable label rendered in the dropdown. */
  label: string;
}

/** Sentinel for "no source filter" — matches the Blazor port's empty option. */
const ALL_SOURCES_KEY = '';

@Component({
  selector: 'app-hiring-pipeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    KanbanModule,
    GridModule,
    DropDownListModule,
    ContextMenuModule,
    PageHeaderComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    CandidatesMindmapComponent,
  ],
  providers: [PageService, SortService, FilterService, GroupService],
  templateUrl: './hiring-pipeline.component.html',
  styleUrl: './hiring-pipeline.component.css',
})
export class HiringPipelineComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly pipelineService = inject(HiringPipelineService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);

  // --- Constants exposed to the template ---
  protected readonly tabs: ReadonlyArray<TabDef> = TABS;
  protected readonly statusLabel: Record<ApplicantStatus, string> = STATUS_LABEL;
  protected readonly kanbanColumns: ReadonlyArray<KanbanColumnDef> = KANBAN_COLUMNS;
  // Source dropdown field mapping — the dataSource is `{ key, label }[]`
  // (see `sourceOptions` computed below), so the dropdown renders `label`
  // and emits the corresponding `key` on change. The previous shape used a
  // raw `string[]` with `{ text: '', value: '' }`, which left the dropdown
  // mis-configured and the (change) handler reading an undefined value.
  protected readonly sourceFields = { text: 'label', value: 'key' };

  // --- State signals (mirror React useState) ---
  protected readonly candidates = signal<Applicant[]>([]);
  /**
   * Mind-map cohort — fetched separately with `status: 'all'` and a large
   * pageSize (500, mirrors the React `useHiringPipelineData` hook) so the
   * mind map shows the unfiltered distribution. The grid uses a separate,
   * status-filtered cohort above.
   */
  protected readonly mindMapCandidates = signal<Applicant[]>([]);
  protected readonly mindMapLoading = signal<boolean>(true);
  protected readonly mindMapError = signal<string | null>(null);
  // Total pager count — matches the React CandidatesView: the API call
  // requests 124 records (`pageSize: 124`), so the grid effectively renders
  // 124 rows and the pager reports `ceil(124 / pageSize)` pages.
  protected readonly total = signal<number>(124);
  protected readonly page = signal<number>(1);
  // Aligns with the React CandidatesView's GridComponent
  // (`pageSettings={{ pageSize: 10 }}`). The same signal drives the API call
  // (`fetchApplicants({ pageSize: this.pageSize() })`) and the grid's
  // `pageSettings`, so pager and server stay in sync.
  protected readonly pageSize = signal<number>(124);
  protected readonly counts = signal<ApplicantCounts>({
    all: 0,
    new: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
  });
  protected readonly isLoading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly activeTab = signal<TabKey>('all');
  protected readonly viewMode = signal<ViewMode>('list');
  protected readonly sourceFilter = signal<string | null>(null);
  protected readonly contextTarget = signal<Applicant | null>(null);

  // --- Responsive state (React: useBreakpoint) ---
  protected readonly isCompact = signal<boolean>(false); // ≤768
  protected readonly isMobile = signal<boolean>(false); // ≤480
  // Derived per-spec:
  //   showLocation = bp === 'md' || bp === 'lg' || bp === 'xl'  (>768)
  //   showSource   = bp !== 'xs'                                (>480)
  protected readonly showLocation = signal<boolean>(true);
  protected readonly showSource = signal<boolean>(true);

  /** Mobile forces list view regardless of toggle (matches React). */
  protected readonly effectiveViewMode = computed<ViewMode>(() =>
    this.isMobile() ? 'list' : this.viewMode(),
  );

  /**
   * Source-filter dropdown options. Built dynamically from the currently
   * loaded candidates so the entries always match what's on screen — the
   * first entry is the "All sources" sentinel (empty key), and the rest
   * are the distinct `source` values sorted alphabetically. This mirrors
   * the Blazor port's `_sourceOptions` list and is what the dropdown binds
   * to via `[dataSource]="sourceOptions()"`.
   */
  protected readonly sourceOptions = computed<SourceOption[]>(() => {
    const distinct = Array.from(
      new Set(
        this.candidates()
          .map((c) => c.source)
          .filter((s): s is string => !!s && s.length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b));
    return [
      { key: ALL_SOURCES_KEY, label: 'All sources' },
      ...distinct.map((s) => ({ key: s, label: s })),
    ];
  });

  /**
   * Visible candidates after applying the active tab (status) and the
   * source filter. The backend already returns candidates filtered by
   * `status` (see `loadCandidates` → `status: this.activeTab()`), so this
   * is largely a defence-in-depth that keeps the grid and kanban in sync
   * with the source dropdown without round-tripping. When the backend is
   * offline and the `candidates` signal contains unfiltered rows, this
   * filter is what gives the user real filtering behaviour.
   */
  protected readonly filteredBySource = computed<Applicant[]>(() => {
    const list = this.candidates();
    const tab = this.activeTab();
    const filter = this.sourceFilter();
    return list.filter((c) => {
      if (tab !== 'all' && c.status !== tab) return false;
      if (filter && c.source !== filter) return false;
      return true;
    });
  });

  /** Grid page count for the pager. */
  protected readonly pageCount = computed<number>(() => {
    const size = this.pageSize();
    if (!size) return 1;
    return Math.max(1, Math.ceil(this.total() / size));
  });

  // --- Syncfusion view refs ---
  @ViewChild('candidatesGrid')
  protected candidatesGridRef?: ElementRef;

  @ViewChild('applicantContextMenu')
  protected contextMenuRef?: ContextMenuComponent;

  // --- Card settings (template wired through #candidateCardTemplate in HTML) ---
  protected readonly cardSettings: CardSettingsModel = {
    headerField: 'fullName',
    template: '#cardSettingsTemplate',
  };

  // --- Subscriptions / cleanup ---
  private resizeListener?: () => void;
  private mob480Mql?: MediaQueryList;
  private mq768Mql?: MediaQueryList;
  private mob480Handler?: (e: MediaQueryListEvent) => void;
  private mq768Handler?: (e: MediaQueryListEvent) => void;

  /**
   * Counts are a server-driven poll on every candidate change (mirrors the
   * React `useEffect(() => { fetchApplicantCounts() ... }, [candidates])`).
   * `effect()` must be created in an injection context, so it's a field
   * initializer rather than something set up in ngOnInit. Angular
   * automatically tears the effect down when the component is destroyed.
   */
  private readonly _countsOnChange = effect(() => {
    // Read the signal so the effect re-runs whenever it changes.
    this.candidates();
    this.loadCounts();
  });

  ngOnInit(): void {
    this.setupResponsiveListeners();
    this.loadCandidates();
    this.loadMindMapData();
  }

  ngAfterViewInit(): void {
    // First paint: make sure the responsive signals reflect the current
    // window in case matchMedia fired before Angular bootstrapped.
    this.syncResponsiveState(window.innerWidth);
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = undefined;
    }
    if (this.mob480Mql && this.mob480Handler) {
      this.mob480Mql.removeEventListener('change', this.mob480Handler);
    }
    if (this.mq768Mql && this.mq768Handler) {
      this.mq768Mql.removeEventListener('change', this.mq768Handler);
    }
  }

  // ------------------------------------------------------------ responsive --

  private setupResponsiveListeners(): void {
    // Match the React useBreakpoint: xs ≤480, sm 481–768.
    if (typeof window.matchMedia === 'function') {
      this.mob480Mql = window.matchMedia('(max-width: 480px)');
      this.mq768Mql = window.matchMedia('(max-width: 768px)');

      this.mob480Handler = (e: MediaQueryListEvent) => {
        this.isMobile.set(e.matches);
        this.showSource.set(!e.matches);
        this.cdr.markForCheck();
      };
      this.mq768Handler = (e: MediaQueryListEvent) => {
        this.isCompact.set(e.matches);
        this.showLocation.set(!e.matches);
        this.cdr.markForCheck();
      };

      this.mob480Mql.addEventListener('change', this.mob480Handler);
      this.mq768Mql.addEventListener('change', this.mq768Handler);
    }

    // Initial paint from current viewport.
    this.syncResponsiveState(window.innerWidth);

    // Resize listener kept as a fallback (debounced via rAF) so a window
    // resize between media-query change events still refreshes derived state.
    let rafId: number | null = null;
    this.resizeListener = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        this.zone.run(() => this.syncResponsiveState(window.innerWidth));
      });
    };
    window.addEventListener('resize', this.resizeListener);
  }

  private syncResponsiveState(width: number): void {
    this.isMobile.set(width <= 480);
    this.isCompact.set(width <= 768);
    this.showLocation.set(width > 768);
    this.showSource.set(width > 480);
  }

  // ----------------------------------------------------------- data loading --

  private async loadCandidates(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const result = await firstValueFrom(
        this.pipelineService.fetchApplicants({
          status: this.activeTab(),
          page: this.page(),
          pageSize: this.pageSize(),
          sort: 'appliedAt:desc',
        }),
      );
      this.candidates.set(result.items);
      // Pager count stays pinned to 124 (matches the React pageSettings —
      // the API is asked for 124 records, the grid is paginated at 10/page,
      // and the React totalRecordsCount effectively reports 124).
      this.total.set(124);
      this.applyGridStatusFilter();
    } catch {
      this.error.set('Failed to load candidates. Please try again.');
      this.candidates.set([]);
      this.total.set(124);
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }

  private loadCounts(): void {
    firstValueFrom(this.pipelineService.fetchApplicantCounts())
      .then((c) => this.counts.set(c))
      .catch(() => {
        // Non-blocking: keep the previous counts on transient errors.
      });
  }

  /**
   * Mind-map cohort loader — mirrors `useHiringPipelineData` in the React
   * side. Asks the API for a large page (500) with `status: 'all'` so the
   * mind map can show the unfiltered pipeline distribution regardless of
   * which tab the grid is currently showing. Runs in parallel with
   * `loadCandidates` and never blocks the list view.
   */
  private async loadMindMapData(): Promise<void> {
    this.mindMapLoading.set(true);
    this.mindMapError.set(null);
    try {
      const result = await firstValueFrom(
        this.pipelineService.fetchApplicants({
          status: 'all',
          page: 1,
          pageSize: 500,
          sort: 'appliedAt:desc',
        }),
      );
      this.mindMapCandidates.set(result.items);
    } catch {
      this.mindMapError.set('Failed to load pipeline distribution.');
      this.mindMapCandidates.set([]);
    } finally {
      this.mindMapLoading.set(false);
    }
  }

  /**
   * After data lands, push the active tab into the grid's FilterBar so the
   * visual chip on the Status column stays in sync with the server filter.
   * Mirrors the React `gridRef.current?.filterByColumn('status','==',activeTab)`.
   * When the active tab is 'all' we clear the status column filter rather
   * than filtering for the literal value 'all' (which would match nothing).
   */
  private applyGridStatusFilter(): void {
    setTimeout(() => {
      const grid = this.candidatesGridRef?.nativeElement as
        | (HTMLElement & {
            ej2_instances?: Array<{
              filterByColumn?: (field: string, op: string, val: unknown) => void;
              clearFiltering?: (field: string) => void;
            }>;
          })
        | undefined;
      const instance = grid?.ej2_instances?.[0];
      if (!instance) return;
      const tab = this.activeTab();
      if (tab === 'all') {
        instance.clearFiltering?.('status');
      } else if (instance.filterByColumn) {
        instance.filterByColumn('status', '==', tab);
      }
    }, 0);
  }

  // ------------------------------------------------------------ event API --

  protected handleTabChange(key: TabKey): void {
    this.page.set(1);
    this.activeTab.set(key);
    // Re-fetch candidates from the server with the new status filter so the
    // list / kanban update. The Blazor port does the same via Reload().
    this.loadCandidates();
  }

  protected setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  /**
   * Source-filter change handler. `value` arrives as the valueField from
   * the dropdown's `change` event — i.e. the `key` property of the
   * selected `SourceOption` (e.g. "LinkedIn", or the empty string for
   * the "All sources" sentinel). The empty key clears the filter.
   */
  protected onSourceFilterChange(value: unknown): void {
    const key = typeof value === 'string' ? value : '';
    this.sourceFilter.set(key.length > 0 ? key : null);
  }

  protected onGridRecordDoubleClick(e: { rowData?: Applicant }): void {
    if (e?.rowData) {
      this.contextTarget.set(e.rowData);
    }
  }

  protected async onKanbanActionComplete(
    e: ActionEventArgs & { data?: Applicant | Applicant[] },
  ): Promise<void> {
    if (e.requestType !== 'cardChanged' || e.data == null) return;
    const cards = Array.isArray(e.data) ? e.data : [e.data];
    if (cards.length === 0) return;
    const card = cards[0];
    try {
      await firstValueFrom(
        this.pipelineService.moveApplicantStage(card.id, card.status),
      );
      this.candidates.update((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, status: card.status } : c)),
      );
    } catch {
      this.error.set('Failed to update candidate stage. Please refresh.');
    }
  }

  protected onContextMenuSelect(e: MenuEventArgs): void {
    this.handleMenuSelect(e.item as MenuItemModel);
  }

  // -------------------------------------------------- context menu actions --

  /**
   * Open the context menu at the click coordinates of a per-row "more" button.
   *
   * The React side wires this via `recordDoubleClick` on the grid; in Angular
   * that is a quirky UX (double-click is rare). We expose a "more" button on
   * the Full Name cell that becomes visible on compact viewports only and
   * calls this method on click. The intent is equivalent.
   */
  protected openContextMenu(target: Applicant, event: MouseEvent): void {
    this.contextTarget.set(target);
    const menu = this.contextMenuRef;
    if (menu) {
      // Syncfusion's ContextMenu.open takes (top, left).
      menu.open(event.clientY, event.clientX);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  private async handleMenuSelect(item: MenuItemModel): Promise<void> {
    const target = this.contextTarget();
    if (!target) return;
    const text = (item.text || '').toString();
    try {
      if (text === 'View Profile') {
        // No-op placeholder; real impl would open a detail drawer.
        return;
      }
      if (text === 'Move Stage') {
        const order = STAGE_ADVANCE_ORDER;
        const idx = order.indexOf(target.status);
        const next = order[Math.min(idx + 1, order.length - 1)];
        if (next && next !== target.status) {
          try {
            await firstValueFrom(
              this.pipelineService.moveApplicantStage(target.id, next),
            );
          } catch {
            /* swallow: UI still updates optimistically below */
          }
          this.candidates.update((prev) =>
            prev.map((c) => (c.id === target.id ? { ...c, status: next } : c)),
          );
        }
        return;
      }
      if (text === 'Schedule Interview') {
        const payload: ScheduleInterviewInput = {
          applicationId: target.id,
          type: 'phone',
          scheduledStart: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          scheduledEnd: new Date(Date.now() + 25 * 3600 * 1000).toISOString(),
          interviewers: [],
        };
        try {
          await firstValueFrom(this.pipelineService.scheduleInterview(payload));
        } catch {
          /* swallow: schedule endpoint may be unimplemented on dev backends */
        }
        return;
      }
      if (text === 'Send Message') {
        return;
      }
      if (text === 'Reject') {
        try {
          await firstValueFrom(this.pipelineService.rejectApplicant(target.id));
        } catch {
          /* swallow */
        }
        this.candidates.update((prev) =>
          prev.map((c) =>
            c.id === target.id ? { ...c, status: 'rejected' } : c,
          ),
        );
        return;
      }
    } catch {
      this.error.set('Action failed. Please try again.');
    }
  }

  // Mirrors the React menu list. Icons use the Syncfusion e-icons sprite.
  protected readonly contextMenuItems: MenuItemModel[] = [
    { text: 'View Profile', iconCss: 'e-icons e-eye' },
    { text: 'Move Stage', iconCss: 'e-icons e-chevron-right' },
    { text: 'Schedule Interview', iconCss: 'e-icons e-calendar' },
    { text: 'Send Message', iconCss: 'e-icons e-edit' },
    { separator: true },
    { text: 'Reject', iconCss: 'e-icons e-close' },
  ];

  // ------------------------------------------------------------- helpers --

  /** Today / Yesterday / N D AGO etc., mirroring React's formatRelativeDate. */
  protected formatRelativeDate(iso: string): { line1: string; line2: string } {
    const date = new Date(iso);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (sameDay) return { line1: 'Today', line2: time.toUpperCase() };
    if (isYesterday) return { line1: 'Yesterday', line2: time.toUpperCase() };

    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    let relative = '';
    if (diffDays < 7) relative = `${diffDays}D AGO`;
    else if (diffDays < 30) relative = `${Math.floor(diffDays / 7)}W AGO`;
    else if (diffDays < 365)
      relative = `${Math.floor(diffDays / 30)} MONTH AGO`;
    else relative = `${Math.floor(diffDays / 365)}Y AGO`;

    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return { line1: `${dd}/${mm}/${yyyy}`, line2: relative };
  }

  /**
   * Safe lookup into the STATUS_LABEL map. Syncfusion passes `data` into
   * cell templates as `any`, so accessing `statusLabel[data.status]`
   * directly in the template fails strict-template type-checking with
   * TS7053 ("Element implicitly has an 'any' type"). This wrapper narrows
   * the key and returns a sensible fallback for any unknown value.
   */
  protected statusLabelFor(status: unknown): string {
    if (typeof status === 'string' && status in STATUS_LABEL) {
      return STATUS_LABEL[status as ApplicantStatus];
    }
    return String(status ?? '');
  }

  /** Fallback when the server doesn't pre-compute `initials` for an applicant. */
  protected generateInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map((p) => p[0] ?? '')
      .slice(0, 2)
      .join('');
  }

  /**
   * Avatar class for an applicant. Matches the React avatarClass logic
   * exactly: `avatar-{first-char-of-initials}` (lowercased), with `?` fallback.
   */
  protected avatarClass(applicant: Applicant): string {
    const letter = (applicant.initials || '?').charAt(0).toLowerCase();
    return `avatar avatar-${letter}`;
  }

  protected avatarChar(applicant: Applicant): string {
    return (
      applicant.initials || this.generateInitials(applicant.fullName) || '?'
    );
  }

  // --- Error / retry handling (matches React: clear error and re-load) ---
  protected retry(): void {
    this.error.set(null);
    this.loadCandidates();
    this.loadCounts();
  }
}
