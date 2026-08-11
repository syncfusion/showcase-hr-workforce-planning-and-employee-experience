import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type ThemeMode } from '../theme/ThemeProvider';

const ICONS: Record<ThemeMode, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

/**
 * Compact theme switcher for the top bar. Cycles through Light → Dark → System
 * on each click without showing a dropdown menu.
 */
export const ThemeSwitcher: React.FC = () => {
  const { mode, setMode } = useTheme();

  const cycle = () => {
    const next: ThemeMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(next);
  };

  const TriggerIcon = ICONS[mode];

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={cycle}
        aria-label="Change theme"
        title="Change theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 34,
          height: 34,
          borderRadius: 'var(--radius-8)',
          border: '1px solid var(--color-sf-border-secondary)',
          background: 'var(--color-sf-bg-primary)',
          color: 'var(--color-sf-fg-tertiary)',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <TriggerIcon size={18} strokeWidth={1.75} />
      </button>
    </div>
  );
};
