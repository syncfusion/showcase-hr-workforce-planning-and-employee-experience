import React from 'react';

interface LoadingStateProps {
  height?: string;
  width?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ height = '200px', width = '100%' }) => {
  return (
    <div className="loading-state" style={{ height, width, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="e-spinner e-spinner-medium">
        <div className="e-spinner-circle e-spinner-marker"></div>
      </div>
    </div>
  );
};
