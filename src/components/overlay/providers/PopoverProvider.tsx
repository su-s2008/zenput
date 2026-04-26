import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Portal } from '../../Portal';
import { useEscapeKey } from '../internal/useEscapeKey';
import { useClickOutside } from '../internal/useClickOutside';
import styles from '../Popover/Popover.module.css';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

let _idCounter = 0;
function genId(): string {
  return `zpop-${++_idCounter}`;
}

export type PopoverAnchor =
  | HTMLElement
  | React.RefObject<HTMLElement | null>
  | { x: number; y: number };

export type ImpPopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type ImpPopoverAlign = 'start' | 'center' | 'end';

interface PopoverCoords {
  top: number;
  left: number;
}

function getAnchorRect(anchor: PopoverAnchor): DOMRect | null {
  if (anchor instanceof HTMLElement) return anchor.getBoundingClientRect();
  if ('current' in anchor) return anchor.current?.getBoundingClientRect() ?? null;
  // {x, y} coordinate — treat as a zero-size rect at those coordinates
  return new DOMRect(anchor.x, anchor.y, 0, 0);
}

function computePosition(
  anchorRect: DOMRect,
  contentRect: DOMRect,
  side: ImpPopoverSide,
  align: ImpPopoverAlign,
  sideOffset: number
): PopoverCoords {
  let top = 0;
  let left = 0;

  if (side === 'top' || side === 'bottom') {
    top =
      side === 'top'
        ? anchorRect.top - contentRect.height - sideOffset
        : anchorRect.bottom + sideOffset;
    if (align === 'start') left = anchorRect.left;
    else if (align === 'end') left = anchorRect.right - contentRect.width;
    else left = anchorRect.left + anchorRect.width / 2 - contentRect.width / 2;
  } else {
    left =
      side === 'left'
        ? anchorRect.left - contentRect.width - sideOffset
        : anchorRect.right + sideOffset;
    if (align === 'start') top = anchorRect.top;
    else if (align === 'end') top = anchorRect.bottom - contentRect.height;
    else top = anchorRect.top + anchorRect.height / 2 - contentRect.height / 2;
  }

  const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
  left = Math.max(4, Math.min(left, vw - contentRect.width - 4));
  top = Math.max(4, Math.min(top, vh - contentRect.height - 4));

  return { top, left };
}

interface PopoverStackEntry {
  id: string;
  anchor: PopoverAnchor;
  side: ImpPopoverSide;
  align: ImpPopoverAlign;
  sideOffset: number;
  dismissible: boolean;
  renderContent: (close: (value: unknown) => void) => React.ReactNode;
  /** Pre-built close function. */
  close: (value?: unknown) => void;
}

interface PopoverProviderContextValue {
  _open: (opts: {
    anchor: PopoverAnchor;
    side?: ImpPopoverSide;
    align?: ImpPopoverAlign;
    sideOffset?: number;
    dismissible?: boolean;
    content: (close: (value: unknown) => void) => React.ReactNode;
  }) => { result: Promise<unknown>; close: (value?: unknown) => void };
}

const PopoverProviderContext = createContext<PopoverProviderContextValue | null>(null);

function usePopoverProviderContext(): PopoverProviderContextValue {
  const ctx = useContext(PopoverProviderContext);
  if (!ctx) {
    throw new Error('usePopover must be used inside <PopoverProvider>.');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// ImperativePopoverContent — renders one popover entry
// ---------------------------------------------------------------------------

function ImperativePopoverContent({
  entry,
  onClose,
  isTopmost,
}: {
  entry: PopoverStackEntry;
  onClose: (value?: unknown) => void;
  isTopmost: boolean;
}): React.ReactElement | null {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<PopoverCoords | null>(null);

  useEffect(() => {
    const updatePosition = (): void => {
      const anchorRect = getAnchorRect(entry.anchor);
      const content = contentRef.current;
      if (!anchorRect || !content) return;
      setCoords(
        computePosition(
          anchorRect,
          content.getBoundingClientRect(),
          entry.side,
          entry.align,
          entry.sideOffset
        )
      );
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [entry]);

  const handleEscape = useCallback(() => {
    if (entry.dismissible) onClose(null);
  }, [entry.dismissible, onClose]);
  useEscapeKey(isTopmost, handleEscape);

  const anchorRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (entry.anchor instanceof HTMLElement) {
      anchorRef.current = entry.anchor;
    } else if ('current' in entry.anchor) {
      anchorRef.current = entry.anchor.current;
    }
  }, [entry.anchor]);

  const handleClickOutside = useCallback(() => {
    if (entry.dismissible) onClose(null);
  }, [entry.dismissible, onClose]);
  useClickOutside(isTopmost, [contentRef, anchorRef], handleClickOutside);

  return (
    <Portal>
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="false"
        tabIndex={-1}
        data-side={entry.side}
        data-align={entry.align}
        style={{
          position: 'fixed',
          top: coords?.top ?? -9999,
          left: coords?.left ?? -9999,
          visibility: coords ? 'visible' : 'hidden',
        }}
        className={styles.content}
      >
        {entry.renderContent(onClose)}
      </div>
    </Portal>
  );
}

// ---------------------------------------------------------------------------
// PopoverProvider
// ---------------------------------------------------------------------------

export interface PopoverProviderProps {
  children: React.ReactNode;
}

/**
 * Imperative popover host. Wrap your application (or a subtree) with
 * `<PopoverProvider>` once, then call `usePopover()` anywhere inside the
 * tree to show floating popovers anchored to an element or `(x, y)` point.
 */
export function PopoverProvider({ children }: PopoverProviderProps): React.ReactElement {
  const [stack, setStack] = useState<PopoverStackEntry[]>([]);

  const pendingRef = useRef(new Map<string, (value?: unknown) => void>());

  useEffect(() => {
    const pending = pendingRef.current;
    return () => {
      pending.forEach((close) => {
        try {
          close(null);
        } catch {
          /* swallow */
        }
      });
      pending.clear();
    };
  }, []);

  const _open = useCallback(
    (opts: {
      anchor: PopoverAnchor;
      side?: ImpPopoverSide;
      align?: ImpPopoverAlign;
      sideOffset?: number;
      dismissible?: boolean;
      content: (close: (value: unknown) => void) => React.ReactNode;
    }) => {
      const id = genId();
      const returnFocusEl =
        typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;

      let resolveFn: (value: unknown) => void = () => undefined;
      const result = new Promise<unknown>((res) => {
        resolveFn = res;
      });

      const close = (value?: unknown): void => {
        setStack((prev) => prev.filter((e) => e.id !== id));
        pendingRef.current.delete(id);
        resolveFn(value !== undefined ? value : null);
        requestAnimationFrame(() => {
          if (returnFocusEl instanceof HTMLElement) returnFocusEl.focus();
        });
      };

      pendingRef.current.set(id, close);

      setStack((prev) => [
        ...prev,
        {
          id,
          anchor: opts.anchor,
          side: opts.side ?? 'bottom',
          align: opts.align ?? 'center',
          sideOffset: opts.sideOffset ?? 8,
          dismissible: opts.dismissible ?? true,
          renderContent: opts.content,
          close,
        },
      ]);

      return { result, close };
    },
    []
  );

  return (
    <PopoverProviderContext.Provider value={{ _open }}>
      {children}
      {stack.map((entry, index) => (
        <ImperativePopoverContent
          key={entry.id}
          entry={entry}
          onClose={entry.close}
          isTopmost={index === stack.length - 1}
        />
      ))}
    </PopoverProviderContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// usePopover
// ---------------------------------------------------------------------------

export interface PopoverHandle<T = unknown> {
  /** Promise that resolves with the value passed to `close(value)`, or `null` on dismissal. */
  result: Promise<T | null>;
  /** Programmatically close the popover. */
  close: (value?: T) => void;
}

export interface PopoverOpenOptions<T = unknown> {
  /**
   * Element to anchor to, or `{ x, y }` viewport coordinates.
   * Accepts `HTMLElement`, `React.RefObject<HTMLElement>`, or `{ x: number; y: number }`.
   */
  anchor: PopoverAnchor;
  /** Preferred side relative to the anchor. Default: `'bottom'`. */
  side?: ImpPopoverSide;
  /** Alignment along the side axis. Default: `'center'`. */
  align?: ImpPopoverAlign;
  /** Gap between anchor and popover in pixels. Default: `8`. */
  sideOffset?: number;
  /**
   * When `false`, Escape and outside click do not close the popover.
   * Default: `true`.
   */
  dismissible?: boolean;
  /** Render function for the popover content. */
  content: (props: { close: (value?: T) => void }) => React.ReactNode;
}

export interface PopoverApi {
  open: <T = unknown>(options: PopoverOpenOptions<T>) => PopoverHandle<T>;
}

/** Returns an object with an `open` method to imperatively show a popover. */
export function usePopover(): PopoverApi {
  const { _open } = usePopoverProviderContext();

  const open = useCallback(
    <T = unknown,>(options: PopoverOpenOptions<T>): PopoverHandle<T> => {
      const handle = _open({
        anchor: options.anchor,
        side: options.side,
        align: options.align,
        sideOffset: options.sideOffset,
        dismissible: options.dismissible,
        content: (close) => options.content({ close: close as (value?: T) => void }),
      });
      return {
        result: handle.result as Promise<T | null>,
        close: handle.close as (value?: T) => void,
      };
    },
    [_open]
  );

  return { open };
}
