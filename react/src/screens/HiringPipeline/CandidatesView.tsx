import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GridComponent, ColumnsDirective as GridColumnsDirective, ColumnDirective as GridColumnDirective, Group, Sort, Filter, Page } from '@syncfusion/ej2-react-grids';
import { KanbanComponent, ColumnsDirective, ColumnDirective, Inject } from '@syncfusion/ej2-react-kanban';
import { ContextMenuComponent } from '@syncfusion/ej2-react-navigations';
import type { MenuItemModel } from '@syncfusion/ej2-react-navigations';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import {
  fetchApplicants,
  fetchApplicantCounts,
  moveApplicantStage,
  rejectApplicant,
  scheduleInterview,
  type ApplicantFilters,
} from '../../services/hiringPipelineService';
import type { Applicant, ApplicantCounts, ApplicantStatus } from '../../types';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { sampleSources } from './sampleCandidates';

type TabKey = 'all' | ApplicantStatus;
type ViewMode = 'list' | 'kanban';

const TABS: Array<{ key: TabKey; label: string }> = [
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

const KANBAN_COLUMNS: Array<{ id: ApplicantStatus; headerText: string }> = [
  { id: 'new', headerText: 'New' },
  { id: 'screening', headerText: 'Screening' },
  { id: 'interview', headerText: 'Interview' },
  { id: 'offer', headerText: 'Offer' },
  { id: 'hired', headerText: 'Hired' },
];

const formatRelativeDate = (iso: string): { line1: string; line2: string } => {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (sameDay) return { line1: 'Today', line2: time.toUpperCase() };
  if (isYesterday) return { line1: 'Yesterday', line2: time.toUpperCase() };

  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  let relative = '';
  if (diffDays < 7) relative = `${diffDays}D AGO`;
  else if (diffDays < 30) relative = `${Math.floor(diffDays / 7)}W AGO`;
  else if (diffDays < 365) relative = `${Math.floor(diffDays / 30)} MONTH AGO`;
  else relative = `${Math.floor(diffDays / 365)}Y AGO`;

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return { line1: `${dd}/${mm}/${yyyy}`, line2: relative };
};

export const CandidatesView: React.FC = () => {
  const [candidates, setCandidates] = useState<Applicant[]>([]);
  const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(100);
  const [counts, setCounts] = useState<ApplicantCounts>({
    all: 0, new: 0, screening: 0, interview: 0, offer: 0, hired: 0, rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);
  const [contextTarget, setContextTarget] = useState<Applicant | null>(null);
  const gridRef = useRef<GridComponent | null>(null);
  const contextMenuRef = useRef<ContextMenuComponent | null>(null);
  const bp = useBreakpoint();

  const isCompact = bp === 'xs' || bp === 'sm';
  const isMobile = bp === 'xs';
  const showLocation = bp === 'md' || bp === 'lg' || bp === 'xl';
  const showSource = bp !== 'xs';
  const effectiveViewMode: ViewMode = isMobile ? 'list' : viewMode;

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const filters: ApplicantFilters = {
          status: activeTab,
          page,
          pageSize: 124,
          sort: 'appliedAt:desc',
        };
        const result = await fetchApplicants(filters);
        setCandidates(result.items);
      } catch {
        setError('Failed to load candidates. Please try again.');
        setCandidates([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeTab, page]);

  // Tab badges come from the server, not from the current page.
  useEffect(() => {
    let cancelled = false;
    fetchApplicantCounts()
      .then((c) => { if (!cancelled) setCounts(c); })
      .catch(() => { if (!cancelled) setCounts((prev) => prev); });
    return () => { cancelled = true; };
  }, [candidates]);

  const filteredBySource = useMemo(() => {
    let result = candidates;
    if (sourceFilter) result = result.filter((c) => c.source === sourceFilter);
    if (activeTab !== 'all') result = result.filter((c) => c.status === activeTab);
    return result;
  }, [candidates, sourceFilter, activeTab]);

  const handleTabChange = (key: TabKey) => {
    setPage(1);
    setActiveTab(key);
  };

  // Kanban shows every stage as its own column, so a stage tab filter or a
  // source filter would hide cards the user can otherwise see. Switching view
  // mode therefore collapses both filters back to "All" / cleared.
  const handleViewModeChange = (mode: ViewMode) => {
    setPage(1);
    setActiveTab('all');
    setSourceFilter(null);
    setViewMode(mode);
  };

  const handleMenuSelect = async (item: MenuItemModel) => {
    if (!contextTarget) return;
    const target = contextTarget;
    const text = (item.text || '').toString();
    try {
      if (text === 'View Profile') {
        // No-op placeholder; real impl would open a detail drawer.
        return;
      }
      if (text === 'Move Stage') {
        const order: ApplicantStatus[] = ['new', 'screening', 'interview', 'offer', 'hired'];
        const idx = order.indexOf(target.status);
        const next = order[Math.min(idx + 1, order.length - 1)];
        if (next && next !== target.status) {
          await moveApplicantStage(target.id, next).catch(() => undefined);
          setCandidates((prev) => prev.map((c) => (c.id === target.id ? { ...c, status: next } : c)));
        }
        return;
      }
      if (text === 'Schedule Interview') {
        await scheduleInterview({
          applicationId: target.id,
          type: 'phone',
          scheduledStart: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          scheduledEnd: new Date(Date.now() + 25 * 3600 * 1000).toISOString(),
          interviewers: [],
        }).catch(() => undefined);
        return;
      }
      if (text === 'Send Message') {
        return;
      }
      if (text === 'Reject') {
        await rejectApplicant(target.id).catch(() => undefined);
        setCandidates((prev) => prev.map((c) => (c.id === target.id ? { ...c, status: 'rejected' } : c)));
        return;
      }
    } catch {
      setError('Action failed. Please try again.');
    }
  };

  const contextMenuItems: MenuItemModel[] = [
    { text: 'View Profile', iconCss: 'e-icons e-eye' },
    { text: 'Move Stage', iconCss: 'e-icons e-chevron-right' },
    { text: 'Schedule Interview', iconCss: 'e-icons e-calendar' },
    { text: 'Send Message', iconCss: 'e-icons e-edit' },
    { separator: true },
    { text: 'Reject', iconCss: 'e-icons e-close' },
  ];

  if (isLoading) return <LoadingState height="400px" />;
  if (error) return <ErrorState message={error} onRetry={() => setError(null)} />;

  const renderAvatar = (props: Applicant) => (
    <div className="candidate-cell">
      <div className={`avatar avatar-${(props.initials || '?').charAt(0).toLowerCase()}`}>
        <span>{props.initials || props.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
      </div>
      <div className="candidate-cell-text">
        <div className="candidate-name">{props.fullName}</div>
        <div className="candidate-email">{props.email}</div>
      </div>
    </div>
  );

  const renderPosition = (props: Applicant) => (
    <div className="position-cell">
      <div className="position-title">{props.position}</div>
      <div className="position-dept">{props.department.toUpperCase()}</div>
    </div>
  );

  const renderStatusPill = (props: Applicant) => (
    <span className={`status-pill status-${props.status}`}>
      <span className="status-dot" />
      {STATUS_LABEL[props.status]}
    </span>
  );

  const renderDate = (props: Applicant) => {
    const { line1, line2 } = formatRelativeDate(props.appliedAt);
    return (
      <div className="date-cell">
        <div className="date-line1">{line1}</div>
        <div className="date-line2">{line2}</div>
      </div>
    );
  };

  const renderListView = () => (
    <div className={`candidates-grid ${isCompact ? 'candidates-grid-compact' : ''}`}>
      <GridComponent
        ref={gridRef}
        dataSource={filteredBySource}
        allowPaging
        allowGrouping
        pageSettings={{ pageSize: 10}}
        allowSorting
        allowFiltering
        filterSettings={{ type: 'FilterBar' }}
        height={isCompact ? 'auto' : 480}
        locale="en-US"
        enableAdaptiveUI={isCompact}
        rowRenderingMode={isMobile ? 'Vertical' : 'Horizontal'}
        recordDoubleClick={(e: any) => {
          if (e?.rowData) setContextTarget(e.rowData as Applicant);
        }}
      >
        <GridColumnsDirective>
          <GridColumnDirective field="fullName" headerText="Full Name" width={isCompact ? 220 : 260} template={renderAvatar} />
          <GridColumnDirective field="position" headerText="Position" clipMode='EllipsisWithTooltip'  width={isCompact ? 160 : 220}  template={renderPosition} />
          <GridColumnDirective field="location" headerText="Location" width={140} visible={showLocation} />
          <GridColumnDirective field="status" headerText="Status" width={isCompact ? 100 : 120} template={renderStatusPill} />
          <GridColumnDirective field="source" headerText="Source" clipMode='EllipsisWithTooltip'  width={110} visible={showSource} />
          <GridColumnDirective field="appliedAt" headerText="Date" textAlign='Right' width={isCompact ? 110 : 130} template={renderDate} />
        </GridColumnsDirective>
        <Inject services={[Page, Group, Sort, Filter]} />
      </GridComponent>

      <ContextMenuComponent
        ref={contextMenuRef}
        items={contextMenuItems}
        select={(e: any) => handleMenuSelect(e.item as MenuItemModel)}
        onOpen={() => undefined}
      />
    </div>
  );

  const renderKanbanView = () => (
    <div className={`kanban-container ${isCompact ? 'kanban-container-scroll' : ''}`}>
      <KanbanComponent
        id="candidates-kanban"
        dataSource={filteredBySource}
        keyField="status"
        allowDragAndDrop
        cardSettings={{
          headerField: 'fullName',
          template: (props: Applicant) => (
            <div className={`candidate-card ${isCompact ? 'candidate-card-compact' : ''}`}>
              <div className="candidate-card-row">
                <div className={`avatar avatar-sm avatar-${(props.initials || '?').charAt(0).toLowerCase()}`}>
                  <span>{props.initials || props.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
                </div>
                <div className="candidate-card-text">
                  <div className="candidate-card-name">{props.fullName}</div>
                  <div className="candidate-card-position">{props.position}</div>
                </div>
              </div>
              <div className="candidate-card-footer">
                {renderStatusPill(props)}
                <span className="candidate-card-source">{props.source}</span>
              </div>
            </div>
          ),
        }}
        actionComplete={async (e: any) => {
          if (e.requestType === 'cardChanged' && e.data && e.data.length) {
            const card = e.data[0] as Applicant;
            try {
              await moveApplicantStage(card.id, card.status as ApplicantStatus);
              setCandidates((prev) => prev.map((c) => (c.id === card.id ? { ...c, status: card.status as ApplicantStatus } : c)));
            } catch {
              setError('Failed to update candidate stage. Please refresh.');
            }
          }
        }}
      >
        <ColumnsDirective>
          {KANBAN_COLUMNS.map((col) => (
            <ColumnDirective key={col.id} headerText={col.headerText} keyField={col.id} />
          ))}
        </ColumnsDirective>
        <Inject services={[]} />
      </KanbanComponent>
    </div>
  );

  return (
    <div className="candidates-view">
      <div className="candidates-header" role="region" aria-label="Candidate Pipeline Tabs">
        <div
          className={`status-tabs ${effectiveViewMode === 'kanban' ? 'status-tabs-disabled' : ''}`}
          role="tablist"
          aria-disabled={effectiveViewMode === 'kanban'}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const isDisabled = effectiveViewMode === 'kanban';
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                aria-disabled={isDisabled}
                disabled={isDisabled}
                title={isDisabled ? 'Stage filters are unavailable in Kanban view' : undefined}
                className={`status-tab ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                onClick={() => !isDisabled && handleTabChange(tab.key)}
              >
                <span className="status-tab-label">{tab.label}</span>
                <span className={`status-tab-count ${isActive ? 'active' : ''}`}>{counts[tab.key]}</span>
              </button>
            );
          })}
        </div>

        <div className="candidates-actions">
          {!isMobile && (
            <div className="view-toggle-inline" role="group" aria-label="View Mode">
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('list')}
                aria-pressed={viewMode === 'list'}
              >
                <span className="e-icons e-list-unordered" /> List
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('kanban')}
                aria-pressed={viewMode === 'kanban'}
              >
                <span className="e-icons e-columns" /> Kanban
              </button>
            </div>
          )}

          <DropDownListComponent
            id="filter-source"
            width={isCompact ? '100%' : 160}
            dataSource={sampleSources}
            fields={{ text: '', value: '' }}
            placeholder="Filters"
            sortOrder="Ascending"
            value={sourceFilter}
            change={(e: any) => setSourceFilter((e.value as string) || null)}
          />
        </div>
      </div>

      {filteredBySource.length === 0 ? (
        <EmptyState
          title="No candidates in this stage"
          description="Try switching tabs or clearing filters to see applicants."
        />
      ) : effectiveViewMode === 'list' ? (
        renderListView()
      ) : (
        renderKanbanView()
      )}

      <style>{`
        .candidates-view {
          animation: candidates-fade-in 0.3s ease-in;
        }

        @keyframes candidates-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .candidates-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin: 8px 0 16px;
        }

        .status-tabs {
          display: flex;
          gap: 4px;
          align-items: center;
          flex: 1 1 auto;
          min-width: 0;
        }

        .status-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 0;
          background: transparent;
          color: var(--color-sf-fg-secondary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 6px;
          white-space: nowrap;
          position: relative;
          transition: color 0.15s;
        }

        .status-tab:hover:not(.disabled) { color: var(--color-sf-fg-primary); }
        .status-tab.active { color: var(--color-sf-fg-primary); }
        .status-tab.disabled {
          cursor: not-allowed;
          opacity: 0.45;
          color: var(--color-sf-fg-quaternary);
        }
        .status-tab.disabled.active { color: var(--color-sf-fg-quaternary); }

        .status-tab-count {
          display: inline-block;
          min-width: 24px;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: 700;
          text-align: center;
          background: var(--color-sf-bg-tertiary);
          color: var(--color-sf-fg-secondary);
          border-radius: 4px;
        }
        .status-tab-count.active {
          background: var(--color-sf-brand-600);
          color: var(--color-sf-base-white);
        }

        .candidates-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .view-toggle-inline {
          display: inline-flex;
          background: var(--color-sf-bg-secondary);
          border: 1px solid var(--color-sf-border-secondary);
          border-radius: 8px;
          padding: 3px;
        }
        .view-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border: 0;
          background: transparent;
          color: var(--color-sf-fg-secondary);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 6px;
        }
        .view-toggle-btn.active {
          background: var(--color-sf-bg-primary);
          color: var(--color-sf-fg-primary);
          box-shadow: var(--shadow-default);
        }

        .candidates-grid {
          background: var(--color-sf-bg-secondary);
          
        }

        .candidate-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 0;
        }
        .candidate-cell-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .candidate-name { font-weight: 600; font-size: 14px; color: var(--color-sf-fg-primary); }
        .candidate-email { font-size: 12px; color: var(--color-sf-fg-quaternary); }

        .position-cell { display: flex; flex-direction: column; gap: 2px; }
        .position-title { font-weight: 600; font-size: 14px; color: var(--color-sf-fg-primary); }
        .position-dept { font-size: 10px; font-weight: 700; letter-spacing: 0.6px; color: var(--color-sf-fg-quaternary); }

        .date-cell { display: flex; flex-direction: column; gap: 2px; }
        .date-line1 { font-size: 13px; font-weight: 600; color: var(--color-sf-fg-primary); }
        .date-line2 { font-size: 10px; font-weight: 700; color: var(--color-sf-fg-quaternary); letter-spacing: 0.4px; }

        .row-action-btn {
          width: 32px;
          height: 32px;
          border: 0;
          background: transparent;
          color: var(--color-sf-fg-quaternary);
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .row-action-btn:hover { background: var(--color-sf-bg-tertiary); color: var(--color-sf-fg-primary); }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--color-sf-base-white);
          font-weight: 700;
          font-size: 13px;
          flex-shrink: 0;
          background: var(--color-sf-brand-600);
        }
        .avatar-sm { width: 32px; height: 32px; font-size: 11px; }
        .avatar-a { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
        .avatar-b { background: linear-gradient(135deg, #06b6d4, #3b82f6); }
        .avatar-c { background: linear-gradient(135deg, #f43f5e, #f97316); }
        .avatar-d { background: linear-gradient(135deg, #10b981, #14b8a6); }
        .avatar-e { background: linear-gradient(135deg, #f59e0b, #ef4444); }
        .avatar-f { background: linear-gradient(135deg, #8b5cf6, #ec4899); }
        .avatar-g { background: linear-gradient(135deg, #14b8a6, #06b6d4); }
        .avatar-h { background: linear-gradient(135deg, #ec4899, #f43f5e); }
        .avatar-i { background: linear-gradient(135deg, #3b82f6, #6366f1); }
        .avatar-j { background: linear-gradient(135deg, #f97316, #f59e0b); }
        .avatar-k { background: linear-gradient(135deg, #84cc16, #10b981); }
        .avatar-l { background: linear-gradient(135deg, #a855f7, #6366f1); }
        .avatar-m { background: linear-gradient(135deg, #ef4444, #f97316); }
        .avatar-n { background: linear-gradient(135deg, #0891b2, #6366f1); }
        .avatar-o { background: linear-gradient(135deg, #16a34a, #84cc16); }
        .avatar-p { background: linear-gradient(135deg, #db2777, #f43f5e); }
        .avatar-q { background: linear-gradient(135deg, #0ea5e9, #06b6d4); }
        .avatar-r { background: linear-gradient(135deg, #7c3aed, #a855f7); }
        .avatar-s { background: linear-gradient(135deg, #ea580c, #f59e0b); }
        .avatar-t { background: linear-gradient(135deg, #059669, #10b981); }
        .avatar-u { background: linear-gradient(135deg, #be185d, #db2777); }
        .avatar-v { background: linear-gradient(135deg, #4338ca, #7c3aed); }
        .avatar-w { background: linear-gradient(135deg, #0d9488, #0ea5e9); }
        .avatar-x { background: linear-gradient(135deg, #c2410c, #ea580c); }
        .avatar-y { background: linear-gradient(135deg, #65a30d, #84cc16); }
        .avatar-z { background: linear-gradient(135deg, #9333ea, #c026d3); }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
          line-height: 1.4;
          white-space: nowrap;
        }
        .status-pill .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }
        .status-pill.status-new {
          background: var(--color-sf-info-100);
          color: var(--color-sf-info-700);
        }
        .status-pill.status-screening {
          background: #ede9fe;
          color: #6d28d9;
        }
        .status-pill.status-interview {
          background: #ffe4e1;
          color: #b91c1c;
        }
        .status-pill.status-offer {
          background: var(--color-sf-success-100);
          color: var(--color-sf-success-700);
        }
        .status-pill.status-hired {
          background: #dcfce7;
          color: #166534;
        }
        .status-pill.status-rejected {
          background: #fce7f3;
          color: #be185d;
        }

        .candidate-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 12px;
          background: var(--color-sf-bg-primary);
          border: 1px solid var(--color-sf-border-secondary);
          border-radius: 8px;
          cursor: move;
          min-height: 120px;
        }
        .candidate-card:hover { border-color: var(--color-sf-brand-600); }
        .candidate-card-row { display: flex; align-items: center; gap: 10px; }
        .candidate-card-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .candidate-card-name { font-weight: 700; font-size: 13px; color: var(--color-sf-fg-primary); }
        .candidate-card-position { font-size: 11px; color: var(--color-sf-fg-quaternary); }
        .candidate-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .candidate-card-source { font-size: 11px; color: var(--color-sf-fg-quaternary); }

        .kanban-container { background: var(--color-sf-bg-secondary); border: 1px solid var(--color-sf-border-secondary); border-radius: 8px; padding: 8px; box-shadow: var(--shadow-default); }
        .kanban-container-scroll { overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; padding: 12px; }
        .kanban-container-scroll .e-kanban-content { display: inline-flex; flex-wrap: nowrap; min-width: max-content; }
        .kanban-container-scroll .e-kanban-column { flex: 0 0 240px; max-width: 240px; }

        @media (max-width: 480px) {
          .candidates-header { flex-direction: column; align-items: stretch; }
          .candidates-actions { width: 100%; }
          .candidates-grid-compact { border-radius: 6px; }
          .status-tab { padding: 6px 10px; font-size: 12px; }
          .status-tab-count { font-size: 10px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .candidates-view { animation: none; }
        }
      `}</style>
    </div>
  );
};
