import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '../Dialog';
import type { DialogSize } from '../Dialog';
import { Button } from '../../actions/Button';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

let _idCounter = 0;
function genId(): string {
  return `zdlg-${++_idCounter}`;
}

/**
 * Sentinel used internally by `close()` to detect "called with no argument"
 * vs "called with explicit `undefined`". Never exported.
 */
const _CLOSE_DEFAULT = Symbol('close-default');

interface StackEntry {
  id: string;
  size: DialogSize;
  dismissible: boolean;
  /** Default value resolved when the dialog is dismissed via Escape/backdrop. */
  defaultCloseValue: unknown;
  renderContent: (close: (value?: unknown) => void) => React.ReactNode;
  /** Pre-built close function — used directly in render without accessing refs. */
  close: (value?: unknown) => void;
}

function removeStackEntryById(stack: StackEntry[], id: string): StackEntry[] {
  return stack.filter((e) => e.id !== id);
}

interface ProviderContextValue {
  _open: (opts: {
    size?: DialogSize;
    dismissible?: boolean;
    defaultCloseValue?: unknown;
    content: (close: (value?: unknown) => void) => React.ReactNode;
  }) => { result: Promise<unknown>; close: (value?: unknown) => void };
}

const DialogProviderContext = createContext<ProviderContextValue | null>(null);

function useDialogProviderContext(): ProviderContextValue {
  const ctx = useContext(DialogProviderContext);
  if (!ctx) {
    throw new Error(
      'useDialog / useConfirm / usePrompt / useAlert must be used inside <DialogProvider>.'
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// DialogProvider
// ---------------------------------------------------------------------------

export interface DialogProviderProps {
  children: React.ReactNode;
}

/**
 * Imperative overlay host. Wrap your application (or a subtree) with
 * `<DialogProvider>` once, then call `useConfirm()`, `usePrompt()`,
 * `useAlert()`, or the generic `useDialog()` anywhere inside the tree to
 * open dialogs without managing `open` state or JSX placement.
 */
export function DialogProvider({ children }: DialogProviderProps): React.ReactElement {
  const [stack, setStack] = useState<StackEntry[]>([]);

  // Track {resolve, defaultCloseValue} keyed by id for unmount cleanup.
  const pendingRef = useRef(
    new Map<string, { resolve: (v: unknown) => void; defaultCloseValue: unknown }>()
  );

  useEffect(() => {
    // Capture the Map reference at effect-registration time so the
    // cleanup closure always points to the same object.
    const pending = pendingRef.current;
    return () => {
      // Resolve each pending promise with its own dismissed value when the
      // provider unmounts — avoids calling setStack (state update warning) and
      // correctly honours per-hook contracts (confirm → false, alert → void, …).
      pending.forEach(({ resolve, defaultCloseValue }) => {
        try {
          resolve(defaultCloseValue);
        } catch {
          /* swallow */
        }
      });
      pending.clear();
    };
  }, []);

  const _open = useCallback(
    (opts: {
      size?: DialogSize;
      dismissible?: boolean;
      defaultCloseValue?: unknown;
      content: (close: (value?: unknown) => void) => React.ReactNode;
    }) => {
      const id = genId();
      const returnFocusEl =
        typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;

      let resolveFn: (value: unknown) => void = () => undefined;
      const result = new Promise<unknown>((res) => {
        resolveFn = res;
      });

      // Use key-presence to allow deliberate `undefined` as a dismissed value
      // (e.g. useAlert passes defaultCloseValue: undefined).
      const defaultCloseValue = 'defaultCloseValue' in opts ? opts.defaultCloseValue : null;

      const close = (value: unknown = _CLOSE_DEFAULT): void => {
        setStack((prev) => removeStackEntryById(prev, id));
        pendingRef.current.delete(id);
        // When called with no argument, resolve to the hook-specific dismissed
        // value (e.g. false for confirm, null for prompt, undefined for alert).
        // An explicit argument — even `undefined` — is forwarded as-is.
        resolveFn(value === _CLOSE_DEFAULT ? defaultCloseValue : value);
        requestAnimationFrame(() => {
          if (returnFocusEl instanceof HTMLElement) returnFocusEl.focus();
        });
      };

      pendingRef.current.set(id, { resolve: resolveFn, defaultCloseValue });

      const entry: StackEntry = {
        id,
        size: opts.size ?? 'md',
        dismissible: opts.dismissible ?? true,
        defaultCloseValue,
        renderContent: opts.content,
        close,
      };

      setStack((prev) => [...prev, entry]);

      return { result, close };
    },
    []
  );

  const contextValue: ProviderContextValue = { _open };

  return (
    <DialogProviderContext.Provider value={contextValue}>
      {children}
      {stack.map((entry, index) => {
        const isTopmost = index === stack.length - 1;
        return (
          <Dialog
            key={entry.id}
            open
            closeOnOverlayClick={entry.dismissible && isTopmost}
            closeOnEscape={entry.dismissible && isTopmost}
            onOpenChange={(open) => {
              if (!open) entry.close(entry.defaultCloseValue);
            }}
          >
            <DialogContent size={entry.size}>{entry.renderContent(entry.close)}</DialogContent>
          </Dialog>
        );
      })}
    </DialogProviderContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// useDialog — generic imperative dialog
// ---------------------------------------------------------------------------

export interface DialogHandle<T = unknown> {
  /** Promise that resolves with the value passed to `close(value)`, or `null` on dismissal. */
  result: Promise<T | null>;
  /** Programmatically close the dialog (resolves the promise with `null`). */
  close: (value?: T) => void;
}

export interface DialogOpenOptions<T = unknown> {
  /** Dialog size. Default: `'md'`. */
  size?: DialogSize;
  /**
   * When `false`, Escape and backdrop click do not close the dialog.
   * Default: `true`.
   */
  dismissible?: boolean;
  /**
   * Render function receiving a `close` callback. Call `close(value)` to
   * resolve the promise and unmount the dialog.
   */
  content: (props: { close: (value?: T) => void }) => React.ReactNode;
}

export interface DialogApi {
  open: <T = unknown>(options: DialogOpenOptions<T>) => DialogHandle<T>;
}

/** Returns an object with an `open` method to imperatively show a dialog. */
export function useDialog(): DialogApi {
  const { _open } = useDialogProviderContext();

  const open = useCallback(
    <T = unknown,>(options: DialogOpenOptions<T>): DialogHandle<T> => {
      const handle = _open({
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
// useConfirm
// ---------------------------------------------------------------------------

export interface ConfirmOptions {
  /** Dialog title. Default: `'Confirm'`. */
  title?: string;
  /** Descriptive text below the title. */
  description?: string;
  /** Confirm button label. Default: `'Confirm'`. */
  confirmLabel?: string;
  /** Cancel button label. Default: `'Cancel'`. */
  cancelLabel?: string;
  /**
   * When `true`, the confirm button uses the `danger` variant.
   * Default: `false`.
   */
  destructive?: boolean;
  /**
   * When `false`, Escape and backdrop click do not close the dialog.
   * Default: `true`.
   */
  dismissible?: boolean;
}

/**
 * Returns a function that opens a confirmation dialog and resolves to
 * `true` (confirmed) or `false` (cancelled / dismissed).
 */
export function useConfirm(): (options?: ConfirmOptions) => Promise<boolean> {
  const { _open } = useDialogProviderContext();

  return useCallback(
    (options: ConfirmOptions = {}): Promise<boolean> => {
      const {
        title = 'Confirm',
        description,
        confirmLabel = 'Confirm',
        cancelLabel = 'Cancel',
        destructive = false,
        dismissible = true,
      } = options;

      const { result } = _open({
        dismissible,
        defaultCloseValue: false,
        content: (close) => (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => close(false)}>
                {cancelLabel}
              </Button>
              <Button variant={destructive ? 'danger' : 'primary'} onClick={() => close(true)}>
                {confirmLabel}
              </Button>
            </DialogFooter>
          </>
        ),
      });

      return result as Promise<boolean>;
    },
    [_open]
  );
}

// ---------------------------------------------------------------------------
// usePrompt
// ---------------------------------------------------------------------------

export interface PromptOptions {
  /** Dialog title. Default: `'Enter a value'`. */
  title?: string;
  /** Label for the text input. */
  label?: string;
  /** Pre-filled value. Default: `''`. */
  defaultValue?: string;
  /**
   * Optional validation function. Return `true` to pass, a string to show
   * as an error, or `false` to block submission with a generic error message.
   */
  validate?: (value: string) => boolean | string;
  /** Submit button label. Default: `'OK'`. */
  confirmLabel?: string;
  /** Cancel button label. Default: `'Cancel'`. */
  cancelLabel?: string;
  /**
   * When `false`, Escape and backdrop click do not close the dialog.
   * Default: `true`.
   */
  dismissible?: boolean;
}

function PromptDialogBody({
  label,
  defaultValue,
  validate,
  confirmLabel,
  cancelLabel,
  close,
}: {
  label?: string;
  defaultValue: string;
  validate?: (v: string) => boolean | string;
  confirmLabel: string;
  cancelLabel: string;
  close: (value: unknown) => void;
}): React.ReactElement {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const reactId = useId();
  const inputId = `zdp-prompt-input-${reactId}`;
  const errorId = `zdp-prompt-error-${reactId}`;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (): void => {
    if (validate) {
      const result = validate(value);
      if (result !== true) {
        setError(typeof result === 'string' ? result : 'Invalid value');
        return;
      }
    }
    close(value);
  };

  return (
    <>
      <DialogBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zp-space-2)' }}>
          {label && (
            <label
              htmlFor={inputId}
              style={{
                fontSize: 'var(--zp-font-size-sm)',
                fontWeight: 'var(--zp-font-weight-medium)',
                color: 'var(--zp-color-text-primary)',
              }}
            >
              {label}
            </label>
          )}
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={value}
            aria-label={label ? undefined : 'Value'}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => {
              setValue(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            style={{
              padding: 'var(--zp-space-2) var(--zp-space-3)',
              border: `var(--zp-border-width-1) solid ${error ? 'var(--zp-color-error)' : 'var(--zp-color-border-default)'}`,
              borderRadius: 'var(--zp-radius-md)',
              fontSize: 'var(--zp-font-size-sm)',
              color: 'var(--zp-color-text-primary)',
              background: 'var(--zp-color-surface)',
              width: '100%',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <span
              id={errorId}
              role="alert"
              style={{ fontSize: 'var(--zp-font-size-xs)', color: 'var(--zp-color-error)' }}
            >
              {error}
            </span>
          )}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={() => close(null)}>
          {cancelLabel}
        </Button>
        <Button onClick={handleSubmit}>{confirmLabel}</Button>
      </DialogFooter>
    </>
  );
}

/**
 * Returns a function that opens a prompt dialog and resolves to the
 * entered string, or `null` if the user cancels.
 */
export function usePrompt(): (options?: PromptOptions) => Promise<string | null> {
  const { _open } = useDialogProviderContext();

  return useCallback(
    (options: PromptOptions = {}): Promise<string | null> => {
      const {
        title = 'Enter a value',
        label,
        defaultValue = '',
        validate,
        confirmLabel = 'OK',
        cancelLabel = 'Cancel',
        dismissible = true,
      } = options;

      const { result } = _open({
        dismissible,
        defaultCloseValue: null,
        content: (close) => (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <PromptDialogBody
              label={label}
              defaultValue={defaultValue}
              validate={validate}
              confirmLabel={confirmLabel}
              cancelLabel={cancelLabel}
              close={close}
            />
          </>
        ),
      });

      return result as Promise<string | null>;
    },
    [_open]
  );
}

// ---------------------------------------------------------------------------
// useAlert
// ---------------------------------------------------------------------------

export interface AlertOptions {
  /** Dialog title. Default: `'Alert'`. */
  title?: string;
  /** Descriptive text below the title. */
  description?: string;
  /** Dismiss button label. Default: `'OK'`. */
  confirmLabel?: string;
  /**
   * When `false`, Escape and backdrop click do not close the dialog.
   * Default: `true`.
   */
  dismissible?: boolean;
}

/**
 * Returns a function that opens an alert dialog and resolves when the user
 * dismisses it.
 */
export function useAlert(): (options?: AlertOptions) => Promise<void> {
  const { _open } = useDialogProviderContext();

  return useCallback(
    (options: AlertOptions = {}): Promise<void> => {
      const { title = 'Alert', description, confirmLabel = 'OK', dismissible = true } = options;

      const { result } = _open({
        dismissible,
        defaultCloseValue: undefined,
        content: (close) => (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => close()}>{confirmLabel}</Button>
            </DialogFooter>
          </>
        ),
      });

      return result as Promise<void>;
    },
    [_open]
  );
}
