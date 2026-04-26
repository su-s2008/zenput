import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { classNames } from '../../../utils';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { Portal } from '../../Portal';
import { useEscapeKey } from '../internal/useEscapeKey';
import { useClickOutside } from '../internal/useClickOutside';
import { assignRef } from '../internal/assignRef';
import { warnOnce } from '../../../utils/warnOnce';
import { useOverlayPanelState } from '../internal/useOverlayPanelState';
import type { OverlayPanelState } from '../internal/useOverlayPanelState';
import styles from './Dialog.module.css';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

type DialogContextValue = OverlayPanelState;

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext(component: string): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used inside <Dialog>.`);
  }
  return ctx;
}

export interface DialogProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the open state changes (both controlled and uncontrolled). */
  onOpenChange?: (open: boolean) => void;
  /** If `false`, clicking the backdrop does not close the dialog. Default: `true`. */
  closeOnOverlayClick?: boolean;
  /** If `false`, pressing Escape does not close the dialog. Default: `true`. */
  closeOnEscape?: boolean;
  children: React.ReactNode;
}

/**
 * Root Dialog container. Holds open state and provides context to the
 * rest of the `<Dialog*>` parts.
 */
export function Dialog({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
}: DialogProps): React.ReactElement {
  const value = useOverlayPanelState({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
  });

  const behavior = useMemo(
    () => ({ closeOnOverlayClick, closeOnEscape }),
    [closeOnOverlayClick, closeOnEscape]
  );

  return (
    <DialogContext.Provider value={value}>
      <DialogBehaviorContext.Provider value={behavior}>{children}</DialogBehaviorContext.Provider>
    </DialogContext.Provider>
  );
}

interface DialogBehavior {
  closeOnOverlayClick: boolean;
  closeOnEscape: boolean;
}
const DialogBehaviorContext = createContext<DialogBehavior>({
  closeOnOverlayClick: true,
  closeOnEscape: true,
});

// ---------------------------------------------------------------------------
// DialogTrigger
// ---------------------------------------------------------------------------

export interface DialogTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-haspopup' | 'aria-expanded'
> {
  children: React.ReactNode;
}

/** Button that toggles the dialog open. Forwards ref to the underlying element. */
export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger({ onClick, type = 'button', ...rest }, forwardedRef) {
    const ctx = useDialogContext('DialogTrigger');
    const { setTriggerNode, open, contentId, setOpen } = ctx;

    const mergedRef = useCallback(
      (node: HTMLButtonElement | null) => {
        setTriggerNode(node);
        assignRef(forwardedRef, node);
      },
      [setTriggerNode, forwardedRef]
    );

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOpen(true);
      },
      [setOpen, onClick]
    );

    return (
      <button
        ref={mergedRef}
        type={type}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? contentId : undefined}
        onClick={handleClick}
        {...rest}
      />
    );
  }
);

// ---------------------------------------------------------------------------
// DialogContent
// ---------------------------------------------------------------------------

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Dialog size. Default: `'md'`. */
  size?: DialogSize;
  /** Additional class for the outer overlay (backdrop) element. */
  overlayClassName?: string;
  /**
   * Accessible label for the dialog when no `<DialogTitle>` is rendered.
   * Required if there is no `<DialogTitle>`.
   */
  'aria-label'?: string;
  children: React.ReactNode;
}

/**
 * Dialog panel rendered through a portal. Traps focus, closes on
 * Escape / backdrop click, and restores focus to the trigger on close.
 */
export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { size = 'md', className, overlayClassName, children, ...rest },
  forwardedRef
) {
  const ctx = useDialogContext('DialogContent');
  const behavior = useContext(DialogBehaviorContext);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef]
  );

  useFocusTrap({
    active: ctx.open,
    containerRef: contentRef,
    returnFocusRef: ctx.triggerRef,
    clickOutsideDeactivates: false,
  });

  const handleEscape = useCallback(() => {
    if (behavior.closeOnEscape) ctx.setOpen(false);
  }, [behavior.closeOnEscape, ctx]);
  useEscapeKey(ctx.open, handleEscape);

  // Clicking outside the content (i.e. on the backdrop) closes the
  // dialog. Using this hook instead of an onClick handler on the
  // overlay div keeps the backdrop free of interactive ARIA semantics.
  const handleOutside = useCallback(() => {
    if (behavior.closeOnOverlayClick) ctx.setOpen(false);
  }, [behavior.closeOnOverlayClick, ctx]);
  useClickOutside(ctx.open, [contentRef], handleOutside);

  // Dev-time warning: a `role="dialog"` / `aria-modal` node must have an
  // accessible name. Run this in an effect so any `<DialogTitle>` child
  // has had a chance to register first.
  const ariaLabel = (rest as { 'aria-label'?: string; 'aria-labelledby'?: string })['aria-label'];
  const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
  React.useEffect(() => {
    if (!ctx.open) return;
    // Defer to the next tick so that child <DialogTitle> effects (which
    // call `registerTitle(true)` -> state update) have a chance to
    // propagate and flip `hasTitle` before we decide to warn.
    const id = setTimeout(() => {
      if (ctx.open && !ctx.hasTitle && !ariaLabel && !ariaLabelledBy) {
        warnOnce(
          `zenput/DialogContent/no-accessible-name/${ctx.contentId}`,
          'Zenput <DialogContent>: no accessible name. Provide a <DialogTitle> (preferred), or pass an `aria-label`/`aria-labelledby` prop.'
        );
      }
    }, 0);
    return () => clearTimeout(id);
  }, [ctx.open, ctx.hasTitle, ctx.contentId, ariaLabel, ariaLabelledBy]);

  if (!ctx.open) return null;

  return (
    <Portal>
      <div className={classNames(styles.overlay, overlayClassName)} data-zp-dialog-overlay="">
        <div
          ref={mergedRef}
          role="dialog"
          aria-modal="true"
          id={ctx.contentId}
          aria-labelledby={ctx.hasTitle ? ctx.titleId : undefined}
          aria-describedby={ctx.hasDescription ? ctx.descriptionId : undefined}
          tabIndex={-1}
          className={classNames(styles.content, styles[`size-${size}`], className)}
          {...rest}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
});

// ---------------------------------------------------------------------------
// DialogHeader / DialogTitle / DialogDescription / DialogBody / DialogFooter / DialogClose
// ---------------------------------------------------------------------------

export type DialogSectionProps = React.HTMLAttributes<HTMLDivElement>;

export const DialogHeader = forwardRef<HTMLDivElement, DialogSectionProps>(function DialogHeader(
  { className, ...rest },
  ref
) {
  return <div ref={ref} className={classNames(styles.header, className)} {...rest} />;
});

export const DialogBody = forwardRef<HTMLDivElement, DialogSectionProps>(function DialogBody(
  { className, ...rest },
  ref
) {
  return <div ref={ref} className={classNames(styles.body, className)} {...rest} />;
});

export const DialogFooter = forwardRef<HTMLDivElement, DialogSectionProps>(function DialogFooter(
  { className, ...rest },
  ref
) {
  return <div ref={ref} className={classNames(styles.footer, className)} {...rest} />;
});

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** HTML heading level. Default: `'h2'`. */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(
  { as: Tag = 'h2', className, ...rest },
  ref
) {
  const ctx = useDialogContext('DialogTitle');
  const { registerTitle, titleId } = ctx;
  React.useEffect(() => {
    registerTitle(true);
    return () => registerTitle(false);
  }, [registerTitle]);
  return <Tag ref={ref} id={titleId} className={classNames(styles.title, className)} {...rest} />;
});

export type DialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ className, ...rest }, ref) {
    const ctx = useDialogContext('DialogDescription');
    const { registerDescription, descriptionId } = ctx;
    React.useEffect(() => {
      registerDescription(true);
      return () => registerDescription(false);
    }, [registerDescription]);
    return (
      <p
        ref={ref}
        id={descriptionId}
        className={classNames(styles.description, className)}
        {...rest}
      />
    );
  }
);

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

/** Closes the dialog when clicked. */
export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(
  { onClick, type = 'button', children, ...rest },
  ref
) {
  const ctx = useDialogContext('DialogClose');
  const { setOpen } = ctx;
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) setOpen(false);
    },
    [setOpen, onClick]
  );
  return (
    <button ref={ref} type={type} onClick={handleClick} {...rest}>
      {children}
    </button>
  );
});
