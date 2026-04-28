'use client';
import { useEffect, type RefObject } from 'react';

/**
 * Invokes `onOutside` when a `mousedown`/`touchstart` happens outside
 * any of the provided refs. Used to implement click-outside-to-close.
 *
 * Listeners are attached to the document in the bubble phase; events
 * targeting a node contained by any of the refs are ignored.
 */
export function useClickOutside(
  active: boolean,
  refs: ReadonlyArray<RefObject<HTMLElement | null>>,
  onOutside: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    if (!active) return;
    const handler = (event: MouseEvent | TouchEvent): void => {
      const target = event.target as Node | null;
      if (target == null) return;
      for (const ref of refs) {
        const el = ref.current;
        if (el && el.contains(target)) return;
      }
      onOutside(event);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
    // `refs` is a stable array in practice — consumers keep the refs
    // across renders. We intentionally don't spread it into deps to
    // avoid re-subscribing on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, onOutside]);
}
