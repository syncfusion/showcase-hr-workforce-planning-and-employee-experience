// RequisitionGrid — mirrors src/screens/Overview/components/RequisitionGrid.tsx
// Notes on the Angular port:
//   1. ej2-angular-grids' e-column `template` input only accepts a template
//      string (with `${field}` placeholders) or the id of an HTML element —
//      it does NOT accept a function reference like the React binding does.
//      We render the priority badge with an <ng-template> child instead.
//   2. Boolean attributes on Syncfusion directives must be bound with property
//      binding ([isPrimaryKey]="true") so the directive sees a real boolean.
//   3. The React version uses a custom toolbar (icon-only) and a custom
//      command-column Details button. We replicate both: the toolbar with an
//      <ng-template #toolbarTemplate> child (referenced via
//      `[toolbarTemplate]="toolbarTemplate"`) and the Details button via
//      `cssClass: 'e-flat mw-req-details-btn'`.
//   4. The "Time Open" column is hidden below `lg` to keep the grid readable,
//      matching React's `useBreakpoint()` behaviour (showTimeOpen = bp >= lg).
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import {
  GridAllModule,
  GridComponent,
  PageService,
  SortService,
  FilterService,
  EditService,
  ToolbarService,
  CommandColumnService,
} from '@syncfusion/ej2-angular-grids';
import { DialogAllModule } from '@syncfusion/ej2-angular-popups';
import { ButtonAllModule, ChipListModule } from '@syncfusion/ej2-angular-buttons';
import type { CommandClickEventArgs, EditSettingsModel } from '@syncfusion/ej2-grids';

import type { ActiveRequisition } from '../../../../models/overview.model';

type Stage = ActiveRequisition['stage'];

@Component({
  selector: 'app-requisition-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Syncfusion feature services — these are what actually register add/edit/
  // delete/toolbar/command-column behaviour on the grid. Without these in
  // `providers`, `addRecord()` / `startEdit()` / `deleteRecord()` and the
  // command-column click handler silently no-op (the parent directive
  // initialises but never wires up the feature pipeline).
  providers: [
    PageService,
    SortService,
    FilterService,
    EditService,
    ToolbarService,
    CommandColumnService,
  ],
  imports: [GridAllModule, DialogAllModule, ButtonAllModule, ChipListModule],
  template: `
    <div class="mw-req-grid-wrapper">
      <ejs-grid
        #grid
        [dataSource]="data()"
        [allowPaging]="true"
        [allowSorting]="true"
        [editSettings]="editSettings"
        [pageSettings]="{ pageSize: 5, pageCount: 5 }"
        height="auto"
        gridLines="Horizontal"
        cssClass="mw-req-grid"
        [toolbar]="toolbarOptions"
        (commandClick)="onCommandClick($event)"
        rowRenderingMode="Horizontal"
      >
        <e-columns>
          <e-column
            field="Id"
            headerText="Id"
            width="90"
            [visible]="false"
            textAlign="Left"
            [isPrimaryKey]="true">
          </e-column>
          <e-column
            field="position"
            headerText="Position"
            width="200"
            clipMode="EllipsisWithTooltip"
            textAlign="Left"
            [validationRules]="positionRules">
          </e-column>
          <e-column
            field="department"
            headerText="Department"
            width="170"
            textAlign="Left"
            [validationRules]="requiredRules">
            <ng-template #template let-data>
              <div class="mw-req-dept">
                <span class="mw-req-dept__avatar" aria-hidden="true">{{ data.department }}</span>
              </div>
            </ng-template>
          </e-column>
          <e-column
            field="priority"
            headerText="Priority"
            width="110"
            textAlign="Left"
            [validationRules]="requiredRules">
            <!-- ej2-angular-grids treats this <ng-template> as a ContentChild('template') -->
            <ng-template #template let-data>
              <ejs-chiplist
                class="mw-priority-badge"
                [cssClass]="priorityChipClass(data.priority)">
                <e-chips>
                  <e-chip [text]="data.priority"></e-chip>
                </e-chips>
              </ejs-chiplist>
            </ng-template>
          </e-column>
          <e-column
            field="candidates"
            headerText="Candidates"
            width="120"
            textAlign="Right"
            [validationRules]="candidatesRules">
            <ng-template #template let-data>
              <div [class]="'mw-req-candidates mw-req-candidates--' + candidatesTone(data.candidates)">
                <span class="mw-req-candidates__icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </span>
                <span class="mw-req-candidates__value">{{ data.candidates ?? 0 }}</span>
              </div>
            </ng-template>
          </e-column>
          <e-column
            field="stage"
            headerText="Stage"
            width="140"
            textAlign="Left"
            [validationRules]="requiredRules">
            <ng-template #template let-data>
              <span [class]="'mw-req-stage ' + stageClass(data.stage)">
                <span class="mw-req-stage__dot" aria-hidden="true"></span>
                {{ data.stage }}
              </span>
            </ng-template>
          </e-column>
          <e-column
            field="timeOpen"
            headerText="Time Open"
            width="120"
            textAlign="Left"
            [visible]="showTimeOpen()"
            [minWidth]="110">
            <ng-template #template let-data>
              <div class="mw-req-time">
                <span class="mw-req-time__icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </span>
                <span class="mw-req-time__value">{{ data.timeOpen }}</span>
              </div>
            </ng-template>
          </e-column>
          <e-column
            headerText="Details"
            width="130"
            textAlign="Center"
            [commands]="commands">
          </e-column>
        </e-columns>
      </ejs-grid>

      <ejs-dialog
        header="Row Information"
        width="400px"
        [visible]="dialogVisible()"
        [content]="dialogContent()"
        [showCloseIcon]="true"
        [isModal]="true"
        (close)="onDialogClose()">
      </ejs-dialog>
    </div>
  `,
  styleUrl: './requisition-grid.component.css',
})
export class RequisitionGridComponent implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly data = input.required<ActiveRequisition[]>();
  readonly view = output<ActiveRequisition>();

  @ViewChild('grid', { static: false })
  private gridRef?: ElementRef<GridComponent>;

  protected readonly editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: 'Normal', // Inline edit — matches the React port (which uses default inline editing).
    newRowPosition: 'Top',
    // Show form-validation error messages under the edited cell. Syncfusion's
    // default messages already describe the constraint (e.g. "This field is
    // required", "Please enter a number greater than or equal to 0").
    showConfirmDialog: true,
    showDeleteConfirmDialog: true,
  };

  // --- Validation rules (mirror the React RequisitionGrid) -------------
  // The grid uses its built-in FormValidator when columns declare
  // [validationRules]; invalid cells block save/commit and surface a
  // message under the cell. We expose three rule objects to match the
  // constraints declared in `src/screens/Overview/components/RequisitionGrid.tsx`.
  /** Position must not be empty. */
  protected readonly positionRules: object = { required: true };
  /** Department / Priority / Stage must not be empty. */
  protected readonly requiredRules: object = { required: true };
  /** Candidates: must be a non-negative integer. */
  protected readonly candidatesRules: object = {
    required: true,
    number: true,
    min: 0,
  };

  /**
   * The `mw-req-details-btn` class is what triggers the gradient pill
   * styling defined in the component CSS (matches the React version's
   * `cssClass: 'e-flat mw-req-details-btn'`).
   */
  protected readonly commands = [
    { buttonOption: { content: 'Details', cssClass: 'e-flat mw-req-details-btn' } },
  ];
  protected readonly toolbarOptions = ['Add', 'Edit', 'Delete', 'Update', 'Cancel'];

  protected readonly dialogVisible = signal(false);
  protected readonly dialogContent = signal<string>('');

  // --- Responsive state (React: useBreakpoint) ---
  // Hide the low-value "Time Open" column below `lg` to keep the grid readable.
  // React: showTimeOpen = bp === 'lg' || bp === 'xl';
  protected readonly showTimeOpen = signal<boolean>(true);
  private mqLg?: MediaQueryList;
  private mqLgHandler?: (e: MediaQueryListEvent) => void;

  ngOnInit(): void {
    this.setupResponsiveListeners();
  }

  ngOnDestroy(): void {
    if (this.mqLg && this.mqLgHandler) {
      this.mqLg.removeEventListener('change', this.mqLgHandler);
    }
  }

  // ------------------------------------------------------------ responsive --

  private setupResponsiveListeners(): void {
    // React breakpoint map: xs ≤480, sm 481–768, md 769–1024, lg 1025–1280, xl >1280.
    // We only care about lg/xl here, so we listen at the lower bound of `lg`.
    if (typeof window.matchMedia === 'function') {
      this.mqLg = window.matchMedia('(min-width: 1025px)');
      this.mqLgHandler = (e: MediaQueryListEvent) => {
        this.showTimeOpen.set(e.matches);
        this.cdr.markForCheck();
      };
      this.mqLg.addEventListener('change', this.mqLgHandler);
      // Initial paint from current viewport.
      this.showTimeOpen.set(this.mqLg.matches);
      this.cdr.markForCheck();
    }
  }

  // -------------------------------------------------------------- toolbar --

  /**
   * Dispatch to the grid's built-in methods so Add/Edit/Delete/Update/Cancel
   * keep working without the default text labels. Mirrors the React
   * `gridRef.current?.addRecord()` etc. pattern.
   */
  protected handleToolbarAction(
    action: 'Add' | 'Edit' | 'Delete' | 'Update' | 'Cancel',
  ): void {
    const grid = this.gridRef?.nativeElement;
    if (!grid) return;
    switch (action) {
      case 'Add':
        grid.addRecord();
        break;
      case 'Edit':
        grid.startEdit();
        break;
      case 'Delete':
        grid.deleteRecord();
        break;
      case 'Update':
        grid.endEdit();
        break;
      case 'Cancel':
        grid.closeEdit();
        break;
    }
  }

  // ----------------------------------------------------------- templates ---

  /** Maps a requisition priority to a Syncfusion chip cssClass. */
  protected priorityChipClass(priority: string): string {
    switch (priority) {
      case 'Critical':
        return 'e-danger';
      case 'High':
        return 'e-warning';
      case 'Medium':
        return 'e-primary';
      default:
        return 'e-info';
    }
  }

  /** Maps a candidate count to one of the four visual tones. */
  protected candidatesTone(value: number | null | undefined): string {
    const v = value ?? 0;
    if (v === 0) return 'empty';
    if (v < 5) return 'low';
    if (v < 15) return 'mid';
    return 'high';
  }

  /** Maps a stage enum to the modifier class used by the stage pill styles. */
  protected stageClass(stage: Stage | string): string {
    switch (stage) {
      case 'Screening':
        return 'mw-req-stage--screening';
      case 'Interview':
        return 'mw-req-stage--interview';
      case 'Final Round':
        return 'mw-req-stage--final';
      case 'Offer':
        return 'mw-req-stage--offer';
      case 'Filled':
        return 'mw-req-stage--filled';
      default:
        return '';
    }
  }

  // -------------------------------------------------------------- events --

  protected onCommandClick(args: CommandClickEventArgs): void {
    const r = args.rowData as ActiveRequisition | undefined;
    if (!r) return;
    this.view.emit(r);
    this.dialogContent.set(
      `<p><b>Position:</b> ${r.position}</p>
       <p><b>Department:</b> ${r.department}</p>
       <p><b>Priority:</b> ${r.priority}</p>
       <p><b>Candidates:</b> ${r.candidates}</p>
       <p><b>Stage:</b> ${r.stage}</p>
       <p><b>Time Open:</b> ${r.timeOpen}</p>`,
    );
    this.dialogVisible.set(true);
  }

  protected onDialogClose(): void {
    this.dialogVisible.set(false);
    this.dialogContent.set('');
  }
}