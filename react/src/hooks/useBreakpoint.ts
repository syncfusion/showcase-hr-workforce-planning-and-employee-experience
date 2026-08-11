import { useEffect, useState } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const QUERIES: Array<{ bp: Breakpoint; mq: string }> = [
  { bp: 'xs', mq: '(max-width: 480px)' },
  { bp: 'sm', mq: '(min-width: 481px) and (max-width: 768px)' },
  { bp: 'md', mq: '(min-width: 769px) and (max-width: 1024px)' },
  { bp: 'lg', mq: '(min-width: 1025px) and (max-width: 1280px)' },
  { bp: 'xl', mq: '(min-width: 1281px) and (max-width: 1600px)' },
  { bp: 'xxl', mq: '(min-width: 1601px)' },
];

/**
 * Returns the current responsive breakpoint bucket.
 *
 * Buckets (max-width mobile-first):
 * - xs: <=480
 * - sm: 481-768
 * - md: 769-1024
 * - lg: 1025-1280
 * - xl: 1281-1600
 * - xxl: >1600
 */
export const useBreakpoint = (): Breakpoint => {
  const [bp, setBp] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return 'xl';
    }
    return QUERIES.find((q) => window.matchMedia(q.mq).matches)?.bp ?? 'xl';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const handlers: Array<{ mql: MediaQueryList; handler: (e: MediaQueryListEvent) => void }> = [];
    QUERIES.forEach((q) => {
      const mql = window.matchMedia(q.mq);
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) setBp(q.bp);
      };
      mql.addEventListener('change', handler);
      handlers.push({ mql, handler });
    });
    return () => {
      handlers.forEach(({ mql, handler }) => mql.removeEventListener('change', handler));
    };
  }, []);

  return bp;
};
