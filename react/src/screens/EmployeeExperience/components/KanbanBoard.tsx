import React, { useEffect, useState } from 'react';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from '@syncfusion/ej2-react-kanban';
import { LoadingState } from '../../../components/states/LoadingState';
import { EmptyState } from '../../../components/states/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { getKanbanItems, moveKanbanItem } from '../../../services/employeeExperienceService';
import {
  KANBAN_LANES,
  PRIORITY_LABELS,
  SOURCE_TYPE_LABELS,
} from '../employeeExperienceConfig';
import type { KanbanItem, KanbanLane, KanbanSourceType } from '../../../types';

interface KanbanCardData {
  Id: string;
  Status: KanbanLane;
  Summary: string;
  Priority: string | undefined;
  Tags: string | undefined;
  AssigneeId: string | null | undefined;
  DueDate: string | null | undefined;
  Title: string;
  SourceType: string;
  SourceTypeLabel: string;
}

const toKanbanData = (items: KanbanItem[]): KanbanCardData[] =>
  items.map((it) => ({
    Id: it.id,
    Status: it.lane,
    Summary: it.title,
    Priority: it.priority ?? undefined,
    Tags: it.tags?.join(', '),
    AssigneeId: it.assigneeId,
    DueDate: it.dueDate,
    Title: it.title,
    SourceType: it.sourceType,
    SourceTypeLabel: SOURCE_TYPE_LABELS[it.sourceType as KanbanSourceType] ?? it.sourceType,
  }));

const PRIORITY_KEYS = ['low', 'medium', 'high', 'critical'] as const;
type PriorityKey = (typeof PRIORITY_KEYS)[number];

const priorityClass = (priority: string | undefined): PriorityKey | '' => {
  if (!priority) return '';
  const key = priority.toLowerCase();
  return (PRIORITY_KEYS as readonly string[]).includes(key) ? (key as PriorityKey) : '';
};

const tagList = (tags: string | undefined): string[] =>
  tags ? tags.split(', ').filter(Boolean) : [];

const formatDateShort = (value: string | null | undefined): string => {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const avatarInitials = (value: string | null | undefined): string =>
  value ? value.charAt(0).toUpperCase() : '?';

export const KanbanBoard: React.FC = () => {
  const [items, setItems] = useState<KanbanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getKanbanItems();
      setItems(data);
    } catch {
      setError('Failed to load Kanban board');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMove = async (id: string, lane: KanbanLane) => {
    try {
      const moved = await moveKanbanItem(id, lane);
      if (moved) {
        setItems((prev) => prev.map((it) => (it.id === id ? moved : it)));
      }
    } catch {
      setError('Failed to move Kanban card');
    }
  };

  const handleDragStop = (args: any) => {
    const first = args?.data?.[0];
    if (!first?.Id) return;
    const newLane = first.Status as KanbanLane;
    handleMove(first.Id, newLane);
  };

  if (isLoading) return <LoadingState height="220px" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (items.length === 0) {
    return (
      <EmptyState
        title="No triage items"
        description="Report an issue or raise a delay concern to start triage."
      />
    );
  }

  const cardTemplate = (props: KanbanCardData): React.ReactElement => {
    const pCls = priorityClass(props.Priority);
    const tags = tagList(props.Tags);
    const visibleTags = tags.slice(0, 3);
    const extraCount = tags.length - visibleTags.length;
    const cardClasses = ['ee-kb-card'];
    if (pCls) cardClasses.push(`ee-kb-card--${pCls}`);

    return (
      <div className={cardClasses.join(' ')}>
        {/* Header: priority pill (left aligned) */}
        <div className="ee-kb-card__header">
          {props.Priority ? (
            <span className={`priority-pill priority-pill--${pCls}`}>
              {PRIORITY_LABELS[props.Priority] ?? props.Priority}
            </span>
          ) : (
            <span />
          )}
        </div>

        {/* Title */}
        <div className="ee-kb-card__title" title={props.Summary}>
          {props.Summary}
        </div>

        {/* Tags (first 3, then +N more) */}
        {tags.length > 0 && (
          <div className="ee-kb-card__tags">
            {visibleTags.map((t) => (
              <span key={t} className="ee-kb-card__tag">{t}</span>
            ))}
            {extraCount > 0 && (
              <span className="ee-kb-card__tag ee-kb-card__tag--more">
                +{extraCount}
              </span>
            )}
          </div>
        )}

        {/* Footer: assignee + due date */}
        <div className="ee-kb-card__footer">
          <div className="ee-kb-card__meta ee-kb-card__meta--user">
            <span className="ee-kb-card__avatar" aria-hidden="true">
              {avatarInitials(props.AssigneeId)}
            </span>
            <span className="ee-kb-card__meta-text" title={props.AssigneeId ?? 'Unassigned'}>
              {props.AssigneeId ?? 'Unassigned'}
            </span>
          </div>
          {formatDateShort(props.DueDate) && (
            <div className="ee-kb-card__meta ee-kb-card__meta--date" title={formatDateShort(props.DueDate)}>
              <span className="ee-kb-card__meta-icon" aria-hidden="true">📅</span>
              <span className="ee-kb-card__meta-text">{formatDateShort(props.DueDate)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const data: any[] = toKanbanData(items);

  return (
    <>
      <KanbanComponent
        id="ee-kanban"
        dataSource={data}
        keyField="Status"
        cardSettings={{
          headerField: 'Id',
          contentField: 'Summary',
          template: cardTemplate,
        }}
        swimlaneSettings={{
          keyField: 'SourceType',
          textField: 'SourceTypeLabel',
          showField: 'SourceTypeLabel',
          allowDragAndDrop: true,
        }}
        dragStop={handleDragStop}
        width="100%"
      >
        <ColumnsDirective>
          {KANBAN_LANES.map((lane, index) => (
            <ColumnDirective
              key={index}
              keyField={lane.key}
              headerText={lane.label}
              showItemCount={true}
            />
          ))}
        </ColumnsDirective>
      </KanbanComponent>

      <style>{`
        /* --- Priority pill (mirrors Angular) --- */
        .priority-pill {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-size: var(--font-size-xxs);
          font-weight: var(--font-weight-semibold);
          text-transform: capitalize;
          line-height: 1.4;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }

        .priority-pill--critical {
          background-color: var(--color-sf-bg-error-primary);
          color: var(--color-sf-fg-error-primary);
          border: var(--border-1) solid var(--color-sf-border-error);
        }

        .priority-pill--high {
          background-color: var(--color-sf-bg-warning-primary);
          color: var(--color-sf-fg-warning-primary);
          border: var(--border-1) solid var(--color-sf-border-warning);
        }

        .priority-pill--medium {
          background-color: var(--color-sf-bg-brand-primary);
          color: var(--color-sf-fg-brand-primary);
          border: var(--border-1) solid var(--color-sf-border-brand);
        }

        .priority-pill--low {
          background-color: var(--color-sf-bg-success-primary);
          color: var(--color-sf-fg-success-primary);
          border: var(--border-1) solid var(--color-sf-border-success);
        }

        /* --- Kanban card (mirrors Angular .ee-kb-card*) --- */
        .ee-kb-card {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-8);
          padding: var(--spacing-12);
          background: var(--color-sf-bg-primary);
          border: var(--border-1) solid var(--color-sf-border-secondary);
          border-radius: var(--radius-8);
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
          min-height: 96px;
        }

        /* Left border indicator — color depends on priority */
        .ee-kb-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 3px;
          background: var(--color-sf-border-tertiary);
        }

        .ee-kb-card--critical::before { background: var(--color-sf-error-500); }
        .ee-kb-card--high::before     { background: var(--color-sf-warning-500); }
        .ee-kb-card--medium::before   { background: var(--color-sf-brand-500); }
        .ee-kb-card--low::before      { background: var(--color-sf-success-500); }

        .ee-kb-card__header {
          display: flex;
          align-items: center;
          justify-content: flex-start; /* priority pill aligned to the LEFT */
          gap: var(--spacing-8);
          min-height: 18px;
        }

        .ee-kb-card__id {
          font-size: var(--font-size-xxs);
          font-weight: var(--font-weight-medium);
          color: var(--color-sf-fg-quaternary);
          font-variant-numeric: tabular-nums;
        }

        .ee-kb-card__title {
          color: var(--color-sf-fg-primary);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          line-height: var(--line-height-sm);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ee-kb-card__tags {
          display: flex;
          gap: var(--spacing-4);
          flex-wrap: wrap;
        }

        .ee-kb-card__tag {
          display: inline-block;
          background: var(--color-sf-bg-secondary);
          color: var(--color-sf-fg-secondary);
          padding: 2px var(--spacing-8);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xxs);
          font-weight: var(--font-weight-medium);
          line-height: 1.4;
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ee-kb-card__tag--more {
          background: var(--color-sf-bg-tertiary);
          color: var(--color-sf-fg-tertiary);
        }

        .ee-kb-card__footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-8);
          padding-top: var(--spacing-8);
          border-top: var(--border-1) solid var(--color-sf-border-tertiary);
          margin-top: var(--spacing-2);
        }

        .ee-kb-card__meta {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-4);
          min-width: 0;
        }

        .ee-kb-card__meta--date {
          color: var(--color-sf-fg-tertiary);
        }

        .ee-kb-card__avatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: var(--radius-full);
          background: var(--color-sf-bg-brand-secondary);
          color: var(--color-sf-fg-brand-primary);
          font-size: var(--font-size-xxs);
          font-weight: var(--font-weight-semibold);
          flex-shrink: 0;
        }

        .ee-kb-card__meta-icon {
          font-size: var(--font-size-xs);
          line-height: 1;
        }

        .ee-kb-card__meta-text {
          font-size: var(--font-size-xxs);
          color: var(--color-sf-fg-tertiary);
          font-weight: var(--font-weight-medium);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 90px;
        }
      `}</style>
    </>
  );
};
