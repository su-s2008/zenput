/**
 * @internal — helpers for subscribing to MediaQueryList change events.
 *
 * Older browsers (Safari < 14) expose `addListener`/`removeListener`
 * instead of the modern `addEventListener`/`removeEventListener`. We feature-
 * detect and fall back so the rest of the codebase can use a single API.
 */

export type MqlChangeHandler = (e: MediaQueryListEvent) => void;

/** Subscribe to a MediaQueryList 'change' event.
 *  Falls back to the legacy `addListener` API when `addEventListener` is
 *  not available (Safari < 14, IE 11). */
export function mqlAddListener(mql: MediaQueryList, handler: MqlChangeHandler): void {
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', handler);
  } else {
    // Legacy API // NOSONAR
    (mql as MediaQueryList & { addListener?: (fn: MqlChangeHandler) => void }).addListener?.(
      handler
    );
  }
}

/** Remove a MediaQueryList 'change' listener previously registered with
 *  {@link mqlAddListener}. */
export function mqlRemoveListener(mql: MediaQueryList, handler: MqlChangeHandler): void {
  if (typeof mql.removeEventListener === 'function') {
    mql.removeEventListener('change', handler);
  } else {
    // Legacy API // NOSONAR
    (
      mql as MediaQueryList & { removeListener?: (fn: MqlChangeHandler) => void }
    ).removeListener?.(handler);
  }
}
