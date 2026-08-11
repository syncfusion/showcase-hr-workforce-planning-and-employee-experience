import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'healthops-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Read the persisted preference. Defaults to 'light' on first visit. */
function readStoredMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'dark' || stored === 'system' ? stored : 'light';
}

/** Resolve a mode to a concrete light/dark theme. */
function resolveMode(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return typeof matchMedia !== 'undefined' && matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
  }
  return mode;
}

/**
 * Apply a resolved theme to the document. Two mechanisms in tandem:
 *  - data-theme on <html> flips our --color-sf-* semantic aliases (tokens.css)
 *  - the e-dark-mode class on <body> flips Syncfusion's tailwind3 component palette
 */
function applyTheme(resolved: ResolvedTheme): void {
  document.documentElement.dataset.theme = resolved;
  document.body.classList.toggle('e-dark-mode', resolved === 'dark');
}

/**
 * Apply the persisted theme before React renders, to avoid a flash for returning
 * dark-mode users. Call once from main.tsx prior to createRoot(...).render().
 */
export function initTheme(): void {
  applyTheme(resolveMode(readStoredMode()));
}

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredMode());
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveMode(mode));

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage may be unavailable (private mode); ignore */
    }
  }, []);

  // Apply theme whenever the mode changes.
  useEffect(() => {
    const next = resolveMode(mode);
    setResolved(next);
    applyTheme(next);
  }, [mode]);

  // While in 'system' mode, live-follow the OS preference.
  useEffect(() => {
    if (mode !== 'system' || typeof matchMedia === 'undefined') return;
    const mql = matchMedia(DARK_QUERY);
    const handler = () => {
      const next = mql.matches ? 'dark' : 'light';
      setResolved(next);
      applyTheme(next);
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
