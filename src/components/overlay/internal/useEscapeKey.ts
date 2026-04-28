'use client';
import { useEffect } from 'react';

/**
 * Invokes `onEscape` when the user presses the Escape key while `active`
 * is true. The handler is attached to the document so nested overlays
 * can opt out by stopping propagation on their own handler.
 */
export function useEscapeKey(active: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [active, onEscape]);
}
