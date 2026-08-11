// ThemeService — Angular port of src/theme/ThemeProvider.tsx
// Mirrors the 3-mode cycle (light | dark | system), persists to localStorage,
// resolves a concrete theme from the OS preference when in 'system' mode, and
// applies it two ways in tandem:
//   - <html data-theme="..."> flips the --color-sf-* semantic aliases (tokens.css)
//   - <body class="e-dark-mode"> flips Syncfusion's tailwind3 component palette

import {
  Injectable,
  PLATFORM_ID,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'healthops-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function readStoredMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'dark' || stored === 'system' ? stored : 'light';
}

function resolveMode(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return typeof matchMedia !== 'undefined' && matchMedia(DARK_QUERY).matches
      ? 'dark'
      : 'light';
  }
  return mode;
}

function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset['theme'] = resolved;
  document.body.classList.toggle('e-dark-mode', resolved === 'dark');
}

/**
 * Apply the persisted theme before Angular bootstraps, to avoid a flash for
 * returning dark-mode users. Call once from main.ts prior to bootstrapApplication().
 */
export function initTheme(): void {
  applyTheme(resolveMode(readStoredMode()));
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _mode = signal<ThemeMode>(this.isBrowser ? readStoredMode() : 'light');
  private readonly _resolved = signal<ResolvedTheme>(resolveMode(this._mode()));

  /** Current user-selected mode (light | dark | system). */
  readonly mode = this._mode.asReadonly();

  /** Concrete theme after resolving 'system' against the OS preference. */
  readonly resolved = this._resolved.asReadonly();

  private mql?: MediaQueryList;
  private mqlHandler?: (e: MediaQueryListEvent) => void;

  constructor() {
    if (!this.isBrowser) return;

    // Apply the initial theme eagerly so the first paint matches.
    applyTheme(this._resolved());

    // React to mode changes by recomputing the resolved theme and re-applying.
    effect(() => {
      const next = resolveMode(this._mode());
      this._resolved.set(next);
      applyTheme(next);
      this.bindSystemListener(this._mode());
    });

    // Persist whenever the user changes the mode.
    effect(() => {
      const current = this._mode();
      untracked(() => {
        try {
          localStorage.setItem(STORAGE_KEY, current);
        } catch {
          /* storage may be unavailable (private mode); ignore */
        }
      });
    });
  }

  setMode(next: ThemeMode): void {
    this._mode.set(next);
  }

  /** Convenience: cycle light → dark → system → light. */
  cycleMode(): void {
    const current = this._mode();
    const next: ThemeMode =
      current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
    this.setMode(next);
  }

  private bindSystemListener(mode: ThemeMode): void {
    if (mode === 'system' && this.isBrowser) {
      this.mql = matchMedia(DARK_QUERY);
      this.mqlHandler = () => {
        const next: ResolvedTheme = this.mql!.matches ? 'dark' : 'light';
        this._resolved.set(next);
        applyTheme(next);
      };
      this.mql.addEventListener('change', this.mqlHandler);
    } else if (this.mql && this.mqlHandler) {
      this.mql.removeEventListener('change', this.mqlHandler);
      this.mql = undefined;
      this.mqlHandler = undefined;
    }
  }
}
