import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="empty-state" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ marginBottom: '16px', color: '#6C757D' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      </div>
      <h3 style={{ marginBottom: '8px', color: '#212529' }}>{title}</h3>
      {description && <p style={{ marginBottom: '24px', color: '#6C757D' }}>{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            background: '#3B8CDE',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
