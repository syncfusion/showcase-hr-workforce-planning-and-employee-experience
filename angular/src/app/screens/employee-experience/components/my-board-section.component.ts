// MyBoardSection — mirrors src/screens/EmployeeExperience/components/MyBoardSection.tsx.
// Renders the personal Kanban board with the Report / Delay action buttons
// above it. Acts as the last tab in the Employee Experience screen.

import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { KanbanBoardComponent } from './kanban-board.component';

@Component({
  selector: 'app-my-board-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KanbanBoardComponent],
  template: `
    <div class="ee-board-section" aria-label="My board">
      <div class="ee-board-header">
        <h3 class="ee-section-title">My Board</h3>
        <div class="ee-board-actions">
          <button
            type="button"
            class="e-btn e-outline ee-board-actions__btn"
            (click)="reportIssue.emit()"
            aria-label="Report an issue"
          >⚠ Report</button>
          <button
            type="button"
            class="e-btn e-outline ee-board-actions__btn"
            (click)="delayConcern.emit()"
            aria-label="Raise a delay concern"
          >⏱ Delay</button>
        </div>
      </div>
      <app-kanban-board></app-kanban-board>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .ee-board-section { display: flex; flex-direction: column; gap: 12px; }
    .ee-board-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .ee-board-header .ee-section-title {
      font-size: 15px;
      font-weight: 600;
      margin: 0;
      color: var(--color-sf-fg-primary);
    }
    .ee-board-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .e-btn.ee-board-actions__btn {
      font-size: 12px;
      padding: 6px 12px;
      transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
    }
    .e-btn.ee-board-actions__btn:hover { transform: translateY(-1px); }
    .e-btn.ee-board-actions__btn:active { transform: translateY(0); }

    @media (max-width: 640px) {
      .ee-board-header { flex-direction: column; align-items: flex-start; }
    }
    @media (prefers-reduced-motion: reduce) {
      .e-btn.ee-board-actions__btn { transition: none !important; }
      .e-btn.ee-board-actions__btn:hover,
      .e-btn.ee-board-actions__btn:active { transform: none !important; }
    }
  `],
})
export class MyBoardSectionComponent {
  readonly reportIssue = output<void>();
  readonly delayConcern = output<void>();
}
