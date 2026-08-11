import React, { useRef, useState } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Sort,
  Filter,
  Edit,
  Inject,
  CommandColumn,
  Toolbar
} from '@syncfusion/ej2-react-grids';
import type { CommandModel } from '@syncfusion/ej2-react-grids';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ButtonComponent, ChipDirective, ChipListComponent, ChipsDirective } from '@syncfusion/ej2-react-buttons';
import { useBreakpoint } from '../../../hooks/useBreakpoint';

interface Requisition {
  id: string;
  position: string;
  department: string;
  priority: 'Critical' | 'High' | 'Medium';
  candidates: number;
  stage: 'Interview' | 'Final Round' | 'Offer' | 'Screening' | 'Filled';
  timeOpen: string;
}

interface RequisitionGridProps {
  data: Requisition[];
  onView?: (req: Requisition) => void;
}

const priorityBadgeTemplate = (props: Requisition) => {
  const classMap: Record<Requisition['priority'], string> = {
    Critical: 'e-danger',
    High: 'e-warning',
    Medium: 'e-primary',
  };

  return (
    <ChipListComponent>
      <ChipsDirective>
        <ChipDirective text={props.priority} cssClass={classMap[props.priority]} />
      </ChipsDirective>
    </ChipListComponent>
  );
};

const departmentTemplate = (props: Requisition) => {
  return (
    <div className="mw-req-dept">
      <span className="mw-req-dept__avatar" aria-hidden="true">{props.department}</span>
    </div>
  );
};

const candidatesTemplate = (props: Requisition) => {
  const value = props.candidates ?? 0;
  const tone = value === 0 ? 'empty' : value < 5 ? 'low' : value < 15 ? 'mid' : 'high';
  return (
    <div className={`mw-req-candidates mw-req-candidates--${tone}`}>
      <span className="mw-req-candidates__icon" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </span>
      <span className="mw-req-candidates__value">{value}</span>
    </div>
  );
};

const stageTemplate = (props: Requisition) => {
  const stageClassMap: Record<Requisition['stage'], string> = {
    Screening: 'mw-req-stage--screening',
    Interview: 'mw-req-stage--interview',
    'Final Round': 'mw-req-stage--final',
    Offer: 'mw-req-stage--offer',
    Filled: 'mw-req-stage--filled',
  };
  return (
    <span className={`mw-req-stage ${stageClassMap[props.stage] ?? ''}`}>
      <span className="mw-req-stage__dot" aria-hidden="true" />
      {props.stage}
    </span>
  );
};

const timeOpenTemplate = (props: Requisition) => {
  return (
    <div className="mw-req-time">
      <span className="mw-req-time__icon" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </span>
      <span className="mw-req-time__value">{props.timeOpen}</span>
    </div>
  );
};

// Custom command column — a single "Details" button per row.
// The handler in `commandClick` identifies the command via
// `args.commandColumn.buttonOption.content`, so we don't need
// any DOM traversal in the click handler.
const detailsCommands: CommandModel[] = [
  {
    buttonOption: {
      content: 'Details',
      cssClass: 'e-flat mw-req-details-btn',
    },
  } as CommandModel,
];

export const RequisitionGrid: React.FC<RequisitionGridProps> = ({ data }) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Requisition | null>(null);
  const bp = useBreakpoint();

  // Hide the low-value "Time Open" column on small viewports to keep the grid readable.
  const showTimeOpen = bp === 'lg' || bp === 'xl';

  const editSettings: any = { allowEditing: true, allowAdding: true, allowDeleting: true, newRowPosition: 'Top' };

  const commandClick = (args: any) => {
    // `commandClick` fires for every command cell. Syncfusion tells us which
    // command was clicked via `args.commandColumn`, so we match by the
    // `buttonOption.content` we set in `detailsCommands`.
    if (
      args.commandColumn?.buttonOption?.content === 'Details' &&
      args.rowData
    ) {
      setSelectedRow(args.rowData as Requisition);
      setDialogVisible(true);
    }
  };

  const dialogClose = () => {
    setDialogVisible(false);
    setSelectedRow(null);
  };
  const toolbarOptions = ['Add', 'Edit', 'Delete', 'Update', 'Cancel'];

  // Custom toolbar: render icon-only buttons and dispatch to the grid's
  // built-in methods via `gridRef` so Add/Edit/Delete/Update/Cancel keep
  // working without the default text labels.
  const gridRef = useRef<GridComponent | null>(null);

  const dialogContent = selectedRow
    ? `<p><b>Position:</b> ${selectedRow.position}</p>
        <p><b>Department:</b> ${selectedRow.department}</p>
        <p><b>Priority:</b> ${selectedRow.priority}</p>
        <p><b>Candidates:</b> ${selectedRow.candidates}</p>
        <p><b>Stage:</b> ${selectedRow.stage}</p>
        <p><b>Time Open:</b> ${selectedRow.timeOpen}</p>`
    : '';

  return (
    <div className="mw-req-grid-wrapper" style={{ width: '100%' }}>
      <GridComponent
        ref={gridRef}
        dataSource={data}
        allowPaging={true}
        allowSorting={true}
        editSettings={editSettings}
        pageSettings={{ pageSize: 5, pageCount: 5 }}
        height="auto"
        gridLines="Horizontal"
        commandClick={commandClick}
        cssClass="mw-req-grid"
        toolbar={toolbarOptions}
        rowRenderingMode="Horizontal"
      >
        <ColumnsDirective>
          <ColumnDirective
            field="Id"
            headerText="Id"
            width="90"
            visible={false}
            textAlign="Left"
            isPrimaryKey={true}
          />
          <ColumnDirective
            field="position"
            headerText="Position"
            width="200"
            clipMode="EllipsisWithTooltip"
            textAlign="Left"
            validationRules={{ required: true }}
          />
          <ColumnDirective
            field="department"
            headerText="Department"
            width="170"
            textAlign="Left"
            template={(props: Requisition) => departmentTemplate(props)}
            validationRules={{ required: true }}
          />
          <ColumnDirective
            field="priority"
            headerText="Priority"
            width="110"
            template={(props: Requisition) => priorityBadgeTemplate(props)}
            validationRules={{ required: true }}
          />
          <ColumnDirective
            field="candidates"
            headerText="Candidates"
            width="120"
            textAlign="Right"
            template={(props: Requisition) => candidatesTemplate(props)}
            validationRules={{ required: true, number: true, min: 0 }}
          />
          <ColumnDirective
            field="stage"
            headerText="Stage"
            width="140"
            textAlign="Left"
            template={(props: Requisition) => stageTemplate(props)}
            validationRules={{ required: true }}
          />
          <ColumnDirective
            field="timeOpen"
            headerText="Time Open"
            width="120"
            textAlign="Left"
            visible={showTimeOpen}
            minWidth={110}
            template={(props: Requisition) => timeOpenTemplate(props)}
          />
          <ColumnDirective
            headerText="Details"
            width="130"
            textAlign="Center"
            commands={detailsCommands}
          />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Edit, Filter, CommandColumn, Toolbar]} />
      </GridComponent>

      <DialogComponent
        header="Row Information"
        width="400px"
        close={dialogClose}
        visible={dialogVisible}
        content={dialogContent}
        showCloseIcon={true}
        isModal={true}
      />

      <style>{`
        .mw-req-grid .e-headercell,
        .mw-req-grid .e-headercelldiv {
          background: #f8fafc !important;
          color: #475569 !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }

        .mw-req-grid .e-pager {
          border-top: 1px solid #f1f5f9 !important;
          padding: 8px !important;
        }

        .mw-req-grid .e-rowcell {
          vertical-align: middle !important;
        }

        /* ---- Department cell ---- */
        .mw-req-dept {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 28px;
        }
        .mw-req-dept__avatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          color: #4338ca;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3px;
          flex-shrink: 0;
        }
        .mw-req-dept__name {
          color: #0f172a;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ---- Candidates cell ---- */
        .mw-req-candidates {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px 3px 7px;
          border-radius: 999px;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        .mw-req-candidates__icon {
          display: inline-flex;
          align-items: center;
          opacity: 0.85;
        }
        .mw-req-candidates__value {
          font-size: 13px;
          font-weight: 700;
        }
        .mw-req-candidates--empty {
          background: #f1f5f9;
          color: #94a3b8;
        }
        .mw-req-candidates--low {
          background: #fef3c7;
          color: #92400e;
        }
        .mw-req-candidates--mid {
          background: #dbeafe;
          color: #1e40af;
        }
        .mw-req-candidates--high {
          background: #d1fae5;
          color: #065f46;
        }

        /* ---- Stage cell ---- */
        .mw-req-stage {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #334155;
        }
        .mw-req-stage__dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #94a3b8;
          flex-shrink: 0;
        }
        .mw-req-stage--screening .mw-req-stage__dot { background: #cbd5e1; }
        .mw-req-stage--interview .mw-req-stage__dot { background: #3b82f6; }
        .mw-req-stage--final .mw-req-stage__dot {
          background: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.18);
        }
        .mw-req-stage--offer .mw-req-stage__dot {
          background: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18);
        }
        .mw-req-stage--filled .mw-req-stage__dot {
          background: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
        }

        /* ---- Time open cell ---- */
        .mw-req-time {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #475569;
          font-size: 12px;
          font-weight: 500;
        }
        .mw-req-time__icon {
          display: inline-flex;
          align-items: center;
          color: #94a3b8;
        }
        .mw-req-time__value {
          font-variant-numeric: tabular-nums;
        }

        /* ---- Toolbar (icon-only) ---- */
        .mw-req-grid .e-toolbar .e-tbar-btn-text {
          display: none;
        }

        /* ---- Details button (rendered by the command column) ---- */
        .mw-req-grid .mw-req-details-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border: 1px solid #c7d2fe;
          background: #eef2ff;
          color: #4338ca;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: none;
          cursor: pointer;
          transition: background 120ms ease, border-color 120ms ease, transform 80ms ease;
        }
        .mw-req-grid .mw-req-details-btn:hover {
          background: #e0e7ff;
          border-color: #a5b4fc;
        }
        .mw-req-grid .mw-req-details-btn:active {
          transform: translateY(1px);
        }
        .mw-req-grid .mw-req-details-btn:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};
