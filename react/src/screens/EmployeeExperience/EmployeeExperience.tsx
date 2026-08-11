import React, { useEffect, useRef, useState, useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Inbox,
  MessageSquareQuote,
  Sparkles,
  Compass,
  GraduationCap,
  Kanban as KanbanIcon,
  Bell,
} from 'lucide-react';
import {
  TabComponent,
  TabItemsDirective,
  TabItemDirective,
  SidebarComponent,
  type SelectEventArgs,
} from '@syncfusion/ej2-react-navigations';
import { PageHeader } from '../../components/Layout';
import { LoadingState } from '../../components/states/LoadingState';
import { SUB_SECTIONS, type SubSectionId } from './employeeExperienceConfig';
import { SelfServiceSection } from './components/SelfServiceSection';
import { FeedbackSection } from './components/FeedbackSection';
import { RecognitionSection } from './components/RecognitionSection';
import { CareerSection } from './components/CareerSection';
import { LearningSection } from './components/LearningSection';
import { MyBoardSection } from './components/MyBoardSection';
import { ReportIssueDialog } from './components/ReportIssueDialog';
import { DelayConcernDialog } from './components/DelayConcernDialog';
import { NotificationsChatPanel } from './components/NotificationsChatPanel';
import { getNotifications } from '../../services/employeeExperienceService';

const INDEX_SECTION_MAP: Record<number, SubSectionId> = {
  0: 'self-service',
  1: 'feedback',
  2: 'recognition',
  3: 'career',
  4: 'learning',
  5: 'my-board',
};

// Reverse lookup: section id → tab index. Used to drive the Syncfusion
// TabComponent's `selectedItem` prop from React state so the highlighted
// header always matches the section actually being rendered. Without this,
// the tab bar is uncontrolled and reverts to index 0 on every page load,
// even when the URL hash (or refreshed state) selects a different section.
const SECTION_INDEX_MAP: Record<SubSectionId, number> = SUB_SECTIONS.reduce(
  (acc, s, idx) => {
    acc[s.id] = idx;
    return acc;
  },
  {} as Record<SubSectionId, number>
);

// Lucide icons that pair with each sub-section. A single-tone, minimalist set
// keeps the tab bar visually quiet and scannable.
const SECTION_ICONS: Record<SubSectionId, React.ElementType> = {
  'self-service': Inbox,
  feedback: MessageSquareQuote,
  recognition: Sparkles,
  career: Compass,
  learning: GraduationCap,
  'my-board': KanbanIcon,
};

// Render the Lucide icon for each section to a static HTML string once at
// module load. Syncfusion's TabComponent accepts HTML in `header.text`, and we
// want the icon to live *inside* the Syncfusion-rendered tab so the active
// state and indicator bar apply to it. Using renderToStaticMarkup avoids
// hand-rolling SVG paths and keeps a single source of truth.
const renderIcon = (Icon: React.ElementType): string =>
  renderToStaticMarkup(<Icon size={16} strokeWidth={1.75} aria-hidden="true" />);

// Module-level indirection for the TabComponent `selected` handler. The
// TabComponent's `selected` setter (from Syncfusion's `Event()` decorator)
// re-applies the event listener on every prop change and can throw
// "Cannot convert undefined or null to object" if the function reference
// shifts mid-life. Keeping a single stable reference here and routing the
// real work through `onTabSelectedRef` (populated in an effect) means the
// reference we hand to Syncfusion never changes. See the JSX comment for
// the full picture.
let onTabSelectedRef: ((args: SelectEventArgs) => void) | null = null;
const onTabSelectedStable = (args: SelectEventArgs) => {
  if (onTabSelectedRef) onTabSelectedRef(args);
};

interface TabContentProps {
  id: SubSectionId;
  onReportIssue: () => void;
  onDelayConcern: () => void;
}

const TabContent: React.FC<TabContentProps> = ({ id, onReportIssue, onDelayConcern }) => {
  switch (id) {
    case 'self-service':
      return <SelfServiceSection />;
    case 'feedback':
      return <FeedbackSection />;
    case 'recognition':
      return <RecognitionSection />;
    case 'career':
      return <CareerSection />;
    case 'learning':
      return <LearningSection />;
    case 'my-board':
      return (
        <MyBoardSection
          onReportIssue={onReportIssue}
          onDelayConcern={onDelayConcern}
        />
      );
    default:
      return <SelfServiceSection />;
  }
};

const getInitialSection = (): SubSectionId => {
  const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
  if (hash && SUB_SECTIONS.some((s) => s.id === hash)) {
    return hash as SubSectionId;
  }
  return 'self-service';
};

export const EmployeeExperience: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SubSectionId>(getInitialSection);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);
  const [isDelayConcernOpen, setIsDelayConcernOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);

  // Imperative ref to the Syncfusion Sidebar. The widget needs to be
  // always-mounted (and toggled via show()/hide()) rather than conditionally
  // mounted, because Syncfusion reads `isOpen` only during its `created`
  // lifecycle — a sidebar that mounts with isOpen={true} never receives the
  // `e-open` class and the panel content area is hidden behind the backdrop.
  const notificationsSidebarRef = useRef<SidebarComponent | null>(null);

  useEffect(() => {
    window.location.hash = activeSection;
  }, [activeSection]);

  useEffect(() => {
    let mounted = true;
    const loadUnread = async () => {
      try {
        const items = await getNotifications();
        if (mounted) {
          setUnreadCount(items.filter((n) => !n.read).length);
          setNotificationsLoaded(true);
        }
      } catch {
        if (mounted) setNotificationsLoaded(true);
      }
    };
    loadUnread();
    const interval = setInterval(loadUnread, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleUnreadChange = (count: number) => setUnreadCount(count);

  const openNotifications = () => {
    setIsNotificationsOpen(true);
    // show() is the documented imperative API. We call it after React has
    // applied isOpen={true} so the widget's internal state is in sync.
    requestAnimationFrame(() => notificationsSidebarRef.current?.show());
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
    notificationsSidebarRef.current?.hide();
  };

  // Escape closes the drawer — keyboard parity with the old custom dialog.
  useEffect(() => {
    if (!isNotificationsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNotifications();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotificationsOpen]);

  // Lock the page scroll while the drawer is open. Without this the
  // browser's vertical scrollbar (which is on <html>/<body>, not on the
  // drawer) keeps scrolling the page behind the drawer and the
  // notifications list appears "stuck" — you can see the page content
  // sliding under the drawer as you wheel, while the drawer's own
  // scroll container doesn't move because the user never engaged it.
  useEffect(() => {
    if (!isNotificationsOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    // Compensate for the disappearing scrollbar so the page doesn't jump.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    // Block wheel/touchmove on the document while the drawer is open so
    // the page behind cannot scroll even if the user wheels over the
    // backdrop edge or in the gap between the drawer and the page.
    const stop = (e: Event) => { e.preventDefault(); };
    document.addEventListener('wheel', stop, { passive: false });
    document.addEventListener('touchmove', stop, { passive: false });
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      document.removeEventListener('wheel', stop);
      document.removeEventListener('touchmove', stop);
    };
  }, [isNotificationsOpen]);

  const tabItems = useMemo(
    () =>
      SUB_SECTIONS.map((s) => {
        const Icon = SECTION_ICONS[s.id];
        const iconHtml = renderIcon(Icon);
        return {
          id: s.id,
          label: s.label,
          // `header.text` accepts HTML; we render the icon + label inline so
          // the Syncfusion TabComponent still owns the active-state DOM (we
          // style it with `.ee-modern-tab` CSS below).
          header: {
            text: `
              <span class="ee-modern-tab__inner">
                <span class="ee-modern-tab__icon" aria-hidden="true">${iconHtml}</span>
                <span class="ee-modern-tab__label">${s.label}</span>
              </span>
            `,
          },
          content: undefined,
        };
      }),
    []
  );

  // Register the per-instance handler with the module-level dispatcher. This
  // way the `selected` prop on the TabComponent is always the same function
  // reference (see `onTabSelectedStable` above) regardless of how many times
  // this component re-renders or remounts.
  useEffect(() => {
    onTabSelectedRef = (args: SelectEventArgs) => {
      const idx = args.selectedIndex;
      if (idx !== undefined && idx !== null) {
        const section = INDEX_SECTION_MAP[idx];
        if (section) setActiveSection(section);
      }
    };
    return () => {
      if (onTabSelectedRef) onTabSelectedRef = null;
    };
  }, []);

  if (!notificationsLoaded) {
    return <LoadingState height="400px" />;
  }

  return (
    <div className="employee-experience-screen">
      <PageHeader
        title="Employee Experience"
        subtitle="Self-service, feedback, recognition, career, and learning — with issue reporting and triage"
      />

      <div className="ee-tabs-row" role="toolbar" aria-label="Employee experience sections">
        <div className="ee-tabs-row__tabs" aria-label="Employee experience sub-sections">
          {/*
            Tab switching notes
            --------------------
            Syncfusion's TabComponent has two related bugs that we work around
            here:

            1. Its `selected` event-handler setter (defined by the `Event()`
               decorator in `ej2-base`) calls `removeEventListener` on the
               previous handler before adding the new one. When the prop's
               function reference changes between renders, the setter runs while
               the internal Observer is in an inconsistent state and throws
               "Cannot convert undefined or null to object" from
               `hasOwnProperty.call(undefined, ...)`. We sidestep that by
               passing a module-level stable function (`onTabSelectedStable`)
               and routing the actual work through a mutable ref
               (`onTabSelectedRef`) that the component populates in an effect.

            2. The tab panels are rendered as siblings of our external content
               in the same parent. If we put `key={activeSection}` on the
               section wrapper, React tries to unmount and remount it on every
               tab switch, but Syncfusion has already detached/re-attached its
               own panel nodes — so React's commit phase fails with
               `NotFoundError: Failed to execute 'insertBefore' on 'Node'`.
               The section is therefore kept stable; only the rendered section
               component changes underneath it.

            3. The `TabComponent` is *controlled* via `selectedItem`, derived
               from React's `activeSection` state. Without this, the tab bar
               is internally driven and would re-default to index 0 on every
               page load — so refreshing the page on, say, Career would
               leave the URL hash as `#career` (and the content showing
               Career) but the active-tab highlight would stay on Self-Service.
               Driving `selectedItem` from React state keeps the highlighted
               header and the rendered section in lock-step, and also handles
               the `getInitialSection()` hash read on first mount.
          */}
          <TabComponent
            selected={onTabSelectedStable}
            selectedItem={SECTION_INDEX_MAP[activeSection]}
            cssClass="e-tabs ee-modern-tabs"
          >
            <TabItemsDirective>
              {tabItems.map((item, idx) => (
                <TabItemDirective key={idx} header={item.header} content={undefined} />
              ))}
            </TabItemsDirective>
          </TabComponent>
        </div>

        <button
          type="button"
          id="ee-notifications-btn"
          className="ee-bell"
          onClick={openNotifications}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          title="Open notifications"
        >
          <Bell size={18} strokeWidth={1.75} aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="ee-bell__count" role="status" aria-live="polite">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      <section className="ee-subsection-content" aria-live="polite">
        <TabContent
          id={activeSection}
          onReportIssue={() => setIsReportIssueOpen(true)}
          onDelayConcern={() => setIsDelayConcernOpen(true)}
        />
      </section>

      <ReportIssueDialog
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
      />
      <DelayConcernDialog
        isOpen={isDelayConcernOpen}
        onClose={() => setIsDelayConcernOpen(false)}
      />

      {/*
        Notifications drawer — Syncfusion SidebarComponent + custom backdrop.

        We disable Syncfusion's built-in `showBackdrop` because the overlay it
        renders has `position: fixed; width: 100%; z-index: 999` which paints
        *over* the panel and swallows clicks/scrolls on the notifications UI.
        Instead we render our own backdrop that is strictly outside the panel's
        footprint and is the single click target for "close on outside click".
        Closing is also available from the `×` button and the Escape key. The
        SidebarComponent is always mounted and toggled via show()/hide() so
        the widget's e-open state and React's isOpen prop never drift.
      */}
      {isNotificationsOpen && (
        <div
          className="ee-drawer-backdrop"
          role="presentation"
          aria-hidden="true"
          onClick={closeNotifications}
        />
      )}
      <SidebarComponent
        ref={notificationsSidebarRef}
        id="ee-notifications-drawer"
        className="ee-notifications-drawer"
        type="Over"
        position="Right"
        width="min(420px, 100vw)"
        isOpen={isNotificationsOpen}
        showBackdrop={false}
        closeOnDocumentClick={false}
        enableGestures={false}
        animate={true}
        zIndex={1101}
        created={() => {
          // If the drawer was open before the widget finished initializing
          // (e.g. very first mount), make sure the imperative state matches.
          if (isNotificationsOpen) {
            notificationsSidebarRef.current?.show();
          }
        }}
      >
        <div
          className="ee-drawer-header"
          role="dialog"
          aria-modal="true"
          aria-label="Notifications and chat"
        >
          <h3 className="ee-section-title">Notifications</h3>
          <button
            type="button"
            className="ee-close-btn"
            onClick={closeNotifications}
            aria-label="Close notifications"
          >
            ×
          </button>
        </div>
        <div className="ee-drawer-body">
          <NotificationsChatPanel onUnreadChange={handleUnreadChange} />
        </div>
      </SidebarComponent>

      <style>{`
        .employee-experience-screen { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* =========================================================================
           Modern horizontal tab bar + notification bell
           8px grid, hairline borders, soft micro-shadows. Inter typography.
           ========================================================================= */
        .ee-tabs-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding: 6px 6px 0 6px;
          background: var(--color-sf-bg-primary);
          border: 1px solid var(--color-sf-hairline);
          border-radius: 12px;
          box-shadow: var(--shadow-card);
        }
        .ee-tabs-row__tabs {
          flex: 1;
          min-width: 0;
        }

        /* --- Syncfusion TabComponent restyle ---------------------------------- */
        .ee-modern-tabs.e-tab {
          background: transparent !important;
          border: 0 !important;
        }
        .ee-modern-tabs .e-tab-header {
          background: transparent !important;
          border: 0 !important;
          border-bottom: 1px solid var(--color-sf-hairline) !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .ee-modern-tabs .e-tab-header::before,
        .ee-modern-tabs .e-tab-header::after { display: none !important; }

        .ee-modern-tabs .e-toolbar-items {
          gap: 4px;
        }
        .ee-modern-tabs .e-toolbar-item {
          margin: 0 !important;
        }
        .ee-modern-tabs .e-tab-text {
          padding: 0 !important;
          background: transparent !important;
        }

        /* Each tab item shell (we use the modern-tab inner HTML) */
        .ee-modern-tab__inner {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-sf-fg-tertiary);
          border-radius: 8px 8px 0 0;
          position: relative;
          transition: color 0.15s ease, background-color 0.15s ease;
          cursor: pointer;
        }
        .ee-modern-tabs .e-toolbar-item:not(.e-active) .ee-modern-tab__inner:hover {
          color: var(--color-sf-fg-primary);
          background: var(--color-sf-bg-secondary-subtle);
        }
        .ee-modern-tabs .e-toolbar-item.e-active .ee-modern-tab__inner {
          color: var(--color-sf-fg-brand-primary);
          background: transparent;
        }
        .ee-modern-tabs .e-toolbar-item.e-active .ee-modern-tab__inner::after {
          background: var(--color-sf-brand-600);
        }
        .ee-modern-tab__icon {
          width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: currentColor;
          flex-shrink: 0;
        }
        .ee-modern-tab__icon svg {
          width: 16px;
          height: 16px;
          color: currentColor;
        }
        .ee-modern-tab__label {
          white-space: nowrap;
        }

        /* --- Notification bell (Lucide) ------------------------------------- */
        .ee-bell {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--color-sf-bg-primary);
          border: 1px solid var(--color-sf-hairline);
          color: var(--color-sf-fg-tertiary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          margin-right: 4px;
          margin-bottom: 4px;
          transition: background-color 0.15s ease,
                      color 0.15s ease,
                      border-color 0.15s ease,
                      box-shadow 0.15s ease,
                      transform 0.15s ease;
        }
        .ee-bell:hover {
          background: var(--color-sf-bg-secondary);
          color: var(--color-sf-fg-primary);
          border-color: var(--color-sf-border-primary);
          box-shadow: var(--shadow-card);
          transform: translateY(-1px);
        }
        .ee-bell:active {
          transform: translateY(0) scale(0.97);
          box-shadow: none;
        }
        .ee-bell:focus-visible {
          outline: 2px solid var(--color-sf-border-brand);
          outline-offset: 2px;
        }
        .ee-bell svg {
          width: 18px;
          height: 18px;
          color: currentColor;
        }
        .ee-bell__count {
          position: absolute;
          top: 6px;
          right: 6px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          background: var(--color-sf-error-600);
          color: #fff;
          border-radius: 999px;
          border: 2px solid var(--color-sf-bg-primary);
          box-sizing: border-box;
          letter-spacing: 0.02em;
        }
        .ee-count-badge {
          font-size: 11px; font-weight: 600;
          padding: 2px 8px; border-radius: 10px;
        }

        .ee-subsection-content {
          background: var(--color-sf-bg-primary);
          border: 1px solid var(--color-sf-hairline);
          border-radius: 12px;
          padding: 24px;
          box-shadow: var(--shadow-card);
          min-height: 320px;
          animation: ee-fadeInContent 0.25s ease-in;
        }
        @keyframes ee-fadeInContent {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ee-card { background: var(--color-sf-bg-primary); border: 1px solid var(--color-sf-border-secondary); border-radius: 8px; padding: 16px; }
        .ee-card + .ee-card { margin-top: 12px; }
        .ee-section-title { font-size: 15px; font-weight: 600; margin: 0 0 12px 0; color: var(--color-sf-fg-primary); }
        .ee-muted { color: var(--color-sf-fg-tertiary); font-size: 12px; }

        .ee-form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ee-form .full { grid-column: 1 / -1; }
        .ee-field { display: flex; flex-direction: column; gap: 4px; }
        .ee-field label { font-size: 12px; font-weight: 600; color: var(--color-sf-fg-secondary); }
        .ee-field input, .ee-field select, .ee-field textarea {
          border: 1px solid var(--color-sf-border-primary); border-radius: 6px; padding: 8px 10px; font-size: 13px; background: var(--color-sf-bg-primary); color: var(--color-sf-fg-primary);
        }
        .ee-field input:focus, .ee-field select:focus, .ee-field textarea:focus {
          outline: 2px solid var(--color-sf-brand-primary); outline-offset: -1px;
        }
        .ee-field .error { color: var(--color-sf-fg-error-primary); font-size: 11px; }

        .ee-btn-primary {
          background: var(--color-sf-brand-solid-primary); color: var(--color-sf-on-brand-solid-primary); border: none; padding: 8px 16px;
          border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;
        }
        .ee-btn-primary:hover { background: var(--color-sf-brand-solid-primary-hover); }
        .ee-btn-primary:disabled { background: var(--color-sf-bg-disabled); cursor: not-allowed; }

        .ee-badge {
          display: inline-block; padding: 2px 8px; border-radius: 10px; color: #fff;
          font-size: 11px; font-weight: 600; text-transform: capitalize;
        }
        .ee-status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }

        .ee-dialog-backdrop {
          position: fixed; inset: 0; background: var(--color-sf-utility-overlay-bg-color); z-index: 1000;
          display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        .ee-dialog {
          background: var(--color-sf-bg-primary); border-radius: 10px; max-width: 560px; width: 100%;
          max-height: 90vh; overflow: auto; box-shadow: var(--shadow-xl);
        }
        .ee-dialog-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 20px; border-bottom: 1px solid var(--color-sf-border-secondary);
        }
        .ee-dialog-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--color-sf-fg-primary); }
        .ee-dialog-body { padding: 20px; }
        .ee-dialog-footer {
          display: flex; justify-content: flex-end; gap: 10px; padding: 12px 20px;
          border-top: 1px solid var(--color-sf-border-secondary);
        }
        .ee-close-btn {
          background: transparent; border: none; font-size: 20px; cursor: pointer;
          line-height: 1; color: var(--color-sf-fg-tertiary); padding: 4px 8px; border-radius: 4px;
        }
        .ee-close-btn:hover { background: var(--color-sf-bg-secondary-hover); }
        .ee-btn-tertiary {
          background: var(--color-sf-bg-secondary); color: var(--color-sf-fg-secondary); border: none; padding: 8px 16px;
          border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;
        }
        .ee-btn-tertiary:hover { background: var(--color-sf-bg-secondary-hover); }

        .ee-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .ee-table th { background: var(--color-sf-bg-secondary); text-align: left; padding: 8px 10px; font-size: 12px; color: var(--color-sf-fg-secondary); border-bottom: 1px solid var(--color-sf-border-primary); }
        .ee-table td { padding: 8px 10px; border-bottom: 1px solid var(--color-sf-border-tertiary); color: var(--color-sf-fg-primary); }

        .ee-link-btn {
          background: transparent; border: none; color: var(--color-sf-brand-primary); cursor: pointer;
          font-size: 12px; padding: 2px 4px; text-decoration: underline;
        }

        .ee-list { display: flex; flex-direction: column; gap: 12px; }

        /* My Board tab content */
        .ee-board-section { display: flex; flex-direction: column; gap: 12px; }
        .ee-board-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
        }
        .ee-board-header .ee-section-title { margin: 0; }
        .ee-board-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .e-btn.ee-board-actions__btn {
          font-size: 12px;
          padding: 6px 12px;
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
        }
        .e-btn.ee-board-actions__btn:hover { transform: translateY(-1px); }
        .e-btn.ee-board-actions__btn:active { transform: translateY(0); }

        /* =========================================================================
           Notifications drawer
           We render our own backdrop so it lives strictly *outside* the panel
           area (Syncfusion's built-in overlay covers the entire viewport
           including the panel, which swallows clicks/scrolls). Layering:
             - backdrop: z-index 1100
             - panel:    z-index 1101 (set via the SidebarComponent prop)
           The panel is forced to viewport height (the theme default of 100%
           collapses to 0 inside our non-viewport-sized flex parent).
           ========================================================================= */
        .ee-drawer-backdrop {
          position: fixed;
          top: 0; bottom: 0; left: 0;
          right: 420px; /* leave room for the 420px-wide panel */
          background: var(--color-sf-utility-overlay-bg-color, rgba(0, 0, 0, 0.45));
          z-index: 1100;
          pointer-events: auto;
          animation: ee-backdrop-fade-in 0.2s ease;
        }
        @keyframes ee-backdrop-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .ee-notifications-drawer.e-sidebar {
          background: var(--color-sf-bg-primary);
          border-left: 1px solid var(--color-sf-border-secondary);
          box-shadow: var(--shadow-xl);
          display: flex; flex-direction: column;
          /* The sidebar is position:fixed by Syncfusion, so this is
             relative to the viewport. Anchor it to the top so the
             header always sits at 0,0 regardless of where the host
             element was rendered. */
          top: 0 !important;
          height: 100vh;
          max-height: 100vh;
          pointer-events: auto;
        }
        .ee-notifications-drawer.e-sidebar > * {
          position: relative;
          z-index: 1;
        }
        .ee-drawer-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 16px;
          border-bottom: 1px solid var(--color-sf-border-secondary);
          flex-shrink: 0;
        }
        .ee-drawer-header .ee-section-title { margin: 0; }
        .ee-drawer-body {
          /* The drawer body is the *only* scroll container. Use a
             concrete viewport-based height (fall through to flex: 1
             for the inner panel) and never let the page behind scroll
             when this region is the target of a wheel event. */
          flex: 1 1 auto;
          min-height: 0;
          overflow: auto;
          padding: 12px;
          pointer-events: auto;
          overscroll-behavior: contain;
        }

        /* The notifications/chat panel is laid out as a single flex
           column so the active tab's inner list can claim the rest of
           the drawer body height and become *the* scroll area. */
        .ee-ncp { box-sizing: border-box; }
        .ee-ncp__scroll { overscroll-behavior: contain; }

        @media (max-width: 720px) {
          .ee-tabs-row { flex-direction: column; align-items: stretch; }
          .ee-bell { align-self: flex-end; margin-bottom: 8px; }
        }
        @media (max-width: 640px) {
          .ee-form { grid-template-columns: 1fr; }
          .ee-notifications-drawer.e-sidebar { width: 100vw !important; }
          /* On small screens the panel fills the viewport, so there is no
             outside area to capture. Hide the backdrop entirely; the Escape
             key and close button remain the only ways to dismiss. */
          .ee-drawer-backdrop { display: none; }
          .ee-board-header { flex-direction: column; align-items: flex-start; }
        }
        @media (prefers-reduced-motion: reduce) {
          .employee-experience-screen,
          .ee-subsection-content,
          .ee-bell,
          .e-btn.ee-board-actions__btn,
          .ee-notifications-drawer.e-sidebar,
          .ee-drawer-backdrop {
            transition: none !important;
            animation: none !important;
          }
          .ee-bell:hover,
          .e-btn.ee-board-actions__btn:hover {
            transform: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};
