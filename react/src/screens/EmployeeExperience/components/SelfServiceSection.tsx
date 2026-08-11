import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Calendar,
  Inbox,
  FileText,
  Paperclip,
} from 'lucide-react';
import { LoadingState } from '../../../components/states/LoadingState';
import { EmptyState } from '../../../components/states/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import {
  ButtonComponent,
  ChipDirective,
  ChipListComponent,
  ChipsDirective,
} from '@syncfusion/ej2-react-buttons';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Inject,
  Page,
  Sort,
  Filter,
} from '@syncfusion/ej2-react-grids';
import { getSelfServiceRequests } from '../../../services/employeeExperienceService';
import {
  SELF_SERVICE_STATUS_LABELS,
  PRIORITY_LABELS,
} from '../employeeExperienceConfig';
import type { SelfServiceRequest } from '../../../types';
import { SelfServiceRequestDialog } from './SelfServiceRequestDialog';

// Map each lifecycle status to a Syncfusion semantic `cssClass` and a dot
// color used as the chip's leading icon. Syncfusion's built-in `e-*` styles
// handle the bg/text surface, so the design tokens stay consistent with the
// rest of the app (see Overview / WorkforcePlanning chip usage).
const STATUS_CHIP: Record<string, { cssClass: string; dotColor: string }> = {
  submitted:    { cssClass: 'e-primary', dotColor: 'var(--color-sf-gray-500)' },
  'in-review':  { cssClass: 'e-info',    dotColor: 'var(--color-sf-cyan-600)' },
  'in-progress':{ cssClass: 'e-warning', dotColor: 'var(--color-sf-warning-600)' },
  resolved:     { cssClass: 'e-success', dotColor: 'var(--color-sf-success-600)' },
  rejected:     { cssClass: 'e-danger',  dotColor: 'var(--color-sf-error-600)' },
};

// Priority → Syncfusion semantic chip class. `null` is rendered as a muted
// em-dash to preserve the previous "no priority" affordance.
const PRIORITY_CHIP: Record<string, string> = {
  low:      'e-primary',
  medium:   'e-info',
  high:     'e-warning',
  critical: 'e-danger',
};

const TYPE_META: Record<string, { label: string; icon: React.ElementType }> = {
  'address-change': { label: 'Address Change', icon: FileText },
  benefits:         { label: 'Benefits',       icon: FileText },
  payroll:          { label: 'Payroll',        icon: FileText },
  equipment:        { label: 'Equipment',      icon: Paperclip },
  'leave-request':  { label: 'Leave Request',  icon: Calendar },
  other:            { label: 'Other',          icon: FileText },
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const formatRelative = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.floor((now - d) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

export const SelfServiceSection: React.FC = () => {
  const [requests, setRequests] = useState<SelfServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSelfServiceRequests();
      setRequests(data);
    } catch {
      setError('Failed to load self-service requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const open = requests.filter((r) => r.status !== 'resolved' && r.status !== 'rejected').length;
    const inReview = requests.filter((r) => r.status === 'in-review' || r.status === 'in-progress').length;
    const resolved = requests.filter((r) => r.status === 'resolved').length;
    return { total: requests.length, open, inReview, resolved };
  }, [requests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) =>
      [r.subject, r.details, r.assignedTo ?? '', TYPE_META[r.type]?.label ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [requests, query]);

  if (isLoading) return <LoadingState height="320px" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (requests.length === 0 && !showForm) {
    return (
      <EmptyState
        title="No self-service requests yet"
        description="Submit a request for address changes, benefits, payroll, equipment, or leave."
        actionLabel="Submit a Request"
        onAction={() => setShowForm(true)}
      />
    );
  }

  return (
    <div className="ss-shell">
      {/* Hero / heading row */}
      <div className="ss-header">
        <div className="ss-header__title">
          <h3 className="ss-title">My Requests</h3>
          <p className="ss-subtitle">
            Track the status of HR, payroll, benefits, and equipment requests you&apos;ve submitted.
          </p>
        </div>
        <div className="ss-header__actions">
          <div className="ss-search">
            <Search size={16} strokeWidth={1.75} aria-hidden="true" />
            <TextBoxComponent
              id="ss-search"
              placeholder="Search requests…"
              value={query}
              change={(e: any) => setQuery((e.value as string) ?? '')}
              floatLabelType="Never"
              showClearButton={true}
            />
          </div>
          <ButtonComponent
            cssClass="e-primary ss-cta"
            onClick={() => setShowForm(true)}
            iconCss="e-icons e-plus"
            iconPosition="Left"
          >
            New Request
          </ButtonComponent>
        </div>
      </div>

      {/* Quick stats row — Syncfusion Card component (e-card). Label and
          value sit together inside `e-card-content` so the previous
          stacked visual (label on top, value directly below) is preserved
          with no header divider. */}
      <div className="ss-stats" role="list">
        <div className="e-card ss-stat" role="listitem">
          <div className="e-card-content">
            <span className="ss-stat__label">Total</span>
            <span className="ss-stat__value">{stats.total}</span>
          </div>
        </div>
        <div className="e-card ss-stat" role="listitem">
          <div className="e-card-content">
            <span className="ss-stat__label">Open</span>
            <span className="ss-stat__value">{stats.open}</span>
          </div>
        </div>
        <div className="e-card ss-stat" role="listitem">
          <div className="e-card-content">
            <span className="ss-stat__label">In&nbsp;Review / In&nbsp;Progress</span>
            <span className="ss-stat__value">{stats.inReview}</span>
          </div>
        </div>
        <div className="e-card ss-stat" role="listitem">
          <div className="e-card-content">
            <span className="ss-stat__label">Resolved</span>
            <span className="ss-stat__value">{stats.resolved}</span>
          </div>
        </div>
      </div>

      {/* Premium table view */}
      {filtered.length === 0 ? (
        <div className="e-card ss-no-results">
          <div className="e-card-content ss-no-results__body">
            <Inbox size={28} strokeWidth={1.5} />
            <div>
              <strong>No requests match &ldquo;{query}&rdquo;</strong>
              <p>Try a different keyword or clear the search.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="ss-table-wrap" role="region" aria-label="My requests">
          <GridComponent
            id="ss-requests-grid"
            dataSource={filtered as any[]}
            cssClass="e-grid ss-grid"
            allowPaging={true}
            allowSorting={true}
            allowFiltering={true}
            filterSettings={{ type: 'FilterBar' }}
            pageSettings={{ pageSize: 10, pageSizes: [5, 10, 20, 30] }}
            gridLines="Both"
          >
            <Inject services={[Page, Sort, Filter]} />
            <ColumnsDirective>
              <ColumnDirective
                field="subject"
                headerText="Request"
                width="350"
                template={(props: SelfServiceRequest) => {
                  const typeMeta = TYPE_META[props.type] ?? TYPE_META.other;
                  const TypeIcon = typeMeta.icon;
                  return (
                    <div className="ss-subject">
                      <div className="ss-subject__icon" aria-hidden="true">
                        <TypeIcon size={16} strokeWidth={1.75} />
                      </div>
                      <div className="ss-subject__body">
                        <div className="ss-subject__title" title={props.subject}>{props.subject}</div>
                        <div className="ss-subject__details" title={props.details}>
                          {props.details}
                        </div>
                        {props.attachments && props.attachments.length > 0 && (
                          <div className="ss-subject__meta">
                            <Paperclip size={12} strokeWidth={2} />
                            <span>{props.attachments.length} attachment{props.attachments.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
              <ColumnDirective
                field="type"
                headerText="Type"
                width="200"
                template={(props: SelfServiceRequest) => {
                  const typeMeta = TYPE_META[props.type] ?? TYPE_META.other;
                  return <ChipListComponent cssClass="ss-status-chip">
                      <ChipsDirective>
                        <ChipDirective
                          text={typeMeta.label}
                        />
                      </ChipsDirective>
                    </ChipListComponent>;
                }}
              />
              <ColumnDirective
                field="status"
                headerText="Status"
                width="170"
                template={(props: SelfServiceRequest) => {
                  const chip = STATUS_CHIP[props.status] ?? STATUS_CHIP.submitted;
                  return (
                    <ChipListComponent cssClass="ss-status-chip">
                      <ChipsDirective>
                        <ChipDirective
                          text={SELF_SERVICE_STATUS_LABELS[props.status] ?? props.status}
                          cssClass={`${chip.cssClass} ss-status-${props.status}`}
                        />
                      </ChipsDirective>
                    </ChipListComponent>
                  );
                }}
              />
              <ColumnDirective
                field="priority"
                headerText="Priority"
                width="140"
                template={(props: SelfServiceRequest) => {
                  if (!props.priority) return <span className="ss-muted">—</span>;
                  const cssClass = PRIORITY_CHIP[props.priority] ?? 'e-primary';
                  return (
                    <ChipListComponent cssClass="ss-priority-chip">
                      <ChipsDirective>
                        <ChipDirective
                          text={PRIORITY_LABELS[props.priority] ?? props.priority}
                          cssClass={cssClass}
                        />
                      </ChipsDirective>
                    </ChipListComponent>
                  );
                }}
              />
              <ColumnDirective
                field="createdAt"
                headerText="Submitted"
                width="160"
                textAlign="Right"
                template={(props: SelfServiceRequest) => (
                  <div className="ss-date">
                    <span className="ss-date__primary">{formatDate(props.createdAt)}</span>
                    <span className="ss-date__secondary">
                      {props.updatedAt && props.updatedAt !== props.createdAt
                        ? `Updated ${formatRelative(props.updatedAt)}`
                        : formatRelative(props.createdAt)}
                    </span>
                  </div>
                )}
              />
            </ColumnsDirective>
          </GridComponent>
        </div>
      )}

      <SelfServiceRequestDialog
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmitted={load}
      />

      <style>{`
        /* =========================================================================
           Self-Service — modern SaaS table view
           Strict 8px spacing grid. Soft micro-shadows. Hairline borders. Inter.
           ========================================================================= */
        .ss-shell {
          display: flex;
          flex-direction: column;
          gap: 24px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* ---- Header ---------------------------------------------------------- */
        .ss-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }
        .ss-header__title { min-width: 0; }
        .ss-title {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--color-sf-fg-primary);
          line-height: 1.3;
        }
        .ss-subtitle {
          margin: 6px 0 0;
          font-size: 13px;
          color: var(--color-sf-fg-tertiary);
          max-width: 56ch;
        }
        .ss-header__actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        /* ---- Search ---------------------------------------------------------- */
        .ss-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          height: 36px;
          background: var(--color-sf-bg-primary);
          border: 1px solid var(--color-sf-hairline);
          border-radius: 8px;
          width: 260px;
          color: var(--color-sf-fg-tertiary);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .ss-search:focus-within {
          border-color: var(--color-sf-border-brand);
          box-shadow: 0 0 0 3px rgba(var(--color-sf-brand-600-rgb), 0.12);
        }
        .ss-search .e-input,
        .ss-search .e-input-group,
        .ss-search .e-input-in-wrap,
        .ss-search .e-clear-icon {
          background: transparent !important;
          box-shadow: none !important;
          border: 0 !important;
        }
        .ss-search .e-input {
          padding: 0 !important;
          font-size: 13px;
        }
        .ss-search .e-input-group {
          width: 100%;
        }

        /* ---- CTA ------------------------------------------------------------- */
        .ss-cta,
        .e-btn.ss-cta {
          height: 36px;
          padding: 0 16px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          border-radius: 8px !important;
          display: inline-flex !important;
          align-items: center;
          gap: 6px;
        }

        /* ---- Quick stats ----------------------------------------------------- */
        .ss-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 720px) {
          .ss-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        /* Syncfusion Card surface — keep our brand colors + soft shadow,
           but drop the per-card padding (e-card-content provides it). */
        .ss-stat.e-card {
          background: var(--color-sf-bg-primary);
          border: 1px solid var(--color-sf-hairline);
          border-radius: 12px;
          box-shadow: var(--shadow-card);
          transition: box-shadow 0.2s ease, transform 0.2s ease;
          overflow: hidden;
        }
        .ss-stat.e-card:hover {
          box-shadow: var(--shadow-card-hover);
        }
        .ss-stat.e-card .e-card-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 16px 20px;
        }
        .ss-stat__label {
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-sf-fg-quaternary);
          display: block;
        }
        .ss-stat__value {
          font-size: 26px;
          font-weight: 600;
          color: var(--color-sf-fg-primary);
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
          line-height: 1.1;
          display: block;
        }

        /* ---- Table ----------------------------------------------------------- */
        .ss-table-wrap {
          background: var(--color-sf-bg-primary);
          border: 1px solid var(--color-sf-hairline);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-card);
        }
        .ss-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 13px;
        }
        .ss-th {
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-sf-fg-quaternary);
          padding: 14px 20px;
          background: var(--color-sf-bg-secondary-subtle);
          border-bottom: 1px solid var(--color-sf-hairline);
          white-space: nowrap;
        }
        .ss-th--subject { padding-left: 24px; }
        .ss-th--date { text-align: right; padding-right: 24px; }

        .ss-row { transition: background-color 0.12s ease; }
        .ss-row + .ss-row .ss-td { border-top: 1px solid var(--color-sf-hairline); }
        .ss-row:hover { background: var(--color-sf-bg-secondary-subtle); }
        .ss-td {
          padding: 16px 20px;
          vertical-align: middle;
          color: var(--color-sf-fg-secondary);
        }
        .ss-td--subject { padding-left: 24px; }
        .ss-td--date {
          text-align: right;
          padding-right: 24px;
          white-space: nowrap;
        }

        /* ---- Syncfusion Grid overrides (preserves the table look) ------------- */
        .ss-grid.e-grid {
          border: 0;
          background: transparent;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .ss-grid.e-grid .e-gridheader {
          background: var(--color-sf-bg-secondary-subtle);
          border-bottom: 1px solid var(--color-sf-hairline);
        }
        .ss-grid.e-grid .e-headercell {
          background: var(--color-sf-bg-secondary-subtle);
          color: var(--color-sf-fg-quaternary);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border: 0;
        }
        .ss-grid.e-grid .e-headercell .e-headertext {
          font-weight: 600;
        }
        .ss-grid.e-grid .e-row {
          transition: background-color 0.12s ease;
        }
        .ss-grid.e-grid .e-row:hover .e-rowcell {
          background: var(--color-sf-bg-secondary-subtle);
        }
        .ss-grid.e-grid .e-rowcell {
          color: var(--color-sf-fg-secondary);
          font-size: 13px;
          border-bottom: 1px solid var(--color-sf-hairline);
          border-top: 0;
          border-left: 0;
          border-right: 0;
          padding: 16px 20px;
          vertical-align: middle;
          background: var(--color-sf-bg-primary);
        }
        .ss-grid.e-grid .e-rowcell:first-child { padding-left: 24px; }
        .ss-grid.e-grid .e-rowcell:last-child { padding-right: 24px; text-align: right; white-space: normal; }
        .ss-grid.e-grid .e-pager {
          background: var(--color-sf-bg-primary);
          border-top: 1px solid var(--color-sf-hairline);
          color: var(--color-sf-fg-tertiary);
          font-size: 12px;
        }
        .ss-grid.e-grid .e-pager .e-currentitem,
        .ss-grid.e-grid .e-pager .e-pagercontainer .e-numericitem {
          border-radius: 6px;
        }
        .ss-grid.e-grid .e-filterbar .e-input,
        .ss-grid.e-grid .e-filterbar .e-input-group input {
          font-size: 12px;
        }
        .ss-grid.e-grid .e-toolbar .e-btn {
          font-size: 12px;
        }

        .ss-subject {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          min-width: 280px;
        }
        .ss-subject__icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--color-sf-bg-brand-primary);
          color: var(--color-sf-fg-brand-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ss-subject__body { min-width: 0; }
        .ss-subject__title {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-sf-fg-primary);
          letter-spacing: -0.005em;
          line-height: 1.35;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .ss-subject__details {
          margin-top: 4px;
          font-size: 12.5px;
          color: var(--color-sf-fg-tertiary);
          line-height: 1.45;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .ss-subject__meta {
          margin-top: 6px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          color: var(--color-sf-fg-quaternary);
        }

        .ss-type-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 999px;
          background: var(--color-sf-bg-secondary);
          color: var(--color-sf-fg-secondary);
          font-size: 12px;
          font-weight: 500;
          border: 1px solid var(--color-sf-hairline);
        }

        /* ---- Status & Priority chips (Syncfusion ChipListComponent) ----------- */
        .ss-grid.e-grid .ss-status-chip.e-chip-list,
        .ss-grid.e-grid .ss-priority-chip.e-chip-list {
          display: inline-flex;
          align-items: center;
          height: 24px;
          padding: 0;
          background: transparent;
          border: 0;
        }
        .ss-grid.e-grid .ss-status-chip.e-chip-list .e-chip,
        .ss-grid.e-grid .ss-priority-chip.e-chip-list .e-chip {
          height: 24px;
          padding: 0 10px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.005em;
          white-space: nowrap;
        }
        .ss-grid.e-grid .ss-status-chip.e-chip-list .e-chip .e-chip-text {
          font-weight: 600;
        }
        .ss-grid.e-grid .ss-status-chip.e-chip-list .e-icon {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background-image: none;
          margin: 0 6px 0 0;
        }
        .ss-grid.e-grid .ss-status-chip.e-chip-list .e-icon.e-ss-status-chip__dot { background-color: var(--color-sf-gray-500); }
        .ss-grid.e-grid .ss-status-chip.e-chip-list .ss-status-submitted     .e-icon.e-ss-status-chip__dot { background-color: var(--color-sf-gray-500); }
        .ss-grid.e-grid .ss-status-chip.e-chip-list .ss-status-in-review     .e-icon.e-ss-status-chip__dot { background-color: var(--color-sf-cyan-600); }
        .ss-grid.e-grid .ss-status-chip.e-chip-list .ss-status-in-progress   .e-icon.e-ss-status-chip__dot { background-color: var(--color-sf-warning-600); }
        .ss-grid.e-grid .ss-status-chip.e-chip-list .ss-status-resolved      .e-icon.e-ss-status-chip__dot { background-color: var(--color-sf-success-600); }
        .ss-grid.e-grid .ss-status-chip.e-chip-list .ss-status-rejected      .e-icon.e-ss-status-chip__dot { background-color: var(--color-sf-error-600); }

        .ss-assignee {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          max-width: 100%;
        }
        .ss-avatar {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          background: var(--color-sf-bg-brand-primary);
          color: var(--color-sf-fg-brand-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
          flex-shrink: 0;
          border: 1px solid var(--color-sf-utility-avatar-border-color);
        }
        .ss-assignee__name {
          font-size: 12.5px;
          color: var(--color-sf-fg-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
        }
        .ss-unassigned {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--color-sf-fg-quaternary);
        }

        .ss-date { display: inline-flex; flex-direction: column; align-items: flex-end; line-height: 1.3; }
        .ss-date__primary {
          font-size: 12.5px;
          color: var(--color-sf-fg-secondary);
          font-weight: 500;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        .ss-date__secondary {
          font-size: 11.5px;
          color: var(--color-sf-fg-quaternary);
          margin-top: 2px;
          white-space: nowrap;
        }

        .ss-muted { color: var(--color-sf-fg-quaternary); font-size: 12.5px; }

        /* Syncfusion Card surface for the empty-state; no header needed here. */
        .ss-no-results.e-card {
          background: var(--color-sf-bg-primary);
          border: 1px dashed var(--color-sf-hairline);
          border-radius: 12px;
          color: var(--color-sf-fg-tertiary);
        }
        .ss-no-results.e-card .e-card-content,
        .ss-no-results__body {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 28px 24px;
        }
        .ss-no-results strong { color: var(--color-sf-fg-primary); font-size: 14px; }
        .ss-no-results p { margin: 4px 0 0; font-size: 12.5px; color: var(--color-sf-fg-tertiary); }

        @media (max-width: 880px) {
          .ss-table-wrap { overflow-x: auto; }
          .ss-table { min-width: 760px; }
          .ss-grid.e-grid { min-width: 760px; }
        }
        @media (max-width: 640px) {
          .ss-header__actions { width: 100%; }
          .ss-search { flex: 1; width: auto; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ss-row,
          .ss-stat,
          .ss-search,
          .ss-grid.e-grid .e-row {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};
