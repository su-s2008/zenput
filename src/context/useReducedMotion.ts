'use client';
import { useEffect, useState } from 'react';
import { mqlAddListener, mqlRemoveListener } from './mqlHelpers';

/**
 * Returns `true` when the user has requested reduced motion via the OS
 * `prefers-reduced-motion: reduce` media feature, and `false` otherwise.
 *
 * SSR-safe: returns `false` on the server and updates on the client after
 * hydration.
 *
 * All built-in Zenput animations honour this hook by reading the
 * `--zp-duration-*` CSS custom properties, which are emitted by
 * `ThemeProvider`. You can also use it directly to conditionally disable
 * animations in your own components:
 *
 * ```tsx
 * import { useReducedMotion } from 'zenput';
 *
 * function AnimatedBanner() {
 *   const reduced = useReducedMotion();
 *   return (
 *     <div style={{ transition: reduced ? 'none' : 'transform 200ms ease' }}>
 *       …
 *     </div>
 *   );
 * }
 * ```
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let mql: MediaQueryList;
    try {
      mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    } catch {
      return;
    }
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mqlAddListener(mql, handler);
    return () => mqlRemoveListener(mql, handler);
  }, []);

  return reducedMotion;
}
