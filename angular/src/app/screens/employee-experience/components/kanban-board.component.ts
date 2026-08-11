// KanbanBoard — mirrors src/screens/EmployeeExperience/components/KanbanBoard.tsx
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import {
  KanbanModule,
  CardSettingsModel,
  SwimlaneSettingsModel,
  DragEventArgs,
} from '@syncfusion/ej2-angular-kanban';

import { LoadingStateComponent } from '../../../components/states/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../components/states/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../components/states/error-state/error-state.component';
import { EmployeeExperienceService } from '../../../services/employee-experience.service';
import {
  KANBAN_LANES,
  PRIORITY_LABELS,
  SOURCE_TYPE_LABELS,
} from '../employee-experience.config';
import type {
  KanbanItem,
  KanbanLane,
  KanbanSourceType,
} from '../../../models/employee-experience.model';

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

function toKanbanData(items: KanbanItem[]): KanbanCardData[] {
  return items.map((it) => ({
    Id: it.id,
    Status: it.lane,
    Summary: it.title,
    Priority: it.priority ?? undefined,
    Tags: it.tags?.join(', '),
    AssigneeId: it.assigneeId,
    DueDate: it.dueDate,
    Title: it.title,
    SourceType: it.sourceType,
    SourceTypeLabel:
      SOURCE_TYPE_LABELS[it.sourceType as KanbanSourceType] ?? it.sourceType,
  }));
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    KanbanModule,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
})
export class KanbanBoardComponent implements OnInit {
  private readonly service = inject(EmployeeExperienceService);

  protected readonly items = signal<KanbanItem[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly kanbanLanes = KANBAN_LANES;

  protected readonly cardSettings: CardSettingsModel = {
    headerField: 'Id',
    contentField: 'Summary',
    template: '#cardSettingsTemplate',
  };

  // Group cards horizontally by their SourceType. The swimlane header
  // template renders the human-readable label (e.g. "Self-Service")
  // instead of the raw key.
  protected readonly swimlaneSettings: SwimlaneSettingsModel = {
    keyField: 'SourceType',
    template: '#swimlaneSettingsTemplate',
    allowDragAndDrop: true,
  };

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      const data = await this.service.getKanbanItems();
      this.items.set(data);
    } catch {
      this.error.set('Failed to load Kanban board');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected retry(): void {
    void this.load();
  }

  protected kanbanData(): KanbanCardData[] {
    return toKanbanData(this.items());
  }

  protected async onDragStop(args: DragEventArgs): Promise<void> {
    // `args.data` is typed as `Record<string, any>[]` (an array of moved
    // cards). We single-cast through `unknown` to the first card, since
    // kanban drag events typically deliver one card at a time.
    const first = (args?.data as unknown as KanbanCardData[] | undefined)?.[0];
    if (!first?.Id) return;
    const newLane = first.Status as KanbanLane;
    try {
      const moved = await this.service.moveKanbanItem(first.Id, newLane);
      if (moved) {
        this.items.update((prev) =>
          prev.map((it) => (it.id === moved.id ? moved : it)),
        );
      }
    } catch {
      this.error.set('Failed to move Kanban card');
    }
  }

  protected priorityLabel(priority: string): string {
    return PRIORITY_LABELS[priority] ?? priority;
  }
  protected priorityClass(priority: string | undefined): string {
    if (!priority) return '';
    const key = priority.toLowerCase();
    return ['low', 'medium', 'high', 'critical'].includes(key) ? key : '';
  }
  protected formatDateShort(value: string | null | undefined): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  protected avatarInitials(value: string | null | undefined): string {
    return value ? value.charAt(0).toUpperCase() : '?';
  }

  protected tagList(tags: string | undefined): string[] {
    return tags ? tags.split(', ').filter(Boolean) : [];
  }

  protected readonly retryFn: () => void = () => this.retry();
}
