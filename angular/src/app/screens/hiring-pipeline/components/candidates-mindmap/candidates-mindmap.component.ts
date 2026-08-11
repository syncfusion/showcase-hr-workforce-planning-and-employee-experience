// CandidatesMindMap — port of `src/screens/HiringPipeline/CandidatesMindMap.tsx`.
// Mirrors the React component's data shape, color tokens, and layout, while
// adapting the Syncfusion `<ejs-diagram>` API for Angular's standalone
// component model.
//
// API used:
//   <ejs-diagram> with the MindMap + DataBinding services registered via
//   `providers: [MindMapService, DataBindingService]`. The data is fed via
//   `dataSourceSettings: { id, parentId, dataManager, root }`, then styled
//   inside `getNodeDefaults` / `getConnectorDefaults`. The `created` event
//   triggers `fitToPage` so the diagram auto-zooms into the visible area.

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  DiagramAllModule,
  DiagramComponent as EjDiagramComponent,
  MindMapService,
  DataBindingService,
} from '@syncfusion/ej2-angular-diagrams';
import {
  DataManager,
} from '@syncfusion/ej2-data';
import type {
  NodeModel,
  ConnectorModel,
  LayoutModel,
  DataSourceModel,
  ShapeAnnotationModel,
} from '@syncfusion/ej2-diagrams';
import { DiagramTools } from '@syncfusion/ej2-diagrams';

import { LoadingStateComponent } from '../../../../components/states/loading-state/loading-state.component';
import type { Applicant, ApplicantStatus } from '../../../../models/hiring-pipeline.model';

// ---------------------------------------------------------------------------
// Data shape (matches React: `MindMapDatum`).
// ---------------------------------------------------------------------------

type MindMapKind = 'root' | 'department' | 'role';

interface MindMapDatum {
  id: string;
  parentId?: string;
  label: string;
  kind: MindMapKind;
  count: number;
  fill: string;
  activeCount: number;
  totalCount: number;
}

// ---------------------------------------------------------------------------
// Color tokens — kept identical to the React component so the diagrams match
// between the two front-ends.
// ---------------------------------------------------------------------------

const ROOT_FILL = '#1F2A44';
const ROOT_STROKE = '#0F172A';

const DEPARTMENT_FILLS: Record<string, string> = {
  Engineering: '#3B82F6',
  Product: '#8B5CF6',
  Design: '#EC4899',
  Data: '#14B8A6',
  Marketing: '#F59E0B',
  Sales: '#EF4444',
  'Customer Success': '#10B981',
  People: '#6366F1',
  Finance: '#0EA5E9',
  Operations: '#64748B',
  Security: '#DC2626',
  Platform: '#0D9488',
};

const DEFAULT_DEPARTMENT_FILL = '#475569';

const ROLE_FILL = '#F8FAFC';
const ROLE_STROKE = '#CBD5E1';
const ROLE_TEXT = '#0F172A';

// "Active" = anything that hasn't been rejected, hired, or otherwise closed.
const ACTIVE_STATUSES: ReadonlyArray<ApplicantStatus> = [
  'new',
  'screening',
  'interview',
  'offer',
];

// Same tuning as the React version.
const ROLES_PER_DEPARTMENT = 3;
const DEPARTMENTS_LIMIT = 5;

// Uniform node dimensions — keep the role labels readable in a 180×56 box.
const NODE_WIDTH = 180;
const NODE_HEIGHT = 56;

const isActive = (status: ApplicantStatus): boolean =>
  ACTIVE_STATUSES.includes(status);

const formatCount = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
};

/**
 * Build the flat MindMapDatum[] from the candidates array. Root → top
 * departments → top roles per department. Identical to the React logic.
 */
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

  // Aggregate by department → roles.
  const byDept = new Map<
    string,
    {
      total: number;
      active: number;
      roles: Map<string, { total: number; active: number }>;
    }
  >();
  for (const a of applicants) {
    const deptBucket = byDept.get(a.department) ?? {
      total: 0,
      active: 0,
      roles: new Map(),
    };
    deptBucket.total += 1;
    if (isActive(a.status)) deptBucket.active += 1;
    const roleBucket = deptBucket.roles.get(a.position) ?? {
      total: 0,
      active: 0,
    };
    roleBucket.total += 1;
    if (isActive(a.status)) roleBucket.active += 1;
    deptBucket.roles.set(a.position, roleBucket);
    byDept.set(a.department, deptBucket);
  }

  // Top departments by active count.
  const departments = Array.from(byDept.entries())
    .sort(
      (a, b) =>
        b[1].active - a[1].active || b[1].total - a[1].total,
    )
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
      .sort(
        (a, b) =>
          b[1].active - a[1].active || b[1].total - a[1].total,
      )
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

/**
 * A mind map that complements the candidate list/grid by showing the
 * *shape* of the pipeline: which departments and roles are attracting the
 * most active candidates, instead of forcing the recruiter to count rows.
 *
 * - Root: "Active Pipeline" with active / total counts
 * - Branches: top departments by active-candidate count
 * - Sub-branches: top roles inside each department
 */
@Component({
  selector: 'app-candidates-mindmap',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DiagramAllModule, LoadingStateComponent],
  // Register the two diagram services we need (MindMap layout + DataBinding).
  // These are value providers — the same instances Syncfusion's JS expects.
  providers: [MindMapService, DataBindingService],
  templateUrl: './candidates-mindmap.component.html',
  styleUrl: './candidates-mindmap.component.css',
})
export class CandidatesMindmapComponent implements AfterViewInit, OnDestroy {
  // --- Inputs ---
  readonly candidates = input<Applicant[]>([]);
  readonly isLoading = input<boolean>(false);

  // --- Refs ---
  @ViewChild('diagram')
  private diagramRef?: EjDiagramComponent;

  @ViewChild('canvas', { static: true })
  private canvasRef?: ElementRef<HTMLDivElement>;

  // --- Layout settings (rebuilt when data changes) ---
  protected readonly layoutSettings = signal<LayoutModel | null>(null);
  protected readonly dataSourceSettings =
    signal<DataSourceModel | null>(null);

  // --- Constants exposed to the template (legend swatches) ---
  protected readonly ROOT_FILL = ROOT_FILL;
  protected readonly ROLE_FILL = ROLE_FILL;
  protected readonly ROLE_STROKE = ROLE_STROKE;
  protected readonly DEPARTMENT_FILLS = DEPARTMENT_FILLS;
  /** Syncfusion's `DiagramTools` enum, exposed so the template can pick the
   *  read-only ZoomPan tool without importing the value-providers at use-site. */
  protected readonly diagramTools = DiagramTools;

  private readonly cdr = inject(ChangeDetectorRef);
  // The Syncfusion widget is heavy and we want to keep the lifecycle inside
  // the Angular zone where possible — but to avoid repeated re-renders we
  // gate the `dataBind` call so it only fires once the diagram instance is
  // ready. See `effect()` below.

  /**
   * Rebuild the DataManager + layout whenever the candidate input changes.
   * Uses an effect (rather than a setter on the inputs) so the rebuild runs
   * once per input change rather than once per set of changes.
   */
  private readonly _rebuildOnInputChange = effect(() => {
    const list = this.candidates();
    this.rebuildFromData(list);
  });

  ngAfterViewInit(): void {
    // The diagram mounts inside ngAfterViewInit. After the first `created`
    // event Syncfusion has finished its internal layout, so we listen for
    // it via the `created` template binding (see HTML).
  }

  ngOnDestroy(): void {
    // The Angular wrapper handles its own teardown via the OnDestroy
    // hook on the DiagramComponent. Nothing extra to do here.
  }

  // --------------------------------------------------------------- helpers --

  private rebuildFromData(applicants: Applicant[]): void {
    const data = buildMindMapData(applicants);

    // The diagram package's bundled DataManager type is structurally
    // compatible with the top-level ej2-data DataManager at runtime, but
    // the published types are a little loose. Construct it directly and
    // cast — same approach the React version uses.
    const dataManager = new DataManager(
      data.map((d) => ({ ...d })) as unknown as Record<string, unknown>[],
    );

    this.dataSourceSettings.set({
      id: 'id',
      parentId: 'parentId',
      dataManager: dataManager as unknown as DataSourceModel['dataManager'],
      root: 'root',
    });

    this.layoutSettings.set({
      type: 'MindMap',
      orientation: 'Horizontal',
      horizontalSpacing: 60,
      verticalSpacing: 24,
      getBranch: (node: NodeModel): 'Left' | 'Right' | 'Root' => {
        const datum = node.data as MindMapDatum | undefined;
        if (!datum) return 'Right';
        if (datum.kind === 'root') return 'Root';
        const hash = datum.id
          .split('')
          .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        return hash % 2 === 0 ? 'Left' : 'Right';
      },
    });

    // If the diagram has already mounted, force a re-bind so the new data
    // is rendered without a full re-init.
    queueMicrotask(() => {
      const inst = this.diagramRef;
      if (inst && typeof inst.dataBind === 'function') {
        try {
          inst.dataBind();
        } catch {
          // Syncfusion can throw if the diagram was torn down; safe to
          // ignore — the next ngAfterViewInit will re-mount.
        }
      }
    });
  }

  // --------------------------------------------------------- node styling --

  /**
   * Applied to every node Syncfusion creates from the DataManager. Branches
   * on `datum.kind` to give each level a distinct visual, matching the
   * React component's per-kind styling.
   */
  protected getNodeDefaults = (node: NodeModel): NodeModel => {
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
      } as NodeModel['style'];
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
        } as unknown as ShapeAnnotationModel,
      ] as NodeModel['annotations'];
      return node;
    }

    if (datum.kind === 'department') {
      node.width = NODE_WIDTH;
      node.height = NODE_HEIGHT;
      node.style = {
        fill: datum.fill,
        strokeColor: '#0F172A',
        strokeWidth: 1,
      } as NodeModel['style'];
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
        } as unknown as ShapeAnnotationModel,
      ] as NodeModel['annotations'];
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
    } as NodeModel['style'];
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
      } as unknown as ShapeAnnotationModel,
    ] as NodeModel['annotations'];
    return node;
  };

  protected getConnectorDefaults = (connector: ConnectorModel): ConnectorModel => {
    connector.type = 'Bezier';
    connector.style = {
      strokeColor: '#94A3B8',
      strokeWidth: 1.25,
    } as ConnectorModel['style'];
    (connector.targetDecorator as { shape: string }).shape = 'None';
    return connector;
  };

  /**
   * Auto-fit the mind map into the visible area so the role sub-branches
   * aren't cropped on typical viewport widths. Mirrors the React
   * `created` handler.
   */
  protected onDiagramCreated = (): void => {
    const inst = this.diagramRef;
    if (inst && typeof inst.fitToPage === 'function') {
      try {
        inst.fitToPage({
          mode: 'Page',
          margin: { left: 24, right: 24, top: 24, bottom: 24 },
        });
      } catch {
        // Syncfusion may throw if the layout hasn't fully calculated; the
        // next dataBind pass will retry.
      }
    }
    this.cdr.markForCheck();
  };
}
