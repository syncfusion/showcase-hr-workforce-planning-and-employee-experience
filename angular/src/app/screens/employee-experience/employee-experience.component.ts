// EmployeeExperience screen — mirrors src/screens/EmployeeExperience/EmployeeExperience.tsx
// API/Service: src/services/employeeExperienceService.ts (mock-backed in-memory store)
// Endpoints are not exposed; mutations and reads go through the
// EmployeeExperienceService to preserve identical behaviour.
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  computed,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  TabModule,
  SelectEventArgs,
} from '@syncfusion/ej2-angular-navigations';

import { PageHeaderComponent } from '../../components/layout/page-header/page-header.component';
import { LoadingStateComponent } from '../../components/states/loading-state/loading-state.component';
import { EmployeeExperienceService } from '../../services/employee-experience.service';
import {
  SUB_SECTIONS,
  type SubSectionId,
} from './employee-experience.config';
import { SelfServiceSectionComponent } from './components/self-service-section.component';
import { FeedbackSectionComponent } from './components/feedback-section.component';
import { RecognitionSectionComponent } from './components/recognition-section.component';
import { CareerSectionComponent } from './components/career-section.component';
import { LearningSectionComponent } from './components/learning-section.component';
import { ReportIssueDialogComponent } from './components/report-issue-dialog.component';
import { DelayConcernDialogComponent } from './components/delay-concern-dialog.component';
import { MyBoardSectionComponent } from './components/my-board-section.component';
import { NotificationsChatPanelComponent } from './components/notifications-chat-panel.component';

const SECTION_INDEX_MAP: Record<SubSectionId, number> = {
  'self-service': 0,
  feedback: 1,
  recognition: 2,
  career: 3,
  learning: 4,
  'my-board': 5,
};

const INDEX_SECTION_MAP: Record<number, SubSectionId> = {
  0: 'self-service',
  1: 'feedback',
  2: 'recognition',
  3: 'career',
  4: 'learning',
  5: 'my-board',
};

// Inline SVG path data for each tab icon. These are byte-for-byte copies of
// the Lucide icon set used by the React screen (Inbox, MessageSquareQuote,
// Sparkles, Compass, GraduationCap, Kanban). Rendering them as inline SVG
// keeps us independent of whatever icon font happens to be in the loaded
// Syncfusion theme — earlier we tried `e-inbox` / `e-comment-show` etc.,
// but those classes are not part of every theme build and rendered as
// empty boxes. Inline SVG is the same approach the React screen uses
// (via `renderToStaticMarkup(<LucideIcon size={16} strokeWidth={1.75} />)`)
// and guarantees the icons always paint.
const SECTION_ICON_SVG: Record<SubSectionId, string> = {
  'self-service':
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  feedback:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  recognition:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>',
  career:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  learning:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>',
  'my-board':
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>',
};

interface TabHeaderView {
  id: SubSectionId;
  text: string;
}

const POLL_INTERVAL_MS = 5000;

@Component({
  selector: 'app-employee-experience',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TabModule,
    PageHeaderComponent,
    LoadingStateComponent,
    SelfServiceSectionComponent,
    FeedbackSectionComponent,
    RecognitionSectionComponent,
    CareerSectionComponent,
    LearningSectionComponent,
    MyBoardSectionComponent,
    ReportIssueDialogComponent,
    DelayConcernDialogComponent,
    NotificationsChatPanelComponent,
  ],
  templateUrl: './employee-experience.component.html',
  styleUrl: './employee-experience.component.css',
})
export class EmployeeExperienceComponent implements OnInit, OnDestroy {
  private readonly service = inject(EmployeeExperienceService);
  private readonly platformId = inject(PLATFORM_ID);
  private pollHandle: ReturnType<typeof setInterval> | null = null;

  protected readonly subSections = SUB_SECTIONS;

  protected readonly activeSection = signal<SubSectionId>(this.initialSection());
  protected readonly isReportIssueOpen = signal(false);
  protected readonly isDelayConcernOpen = signal(false);
  protected readonly isNotificationsOpen = signal(false);
  protected readonly unreadCount = signal(0);
  protected readonly notificationsLoaded = signal(false);

  protected readonly selectedTabIndex = computed<number>(
    () => SECTION_INDEX_MAP[this.activeSection()],
  );

  /**
   * Tab header view-models. The `text` field carries HTML for the
   * `ee-modern-tab__inner` wrapper (icon + label) so the Syncfusion
   * TabComponent still owns the active-state DOM — same approach as the
   * React screen, which uses `renderToStaticMarkup(<LucideIcon ... />)`.
   */
  protected readonly tabItems: readonly TabHeaderView[] = SUB_SECTIONS.map((s) => ({
    id: s.id,
    text: `
      <span class="ee-modern-tab__inner">
        <span class="ee-modern-tab__icon" aria-hidden="true">${SECTION_ICON_SVG[s.id]}</span>
        <span class="ee-modern-tab__label">${s.label}</span>
      </span>
    `,
  }));

  ngOnInit(): void {
    // The activeSection signal is already initialised via initialSection()
    // (which honours the URL hash on first paint). We only need to start the
    // unread-count poll here.
    void this.loadUnread();
    this.pollHandle = setInterval(() => {
      void this.loadUnread();
    }, POLL_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.pollHandle !== null) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }

  private initialSection(): SubSectionId {
    if (!isPlatformBrowser(this.platformId)) return 'self-service';
    const hash = window.location.hash.replace('#', '');
    if (hash && SUB_SECTIONS.some((s) => s.id === hash)) {
      return hash as SubSectionId;
    }
    return 'self-service';
  }

  private async loadUnread(): Promise<void> {
    try {
      const items = await this.service.getNotifications();
      this.unreadCount.set(items.filter((n) => !n.read).length);
      this.notificationsLoaded.set(true);
    } catch {
      this.notificationsLoaded.set(true);
    }
  }

  protected onTabSelected(args: SelectEventArgs): void {
    const idx = args.selectedIndex;
    if (idx === undefined || idx === null) return;
    const section = INDEX_SECTION_MAP[idx];
    if (section) {
      this.activeSection.set(section);
      if (isPlatformBrowser(this.platformId)) {
        window.location.hash = section;
      }
    }
  }

  protected openReportIssue(): void {
    this.isReportIssueOpen.set(true);
  }
  protected closeReportIssue(): void {
    this.isReportIssueOpen.set(false);
  }

  protected openDelayConcern(): void {
    this.isDelayConcernOpen.set(true);
  }
  protected closeDelayConcern(): void {
    this.isDelayConcernOpen.set(false);
  }

  protected openNotifications(): void {
    this.isNotificationsOpen.set(true);
  }
  protected closeNotifications(): void {
    this.isNotificationsOpen.set(false);
  }

  /**
   * Bridges the panel's per-item unread-count updates back to the bell badge.
   * The panel only emits while it is mounted (i.e. while the drawer is open),
   * but the bell already has the polled value from `loadUnread`, so closing
   * the drawer simply means the badge stays at the last polled value until
   * the next tick.
   */
  protected handleUnreadChange(count: number): void {
    this.unreadCount.set(count);
  }
}
