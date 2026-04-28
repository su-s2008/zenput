'use client';
import { useEffect, useRef } from 'react';

export interface UseFocusTrapOptions {
  /** Whether the focus trap is currently active. */
  active: boolean;
  /** Ref to the container element that focus should be trapped inside. */
  containerRef: React.RefObject<HTMLElement | null>;
  /** If provided, focus this element when the trap activates. Defaults to the first tabbable element. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** If provided, restore focus to this element when the trap deactivates. Defaults to the element that had focus when the trap activated. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  /**
   * When `true` (default), clicking outside the container **deactivates** the
   * focus trap — focus is allowed to move wherever the user clicks and is not
   * pulled back. Tab cycling within the container is still enforced.
   *
   * When `false`, clicking outside does **not** deactivate the trap — if focus
   * moves outside the container it is pulled back to the first tabbable element.
   */
  clickOutsideDeactivates?: boolean;
}

/** CSS selector that matches all potentially tabbable elements. */
const TABBABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

/** Returns all tabbable elements within `container` that are currently visible
 *  and connected to the document. An element must satisfy all of:
 *  - connected to the DOM (`isConnected`)
 *  - not hidden via `display: none` (checked via computed style)
 *  - not hidden via `visibility: hidden`
 */
function getTabbable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter((el) => {
    if (!el.isConnected) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

/**
 * Hand-rolled focus trap hook.
 *
 * - Traps focus inside `containerRef` while `active` is `true`.
 * - Tab / Shift+Tab cycle within the tabbable elements.
 * - Restores focus to the previously focused element on deactivation.
 * - No external dependencies (no focus-trap, focus-trap-react, @react-aria/focus).
 */
export function useFocusTrap({
  active,
  containerRef,
  initialFocusRef,
  returnFocusRef,
  clickOutsideDeactivates = true,
}: UseFocusTrapOptions): void {
  // Store the element that was focused before the trap activated.
  const savedFocusRef = useRef<Element | null>(null);

  // Keep a ref for clickOutsideDeactivates so the focusin handler always reads
  // the latest value without needing to re-attach event listeners on each change.
  const clickOutsideDeactivatesRef = useRef(clickOutsideDeactivates);
  useEffect(() => {
    clickOutsideDeactivatesRef.current = clickOutsideDeactivates;
  });

  useEffect(() => {
    // SSR safety — don't touch document until effect runs.
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    // 1. Save the currently focused element for restoration.
    savedFocusRef.current = document.activeElement;

    // 2. Move focus to the desired initial target.
    const tabbable = getTabbable(container);
    const initialTarget = initialFocusRef?.current ?? tabbable[0] ?? null;

    // Track whether we added tabindex so we can clean it up on deactivation.
    const addedTabindex = !container.hasAttribute('tabindex');

    if (initialTarget) {
      initialTarget.focus();
    } else {
      // No tabbable children — focus the container itself.
      if (addedTabindex) {
        container.setAttribute('tabindex', '-1');
      }
      container.focus();
    }

    // 3. Tab-key cycling handler.
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key !== 'Tab') return;

      const currentTabbable = getTabbable(container!);

      if (currentTabbable.length === 0) {
        // No tabbable children: prevent Tab from escaping and keep container focused.
        e.preventDefault();
        container!.focus();
        return;
      }

      if (currentTabbable.length === 1) {
        // Single tabbable: prevent Tab from leaving while keeping it focused.
        e.preventDefault();
        currentTabbable[0].focus();
        return;
      }

      const first = currentTabbable[0];
      const last = currentTabbable[currentTabbable.length - 1];
      const focused = document.activeElement;

      if (e.shiftKey) {
        if (focused === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (focused === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    // 4. Focusin handler: if focus escapes the container, pull it back.
    // Reads clickOutsideDeactivatesRef so it always uses the latest value
    // without needing to re-register the listener.
    function handleFocusIn(e: FocusEvent): void {
      // When clickOutsideDeactivates is true, outside clicks are allowed to
      // move focus freely (trap deactivates for clicks). When false, keep focus
      // inside the container.
      if (clickOutsideDeactivatesRef.current) return;
      const target = e.target as Node | null;
      if (container && !container.contains(target)) {
        const currentTabbable = getTabbable(container);
        const refocus = currentTabbable[0] ?? container;
        refocus.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);

    // Capture the return target now (inside the effect) to avoid stale-ref
    // lint warnings; the ref's identity is stable so this is safe.
    const returnTarget = returnFocusRef?.current ?? null;
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);

      // Restore any tabindex mutation made when the container had no tabbable children.
      if (addedTabindex) {
        container.removeAttribute('tabindex');
      }

      // Restore focus when the trap deactivates.
      const toRestore = returnTarget ?? savedFocusRef.current;
      if (toRestore && toRestore instanceof HTMLElement && document.contains(toRestore)) {
        toRestore.focus();
      }
    };
    // Refs (containerRef, initialFocusRef, returnFocusRef) are intentionally
    // excluded from deps: their object identities are stable across renders
    // and their .current values are read inside the effect body. The trap
    // re-activates only when `active` flips so focus lifecycle stays clean.
    // clickOutsideDeactivates is handled via a ref so live value is always
    // available without re-attaching listeners.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
