import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DiagramComponent,
  Inject,
  MindMap,
  DataBinding,
  DiagramTools,
} from '@syncfusion/ej2-react-diagrams';
import { DataManager } from '@syncfusion/ej2-data';
import type { NodeModel, ConnectorModel, LayoutModel } from '@syncfusion/ej2-react-diagrams';
import type { Applicant } from '../../types';
import { LoadingState } from '../../components/states/LoadingState';

// ---------------------------------------------------------------------------
// Data shape
// ---------------------------------------------------------------------------

// Each entry is a flat record with an `id` and (optionally) a `parentId`.
// Syncfusion's DataBinding module turns this into a tree at render time.
interface MindMapDatum {
  id: string;
  parentId?: string;
  // Display / branching metadata consumed inside getNodeDefaults.
  label: string;
  kind: 'root' | 'department' | 'role';
  count: number;
  // For styling inside getNodeDefaults.
  fill: string;
  // Top-N marker so the role can render an "active candidates" badge in the
  // node annotation without re-doing the aggregation at render time.
  activeCount: number;
  totalCount: number;
}

// ---------------------------------------------------------------------------
// Color tokens — keep the palette brand-aligned but distinct enough that each
// department is recognizable at a glance. Root and role nodes use the brand
// surface and a per-department accent respectively.
// ---------------------------------------------------------------------------

const ROOT_FILL = '#1F2A44'; // deep navy — anchors the eye
const ROOT_STROKE = '#0F172A';

const DEPARTMENT_FILLS: Record<string, string> = {
  Engineering: '#3B82F6', // blue
  Product: '#8B5CF6', // violet
  Design: '#EC4899', // pink
  Data: '#14B8A6', // teal
  Marketing: '#F59E0B', // amber
  Sales: '#EF4444', // red
  'Customer Success': '#10B981', // emerald
  People: '#6366F1', // indigo
  Finance: '#0EA5E9', // sky
  Operations: '#64748B', // slate
  Security: '#DC2626', // dark red
  Platform: '#0D9488', // dark teal
};

const DEFAULT_DEPARTMENT_FILL = '#475569'; // slate-600

const ROLE_FILL = '#F8FAFC'; // near-white surface
const ROLE_STROKE = '#CBD5E1'; // slate-300
const ROLE_TEXT = '#0F172A';

const ACTIVE_STATUSES: ReadonlyArray<Applicant['status']> = [
  'new',
  'screening',
  'interview',
  'offer',
];

// Roles shown per department — enough to give the recruiter situational
// awareness, not so many that the mind map becomes a wall of text.
const ROLES_PER_DEPARTMENT = 3;
// Departments shown at the top level — same rationale.
const DEPARTMENTS_LIMIT = 5;

// Uniform node dimensions for the whole mind map. The longest role name in
// the seed data ("Business Operations Analyst", ~26 chars) plus the count
// line wraps comfortably inside 180px at fontSize 11.
const NODE_WIDTH = 180;
const NODE_HEIGHT = 56;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isActive = (status: Applicant['status']): boolean =>
  ACTIVE_STATUSES.includes(status);

const formatCount = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
};

// Build the flat MindMapDatum[] from the candidates array.
// Root (id: "root") → top departments → top roles per department.
const buildMindMapData = (applicants: Applicant[]): MindMapDatum[] => {
  const data: MindMapDatum[] = [];
  const total = applicants.length;
  const active = applicants.filter((a) => isActive(a.status)).length;

  data.push({
    id: 'root',
    label: 'Active Pipeline',
    kind: 'root',
    count: total,
    activeCount: active,
    totalCount: total,
    fill: ROOT_FILL,
  });

  if (total === 0) return data;

  // Aggregate by department.
  const byDept = new Map<
    string,
    { total: number; active: number; roles: Map<string, { total: number; active: number }> }
  >();
  for (const a of applicants) {
    const deptBucket = byDept.get(a.department) ?? { total: 0, active: 0, roles: new Map() };
    deptBucket.total += 1;
    if (isActive(a.status)) deptBucket.active += 1;
    const roleBucket = deptBucket.roles.get(a.position) ?? { total: 0, active: 0 };
    roleBucket.total += 1;
    if (isActive(a.status)) roleBucket.active += 1;
    deptBucket.roles.set(a.position, roleBucket);
    byDept.set(a.department, deptBucket);
  }

  // Sort departments by active count (then total) so the most "alive" pipelines
  // are closest to the root.
  const departments = Array.from(byDept.entries())
    .sort((a, b) => b[1].active - a[1].active || b[1].total - a[1].total)
    .slice(0, DEPARTMENTS_LIMIT);

  for (const [deptName, deptAgg] of departments) {
    const deptId = `dept-${deptName.replace(/\s+/g, '-').toLowerCase()}`;
    data.push({
      id: deptId,
      parentId: 'root',
      label: deptName,
      kind: 'department',
      count: deptAgg.total,
      activeCount: deptAgg.active,
      totalCount: deptAgg.total,
      fill: DEPARTMENT_FILLS[deptName] ?? DEFAULT_DEPARTMENT_FILL,
    });

    const roles = Array.from(deptAgg.roles.entries())
      .sort((a, b) => b[1].active - a[1].active || b[1].total - a[1].total)
      .slice(0, ROLES_PER_DEPARTMENT);

    for (const [roleName, roleAgg] of roles) {
      const roleId = `role-${deptName}-${roleName}`
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '_')
        .toLowerCase();
      data.push({
        id: roleId,
        parentId: deptId,
        label: roleName,
        kind: 'role',
        count: roleAgg.total,
        activeCount: roleAgg.active,
        totalCount: roleAgg.total,
        fill: ROLE_FILL,
      });
    }
  }

  return data;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CandidatesMindMapProps {
  candidates: Applicant[];
  isLoading?: boolean;
}

/**
 * A mind map that complements the candidate list/grid by showing the *shape*
 * of the pipeline: which departments and roles are attracting the most
 * active candidates, instead of forcing the recruiter to count rows.
 *
 * Root: "Active Pipeline" (with active / total count)
 * Branches: top departments by active-candidate count
 * Sub-branches: top roles inside each department
 */
export const CandidatesMindMap: React.FC<CandidatesMindMapProps> = ({
  candidates,
  isLoading = false,
}) => {
  const diagramRef = useRef<DiagramComponent | null>(null);
  const [ready, setReady] = useState(false);

  const data = useMemo(() => buildMindMapData(candidates), [candidates]);
  // The diagrams package has its own bundled ej2-data whose DataManager
  // type does not structurally match the top-level one. `as any` here is
  // the supported pattern: the runtime contract is identical.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataManager = useMemo<any>(
    () =>
      new DataManager(
        data.map((d) => ({ ...d })) as unknown as Record<string, unknown>[],
      ),
    [data],
  );

  // The mind map widget is heavy and we don't want to fight Syncfusion's
  // internal render lifecycle (see the kanban insertBefore gotcha in memory).
  // We mount it once and refresh only the data manager when candidates change,
  // forcing the layout to re-run.
  useEffect(() => {
    if (!ready) return;
    const inst = diagramRef.current;
    if (!inst) return;
    inst.dataBind();
  }, [dataManager, ready]);

  if (isLoading) {
    return <LoadingState height="360px" />;
  }

  // Node defaults — applied to every node Syncfusion creates from the
  // DataManager. We branch on `kind` to give each level a distinct visual.
  const getNodeDefaults = (node: NodeModel) => {
    const datum = node.data as MindMapDatum | undefined;
    if (!datum) {
      node.width = 120;
      node.height = 40;
      return node;
    }

    if (datum.kind === 'root') {
      node.width = NODE_WIDTH;
      node.height = NODE_HEIGHT;
      node.style = {
        fill: datum.fill,
        strokeColor: ROOT_STROKE,
        strokeWidth: 2,
      };
      node.annotations = [
        {
          content: `${datum.label}\n${formatCount(datum.activeCount)} active · ${formatCount(datum.totalCount)} total`,
          style: {
            color: '#F8FAFC',
            fontSize: 12,
            fontFamily: 'inherit',
            bold: true,
            textWrapping: 'Wrap',
            textAlign: 'Center',
          },
        },
      ];
      return node;
    }

    if (datum.kind === 'department') {
      node.width = NODE_WIDTH;
      node.height = NODE_HEIGHT;
      node.style = {
        fill: datum.fill,
        strokeColor: '#0F172A',
        strokeWidth: 1,
      };
      node.annotations = [
        {
          content: `${datum.label}\n${formatCount(datum.activeCount)}/${formatCount(datum.totalCount)}`,
          style: {
            color: '#F8FAFC',
            fontSize: 11,
            fontFamily: 'inherit',
            bold: true,
            textWrapping: 'Wrap',
            textAlign: 'Center',
          },
        },
      ];
      return node;
    }

    // role
    node.width = NODE_WIDTH;
    node.height = NODE_HEIGHT;
    node.style = {
      fill: datum.fill,
      strokeColor: ROLE_STROKE,
      strokeWidth: 1,
      strokeDashArray: datum.activeCount === 0 ? '3 2' : '',
    };
    const roleLine2 =
      datum.activeCount === datum.totalCount
        ? `${formatCount(datum.totalCount)} active`
        : `${formatCount(datum.activeCount)} active · ${formatCount(datum.totalCount)} total`;
    node.annotations = [
      {
        content: `${datum.label}\n${roleLine2}`,
        style: {
          color: ROLE_TEXT,
          fontSize: 11,
          fontFamily: 'inherit',
          textWrapping: 'Wrap',
          textAlign: 'Center',
        },
      },
    ];
    return node;
  };

  const getConnectorDefaults = (connector: ConnectorModel) => {
    connector.type = 'Bezier';
    connector.style = {
      strokeColor: '#94A3B8',
      strokeWidth: 1.25,
    };
    (connector.targetDecorator as { shape: string }).shape = 'None';
    return connector;
  };

  const layoutSettings: LayoutModel = {
    type: 'MindMap',
    orientation: 'Horizontal',
    // Push branches slightly further out so department labels don't crowd the
    // root.
    horizontalSpacing: 60,
    // Slightly tighter vertical spread keeps the diagram dense on small screens.
    verticalSpacing: 24,
    getBranch: (node: NodeModel) => {
      const datum = node.data as MindMapDatum | undefined;
      if (!datum) return 'Right';
      if (datum.kind === 'root') return 'Root';
      // Alternate Left/Right based on the department's index parity so the
      // mind map has visual balance regardless of how many departments show.
      const id = datum.id;
      const hash = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      return hash % 2 === 0 ? 'Left' : 'Right';
    },
  };

  return (
    <div className="candidates-mindmap">
      <div className="candidates-mindmap-header">
        <div>
          <h3 className="candidates-mindmap-title">Pipeline Distribution</h3>
          <p className="candidates-mindmap-subtitle">
            Where active candidates concentrate by department and role
          </p>
        </div>
        <div className="candidates-mindmap-legend" aria-hidden="true">
          <span className="mindmap-legend-item">
            <span className="mindmap-swatch" style={{ background: ROOT_FILL }} />
            Total
          </span>
          <span className="mindmap-legend-item">
            <span
              className="mindmap-swatch"
              style={{ background: DEPARTMENT_FILLS.Engineering }}
            />
            Department
          </span>
          <span className="mindmap-legend-item">
            <span
              className="mindmap-swatch"
              style={{
                background: ROLE_FILL,
                border: `1px solid ${ROLE_STROKE}`,
              }}
            />
            Role
          </span>
        </div>
      </div>
      <div className="candidates-mindmap-canvas">
        <DiagramComponent
          id="candidates-mindmap"
          ref={(r: DiagramComponent | null) => {
            diagramRef.current = r;
            if (r && !ready) setReady(true);
          }}
          width="100%"
          height="520px"
          layout={layoutSettings}
          dataSourceSettings={{
            id: 'id',
            parentId: 'parentId',
            dataManager,
            // The root is the explicit anchor; everything else hangs off it.
            root: 'root',
          }}
          getNodeDefaults={getNodeDefaults}
          getConnectorDefaults={getConnectorDefaults}
          // Read-only — this is an analytical view, not an editing surface.
          tool={DiagramTools.ZoomPan}
          // Auto-fit the mind map into the visible area so the role
          // sub-branches aren't cropped on typical viewport widths.
          created={() => {
            const inst = diagramRef.current;
            if (inst && typeof inst.fitToPage === 'function') {
              inst.fitToPage({
                mode: 'Page',
                margin: { left: 24, right: 24, top: 24, bottom: 24 },
              });
            }
          }}
        >
          <Inject services={[DataBinding, MindMap]} />
        </DiagramComponent>
      </div>

      <style>{`
        .candidates-mindmap {
          margin-top: 24px;
          background: var(--color-sf-bg-primary, #fff);
          border: 1px solid var(--color-sf-border-secondary, #e5e7eb);
          border-radius: 12px;
          padding: 20px 20px 12px;
        }

        .candidates-mindmap-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .candidates-mindmap-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--color-sf-fg-primary, #0f172a);
        }

        .candidates-mindmap-subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: var(--color-sf-fg-secondary, #64748b);
        }

        .candidates-mindmap-legend {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          font-size: 12px;
          color: var(--color-sf-fg-secondary, #64748b);
        }

        .mindmap-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .mindmap-swatch {
          display: inline-block;
          width: 14px;
          height: 14px;
          border-radius: 4px;
        }

        .candidates-mindmap-canvas {
          width: 100%;
          /* Syncfusion paints a thin border on the diagram element by default;
             we let it sit on the card surface. */
          border-radius: 8px;
          overflow: hidden;
        }

        /* Syncfusion renders nodes as absolutely-positioned divs. Add a soft
           drop-shadow so the mind map feels like a card surface. */
        .candidates-mindmap-canvas .e-diagram .e-node {
          filter: drop-shadow(0 1px 1px rgba(15, 23, 42, 0.12));
        }

        @media (max-width: 640px) {
          .candidates-mindmap {
            padding: 16px 12px 8px;
          }
          .candidates-mindmap-legend {
            font-size: 11px;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};
