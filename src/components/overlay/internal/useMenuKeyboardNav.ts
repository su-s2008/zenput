import React, { useCallback, useEffect, useRef } from 'react';
import { getMenuItems } from './menuUtils';

export interface UseMenuKeyboardNavOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  /** Called when Tab is pressed (e.g. close menu + restore focus). */
  onTab: (e: React.KeyboardEvent) => void;
  /** Called when Escape is pressed (e.g. close menu + restore focus). */
  onEscape: (e: React.KeyboardEvent) => void;
  /** Called when ArrowLeft is pressed (submenu backtrack). Not invoked if omitted. */
  onArrowLeft?: (e: React.KeyboardEvent) => void;
}

/**
 * Shared keyboard navigation handler for menu containers (MenuContent,
 * MenuSubContent, ContextMenuContent).
 *
 * Handles:
 * - ArrowDown / ArrowUp  — roving focus between enabled items, wrapping
 * - Home / End           — jump to first / last item
 * - Enter / Space        — activate the focused item via `.click()` ONLY
 *                          when the event was NOT already handled by the
 *                          item's own onKeyDown (i.e. e.defaultPrevented
 *                          is false), preventing double onSelect calls
 * - Tab                  — delegates to `onTab`
 * - Escape               — delegates to `onEscape`
 * - ArrowLeft            — delegates to `onArrowLeft` when provided
 * - Printable chars      — type-ahead focus jump (500 ms buffer)
 */
export function useMenuKeyboardNav({
  containerRef,
  onTab,
  onEscape,
  onArrowLeft,
}: UseMenuKeyboardNavOptions): (e: React.KeyboardEvent<HTMLDivElement>) => void {
  const typeAheadBuffer = useRef('');
  const typeAheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep stable refs for callbacks so the returned handler never becomes stale.
  // Pattern used by useFocusTrap — no deps, runs after every render.
  const onTabRef = useRef(onTab);
  const onEscapeRef = useRef(onEscape);
  const onArrowLeftRef = useRef(onArrowLeft);
  useEffect(() => { onTabRef.current = onTab; });
  useEffect(() => { onEscapeRef.current = onEscape; });
  useEffect(() => { onArrowLeftRef.current = onArrowLeft; });

  useEffect(() => {
    return () => {
      if (typeAheadTimer.current) clearTimeout(typeAheadTimer.current);
    };
  }, []);

  return useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const items = getMenuItems(el);
      const focused = document.activeElement as HTMLElement | null;
      const currentIndex = focused ? items.indexOf(focused) : -1;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          e.stopPropagation();
          const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          items[next]?.focus();
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          e.stopPropagation();
          const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prev]?.focus();
          break;
        }
        case 'Home': {
          e.preventDefault();
          e.stopPropagation();
          items[0]?.focus();
          break;
        }
        case 'End': {
          e.preventDefault();
          e.stopPropagation();
          items[items.length - 1]?.focus();
          break;
        }
        case 'Enter':
        case ' ': {
          // If the item's own onKeyDown already handled this key (calling
          // e.preventDefault()), skip the synthetic click to avoid invoking
          // onSelect twice. When the event is dispatched directly on the
          // container (e.g. keyboard-focus tests), defaultPrevented is false
          // and the click is synthesised normally.
          if (!e.defaultPrevented && focused && items.includes(focused)) {
            focused.click();
          }
          e.preventDefault();
          break;
        }
        case 'Tab': {
          e.preventDefault();
          onTabRef.current(e);
          break;
        }
        case 'Escape': {
          e.preventDefault();
          onEscapeRef.current(e);
          break;
        }
        case 'ArrowLeft': {
          if (onArrowLeftRef.current) {
            e.preventDefault();
            onArrowLeftRef.current(e);
          }
          break;
        }
        default: {
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            typeAheadBuffer.current += e.key.toLowerCase();
            if (typeAheadTimer.current) clearTimeout(typeAheadTimer.current);
            typeAheadTimer.current = setTimeout(() => {
              typeAheadBuffer.current = '';
            }, 500);
            const match = items.find((item) =>
              (item.textContent ?? '').trim().toLowerCase().startsWith(typeAheadBuffer.current)
            );
            match?.focus();
          }
        }
      }
    },
    [containerRef]
  );
}
