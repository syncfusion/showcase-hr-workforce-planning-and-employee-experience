import React from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { KanbanBoard } from './KanbanBoard';

interface MyBoardSectionProps {
  onReportIssue: () => void;
  onDelayConcern: () => void;
}

export const MyBoardSection: React.FC<MyBoardSectionProps> = ({
  onReportIssue,
  onDelayConcern,
}) => {
  return (
    <div className="ee-board-section" aria-label="My board">
      <div className="ee-board-header">
        <h3 className="ee-section-title">My Board</h3>
        <div className="ee-board-actions">
          <ButtonComponent
            cssClass="e-outline ee-board-actions__btn"
            onClick={onReportIssue}
            aria-label="Report an issue"
          >
            ⚠ Report
          </ButtonComponent>
          <ButtonComponent
            cssClass="e-outline ee-board-actions__btn"
            onClick={onDelayConcern}
            aria-label="Raise a delay concern"
          >
            ⏱ Delay
          </ButtonComponent>
        </div>
      </div>
      <KanbanBoard />
    </div>
  );
};
