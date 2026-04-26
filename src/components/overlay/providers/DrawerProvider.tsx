import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
} from '../Drawer';
import type { DrawerSide, DrawerSize } from '../Drawer';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

let _idCounter = 0;
function genId(): string {
  return `zdwr-${++_idCounter}`;
}

interface DrawerStackEntry {
  id: string;
  side: DrawerSide;
  size: DrawerSize;
  dismissible: boolean;
  defaultCloseValue: unknown;
  renderContent: (close: (value: unknown) => void) => React.ReactNode;
  /** Pre-built close function — used directly in render without accessing refs. */
  close: (value?: unknown) => void;
}

function removeDrawerEntryById(stack: DrawerStackEntry[], id: string): DrawerStackEntry[] {
  return stack.filter((e) => e.id !== id);
}

interface DrawerProviderContextValue {
  _open: (opts: {
    side?: DrawerSide;
    size?: DrawerSize;
    dismissible?: boolean;
    defaultCloseValue?: unknown;
    content: (close: (value: unknown) => void) => React.ReactNode;
  }) => { result: Promise<unknown>; close: (value?: unknown) => void };
}

const DrawerProviderContext = createContext<DrawerProviderContextValue | null>(null);

function useDrawerProviderContext(): DrawerProviderContextValue {
  const ctx = useContext(DrawerProviderContext);
  if (!ctx) {
    throw new Error('useDrawer must be used inside <DrawerProvider>.');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// DrawerProvider
// ---------------------------------------------------------------------------

export interface DrawerProviderProps {
  children: React.ReactNode;
}

/**
 * Imperative drawer host. Wrap your application (or a subtree) with
 * `<DrawerProvider>` once, then call `useDrawer()` anywhere inside the tree
 * to open drawers without managing `open` state or JSX placement.
 */
export function DrawerProvider({ children }: DrawerProviderProps): React.ReactElement {
  const [stack, setStack] = useState<DrawerStackEntry[]>([]);

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
      side?: DrawerSide;
      size?: DrawerSize;
      dismissible?: boolean;
      defaultCloseValue?: unknown;
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
        setStack((prev) => removeDrawerEntryById(prev, id));
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
          side: opts.side ?? 'right',
          size: opts.size ?? 'md',
          dismissible: opts.dismissible ?? true,
          defaultCloseValue: opts.defaultCloseValue !== undefined ? opts.defaultCloseValue : null,
          renderContent: opts.content,
          close,
        },
      ]);

      return { result, close };
    },
    []
  );

  return (
    <DrawerProviderContext.Provider value={{ _open }}>
      {children}
      {stack.map((entry, index) => {
        const isTopmost = index === stack.length - 1;
        return (
          <Drawer
            key={entry.id}
            open
            closeOnOverlayClick={entry.dismissible && isTopmost}
            closeOnEscape={entry.dismissible && isTopmost}
            onOpenChange={(open) => {
              if (!open) entry.close(entry.defaultCloseValue);
            }}
          >
            <DrawerContent side={entry.side} size={entry.size}>
              {entry.renderContent(entry.close)}
            </DrawerContent>
          </Drawer>
        );
      })}
    </DrawerProviderContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// useDrawer
// ---------------------------------------------------------------------------

export interface DrawerHandle<T = unknown> {
  /** Promise that resolves with the value passed to `close(value)`, or `null` on dismissal. */
  result: Promise<T | null>;
  /** Programmatically close the drawer (resolves the promise with `null`). */
  close: (value?: T) => void;
}

export interface DrawerOpenOptions<T = unknown> {
  /** Edge the drawer slides in from. Default: `'right'`. */
  side?: DrawerSide;
  /** Drawer size. Default: `'md'`. */
  size?: DrawerSize;
  /**
   * When `false`, Escape and backdrop click do not close the drawer.
   * Default: `true`.
   */
  dismissible?: boolean;
  /**
   * Render function receiving a `close` callback. Call `close(value)` to
   * resolve the promise and unmount the drawer.
   *
   * The drawer comes pre-wrapped in `<Drawer>` and `<DrawerContent>` by the
   * provider; return `<DrawerHeader>`, `<DrawerBody>`, `<DrawerFooter>` etc.
   */
  content: (props: { close: (value?: T) => void }) => React.ReactNode;
}

export interface DrawerApi {
  open: <T = unknown>(options: DrawerOpenOptions<T>) => DrawerHandle<T>;
}

/** Returns an object with an `open` method to imperatively show a drawer. */
export function useDrawer(): DrawerApi {
  const { _open } = useDrawerProviderContext();

  const open = useCallback(
    <T = unknown,>(options: DrawerOpenOptions<T>): DrawerHandle<T> => {
      const handle = _open({
        side: options.side,
        size: options.size,
        dismissible: options.dismissible,
        defaultCloseValue: null,
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

// ---------------------------------------------------------------------------
// Convenience re-exports so consumers can build drawer content easily.
// ---------------------------------------------------------------------------
export { DrawerHeader, DrawerTitle, DrawerBody, DrawerFooter };
