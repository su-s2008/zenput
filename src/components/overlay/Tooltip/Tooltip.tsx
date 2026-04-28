'use client';
import React, {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { classNames } from '../../../utils';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { Portal } from '../../Portal';
import { useIsomorphicLayoutEffect } from '../internal/useIsomorphicLayoutEffect';
import { assignRef } from '../internal/assignRef';
import { computePosition } from '../internal/computePosition';
import type { OverlaySide, OverlayAlign } from '../internal/computePosition';
import styles from './Tooltip.module.css';

export type TooltipSide = OverlaySide;
export type TooltipAlign = OverlayAlign;

// ---------------------------------------------------------------------------
// TooltipProvider — shares open/close delays across a subtree.
// ---------------------------------------------------------------------------

interface TooltipProviderValue {
  openDelay: number;
  closeDelay: number;
}
const TooltipProviderContext = createContext<TooltipProviderValue>({
  openDelay: 700,
  closeDelay: 150,
});

export interface TooltipProviderProps {
  /** Delay (ms) before the tooltip opens on pointer hover. Default: `700`. Focus opens the tooltip immediately. */
  openDelay?: number;
  /** Delay (ms) before the tooltip closes on pointer leave. Default: `150`. Blur closes the tooltip immediately. */
  closeDelay?: number;
  children: React.ReactNode;
}

export function TooltipProvider({
  openDelay = 700,
  closeDelay = 150,
  children,
}: TooltipProviderProps): React.ReactElement {
  const value = useMemo(() => ({ openDelay, closeDelay }), [openDelay, closeDelay]);
  return (
    <TooltipProviderContext.Provider value={value}>{children}</TooltipProviderContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Tooltip context
// ---------------------------------------------------------------------------

interface TooltipContextValue {
  open: boolean;
  openSoon: () => void;
  closeSoon: () => void;
  openNow: () => void;
  closeNow: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  setTriggerNode: (node: HTMLElement | null) => void;
  contentId: string;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext(component: string): TooltipContextValue {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Tooltip>.`);
  return ctx;
}

export interface TooltipProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Override the provider's open delay. */
  openDelay?: number;
  /** Override the provider's close delay. */
  closeDelay?: number;
  children: React.ReactNode;
}

/**
 * Root Tooltip container. Shows on hover of `<TooltipTrigger>` after
 * `openDelay`, opens immediately on focus, hides after `closeDelay` on
 * pointer leave, closes immediately on blur or Escape.
 */
export function Tooltip({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  openDelay,
  closeDelay,
  children,
}: TooltipProps): React.ReactElement {
  const providerValue = useContext(TooltipProviderContext);
  const effectiveOpenDelay = openDelay ?? providerValue.openDelay;
  const effectiveCloseDelay = closeDelay ?? providerValue.closeDelay;

  const { open, setOpen } = useDisclosure({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
  });

  const triggerRef = useRef<HTMLElement | null>(null);
  const contentId = useId();
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => clearTimers, [clearTimers]);

  const openSoon = useCallback(() => {
    clearTimers();
    if (effectiveOpenDelay <= 0) {
      setOpen(true);
      return;
    }
    openTimerRef.current = setTimeout(() => setOpen(true), effectiveOpenDelay);
  }, [clearTimers, effectiveOpenDelay, setOpen]);

  const closeSoon = useCallback(() => {
    clearTimers();
    if (effectiveCloseDelay <= 0) {
      setOpen(false);
      return;
    }
    closeTimerRef.current = setTimeout(() => setOpen(false), effectiveCloseDelay);
  }, [clearTimers, effectiveCloseDelay, setOpen]);

  const openNow = useCallback(() => {
    clearTimers();
    setOpen(true);
  }, [clearTimers, setOpen]);

  const closeNow = useCallback(() => {
    clearTimers();
    setOpen(false);
  }, [clearTimers, setOpen]);

  const setTriggerNode = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
  }, []);

  const value = useMemo<TooltipContextValue>(
    () => ({ open, openSoon, closeSoon, openNow, closeNow, triggerRef, setTriggerNode, contentId }),
    [open, openSoon, closeSoon, openNow, closeNow, setTriggerNode, contentId]
  );

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}

// ---------------------------------------------------------------------------
// TooltipTrigger
// ---------------------------------------------------------------------------

export interface TooltipTriggerProps {
  /**
   * A single child element. Event props and `aria-describedby` are
   * merged onto the child rather than wrapping it in a button, so the
   * trigger remains whatever element you pass (e.g. a Button).
   */
  children: React.ReactElement;
}

interface TriggerableProps {
  onPointerEnter?: React.PointerEventHandler;
  onPointerLeave?: React.PointerEventHandler;
  onFocus?: React.FocusEventHandler;
  onBlur?: React.FocusEventHandler;
  onKeyDown?: React.KeyboardEventHandler;
  'aria-describedby'?: string;
  ref?: React.Ref<HTMLElement>;
}

/**
 * Wraps a single child element with tooltip event handlers and a merged
 * `aria-describedby`. The child must accept a ref (either a native
 * element or a `forwardRef` component).
 */
export function TooltipTrigger({ children }: TooltipTriggerProps): React.ReactElement {
  const ctx = useTooltipContext('TooltipTrigger');
  const { setTriggerNode, open, contentId, openSoon, closeSoon, openNow, closeNow } = ctx;
  const child = Children.only(children);
  if (!isValidElement<TriggerableProps>(child)) {
    return child;
  }

  const childProps: TriggerableProps = child.props ?? {};
  // React 19 moved `ref` onto `props`. Read it there first and fall
  // back to `child.ref` only if props.ref is not present, so the trigger
  // continues to work on older versions too.
  const childRef = childProps.ref ?? (child as unknown as { ref?: React.Ref<HTMLElement> }).ref;

  const setRef = (node: HTMLElement | null): void => {
    setTriggerNode(node);
    if (typeof childRef === 'function') childRef(node);
    else if (childRef && 'current' in childRef) {
      (childRef as React.MutableRefObject<HTMLElement | null>).current = node;
    }
  };

  const existingDescribedBy = childProps['aria-describedby'];
  const mergedDescribedBy = open
    ? [existingDescribedBy, contentId].filter(Boolean).join(' ')
    : existingDescribedBy;

  const handlePointerEnter: React.PointerEventHandler = (e) => {
    childProps.onPointerEnter?.(e);
    openSoon();
  };
  const handlePointerLeave: React.PointerEventHandler = (e) => {
    childProps.onPointerLeave?.(e);
    closeSoon();
  };
  const handleFocus: React.FocusEventHandler = (e) => {
    childProps.onFocus?.(e);
    openNow();
  };
  const handleBlur: React.FocusEventHandler = (e) => {
    childProps.onBlur?.(e);
    closeNow();
  };
  const handleKeyDown: React.KeyboardEventHandler = (e) => {
    childProps.onKeyDown?.(e);
    if (e.key === 'Escape') closeNow();
  };

  return cloneElement(child, {
    ref: setRef,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    'aria-describedby': mergedDescribedBy,
  } as TriggerableProps);
}

// ---------------------------------------------------------------------------
// TooltipContent
// ---------------------------------------------------------------------------

export interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Preferred side relative to the trigger. Default: `'top'`. */
  side?: TooltipSide;
  /** Alignment along the side. Default: `'center'`. */
  align?: TooltipAlign;
  /** Gap (px) between trigger and content along the main axis. Default: `6`. */
  sideOffset?: number;
  /** Offset (px) along the cross (alignment) axis. Default: `0`. */
  alignOffset?: number;
  /** If `false`, renders inline instead of through a portal. Default: `true`. */
  withPortal?: boolean;
  children: React.ReactNode;
}

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent(
    {
      side = 'top',
      align = 'center',
      sideOffset = 6,
      alignOffset = 0,
      withPortal = true,
      className,
      children,
      onPointerEnter: userOnPointerEnter,
      onPointerLeave: userOnPointerLeave,
      style: userStyle,
      ...rest
    },
    forwardedRef
  ) {
    const ctx = useTooltipContext('TooltipContent');
    const { open, triggerRef, contentId, openNow, closeSoon } = ctx;
    const contentElRef = useRef<HTMLDivElement | null>(null);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        contentElRef.current = node;
        assignRef(forwardedRef, node);
      },
      [forwardedRef]
    );

    useIsomorphicLayoutEffect(() => {
      if (!open) return;
      const updatePosition = (): void => {
        const trigger = triggerRef.current;
        const content = contentElRef.current;
        if (!trigger || !content) return;
        setCoords(
          computePosition(
            trigger.getBoundingClientRect(),
            content.getBoundingClientRect(),
            side,
            align,
            sideOffset,
            alignOffset
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
    }, [open, triggerRef, side, align, sideOffset, alignOffset]);

    if (!open) return null;

    // Merge consumer handlers with the internal "hover-sticky" handlers
    // so the tooltip still stays open while the pointer is over it.
    const handlePointerEnter: React.PointerEventHandler<HTMLDivElement> = (e) => {
      userOnPointerEnter?.(e);
      openNow();
    };
    const handlePointerLeave: React.PointerEventHandler<HTMLDivElement> = (e) => {
      userOnPointerLeave?.(e);
      closeSoon();
    };

    // Internal positioning style is authoritative: it is spread last
    // so caller `style` cannot overwrite top/left/position/visibility.
    const positionStyle: React.CSSProperties = {
      ...userStyle,
      position: 'fixed',
      top: coords?.top ?? -9999,
      left: coords?.left ?? -9999,
      visibility: coords ? 'visible' : 'hidden',
      pointerEvents: 'auto',
    };

    const content = (
      <div
        {...rest}
        ref={mergedRef}
        role="tooltip"
        id={contentId}
        data-side={side}
        data-align={align}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={positionStyle}
        className={classNames(styles.content, className)}
      >
        {children}
      </div>
    );

    if (withPortal) return <Portal>{content}</Portal>;
    return content;
  }
);
