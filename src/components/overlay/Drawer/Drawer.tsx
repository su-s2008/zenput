'use client';
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
import styles from './Drawer.module.css';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

type DrawerContextValue = OverlayPanelState;

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawerContext(component: string): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used inside <Drawer>.`);
  }
  return ctx;
}

interface DrawerBehavior {
  closeOnOverlayClick: boolean;
  closeOnEscape: boolean;
}
const DrawerBehaviorContext = createContext<DrawerBehavior>({
  closeOnOverlayClick: true,
  closeOnEscape: true,
});

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
}

/** Root Drawer container. Similar to Dialog but rendered off-canvas. */
export function Drawer({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
}: DrawerProps): React.ReactElement {
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
    <DrawerContext.Provider value={value}>
      <DrawerBehaviorContext.Provider value={behavior}>{children}</DrawerBehaviorContext.Provider>
    </DrawerContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// DrawerTrigger
// ---------------------------------------------------------------------------

export interface DrawerTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-haspopup' | 'aria-expanded'
> {
  children: React.ReactNode;
}

export const DrawerTrigger = forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  function DrawerTrigger({ onClick, type = 'button', ...rest }, forwardedRef) {
    const ctx = useDrawerContext('DrawerTrigger');
    const { setTriggerNode, setOpen, open, contentId } = ctx;
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
// DrawerContent
// ---------------------------------------------------------------------------

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Edge the drawer slides in from. Default: `'right'`. */
  side?: DrawerSide;
  /** Drawer size. Default: `'md'`. */
  size?: DrawerSize;
  overlayClassName?: string;
  'aria-label'?: string;
  children: React.ReactNode;
}

export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(function DrawerContent(
  { side = 'right', size = 'md', className, overlayClassName, children, ...rest },
  forwardedRef
) {
  const ctx = useDrawerContext('DrawerContent');
  const behavior = useContext(DrawerBehaviorContext);
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

  const handleOutside = useCallback(() => {
    if (behavior.closeOnOverlayClick) ctx.setOpen(false);
  }, [behavior.closeOnOverlayClick, ctx]);
  useClickOutside(ctx.open, [contentRef], handleOutside);

  // Dev-time warning: a `role="dialog"` / `aria-modal` node must have an
  // accessible name. Mirror the check in <DialogContent>; run in an
  // effect so any <DrawerTitle> child has registered first.
  const ariaLabel = (rest as { 'aria-label'?: string; 'aria-labelledby'?: string })['aria-label'];
  const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
  React.useEffect(() => {
    if (!ctx.open) return;
    const id = setTimeout(() => {
      if (ctx.open && !ctx.hasTitle && !ariaLabel && !ariaLabelledBy) {
        warnOnce(
          `zenput/DrawerContent/no-accessible-name/${ctx.contentId}`,
          'Zenput <DrawerContent>: no accessible name. Provide a <DrawerTitle> (preferred), or pass an `aria-label`/`aria-labelledby` prop.'
        );
      }
    }, 0);
    return () => clearTimeout(id);
  }, [ctx.open, ctx.hasTitle, ctx.contentId, ariaLabel, ariaLabelledBy]);

  if (!ctx.open) return null;

  return (
    <Portal>
      <div
        className={classNames(styles.overlay, overlayClassName)}
        data-zp-drawer-overlay=""
        data-side={side}
      >
        <div
          ref={mergedRef}
          role="dialog"
          aria-modal="true"
          id={ctx.contentId}
          aria-labelledby={ctx.hasTitle ? ctx.titleId : undefined}
          aria-describedby={ctx.hasDescription ? ctx.descriptionId : undefined}
          tabIndex={-1}
          data-side={side}
          className={classNames(
            styles.content,
            styles[`side-${side}`],
            styles[`size-${size}`],
            className
          )}
          {...rest}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
});

// ---------------------------------------------------------------------------
// Sub-parts (mirror Dialog)
// ---------------------------------------------------------------------------

export type DrawerSectionProps = React.HTMLAttributes<HTMLDivElement>;

export const DrawerHeader = forwardRef<HTMLDivElement, DrawerSectionProps>(function DrawerHeader(
  { className, ...rest },
  ref
) {
  return <div ref={ref} className={classNames(styles.header, className)} {...rest} />;
});

export const DrawerBody = forwardRef<HTMLDivElement, DrawerSectionProps>(function DrawerBody(
  { className, ...rest },
  ref
) {
  return <div ref={ref} className={classNames(styles.body, className)} {...rest} />;
});

export const DrawerFooter = forwardRef<HTMLDivElement, DrawerSectionProps>(function DrawerFooter(
  { className, ...rest },
  ref
) {
  return <div ref={ref} className={classNames(styles.footer, className)} {...rest} />;
});

export interface DrawerTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const DrawerTitle = forwardRef<HTMLHeadingElement, DrawerTitleProps>(function DrawerTitle(
  { as: Tag = 'h2', className, ...rest },
  ref
) {
  const ctx = useDrawerContext('DrawerTitle');
  const { registerTitle, titleId } = ctx;
  React.useEffect(() => {
    registerTitle(true);
    return () => registerTitle(false);
  }, [registerTitle]);
  return <Tag ref={ref} id={titleId} className={classNames(styles.title, className)} {...rest} />;
});

export type DrawerDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const DrawerDescription = forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  function DrawerDescription({ className, ...rest }, ref) {
    const ctx = useDrawerContext('DrawerDescription');
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

export interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const DrawerClose = forwardRef<HTMLButtonElement, DrawerCloseProps>(function DrawerClose(
  { onClick, type = 'button', children, ...rest },
  ref
) {
  const ctx = useDrawerContext('DrawerClose');
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
