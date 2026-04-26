import React, {
  createContext,
  forwardRef,
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
import { useEscapeKey } from '../internal/useEscapeKey';
import { useClickOutside } from '../internal/useClickOutside';
import { useIsomorphicLayoutEffect } from '../internal/useIsomorphicLayoutEffect';
import { assignRef } from '../internal/assignRef';
import styles from './Popover.module.css';

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

interface PopoverContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  setTriggerNode: (node: HTMLElement | null) => void;
  contentRef: React.RefObject<HTMLElement | null>;
  setContentNode: (node: HTMLElement | null) => void;
  contentId: string;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string): PopoverContextValue {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Popover>.`);
  return ctx;
}

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * Root Popover container. Floating panel anchored to its trigger that
 * closes on outside click, Escape, or a second trigger click.
 */
export function Popover({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  children,
}: PopoverProps): React.ReactElement {
  const { open, setOpen } = useDisclosure({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
  });
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const contentId = useId();

  const setOpenBool = useCallback((next: boolean) => setOpen(next), [setOpen]);
  const setTriggerNode = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
  }, []);
  const setContentNode = useCallback((node: HTMLElement | null) => {
    contentRef.current = node;
  }, []);

  const value = useMemo<PopoverContextValue>(
    () => ({
      open,
      setOpen: setOpenBool,
      triggerRef,
      setTriggerNode,
      contentRef,
      setContentNode,
      contentId,
    }),
    [open, setOpenBool, setTriggerNode, setContentNode, contentId]
  );

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

// ---------------------------------------------------------------------------
// PopoverTrigger
// ---------------------------------------------------------------------------

export interface PopoverTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-haspopup' | 'aria-expanded'
> {
  children: React.ReactNode;
}

export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  function PopoverTrigger({ onClick, type = 'button', ...rest }, forwardedRef) {
    const ctx = usePopoverContext('PopoverTrigger');
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
        if (!e.defaultPrevented) setOpen(!open);
      },
      [setOpen, open, onClick]
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
// PopoverContent
// ---------------------------------------------------------------------------

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Preferred side relative to the trigger. Default: `'bottom'`. */
  side?: PopoverSide;
  /** Alignment along the side. Default: `'center'`. */
  align?: PopoverAlign;
  /** Gap between trigger and content in px. Default: `8`. */
  sideOffset?: number;
  /** Additional px offset along the main axis of alignment. Default: `0`. */
  alignOffset?: number;
  /** Portal into document.body instead of rendering inline. Default: `true`. */
  withPortal?: boolean;
  /** Accessible label when no visible label element is provided. */
  'aria-label'?: string;
  children: React.ReactNode;
}

/**
 * Compute absolute `top`/`left` from the trigger rect and side/align.
 * Coordinates are in viewport space; combined with `position: fixed` on
 * the content element this anchors the popover to the trigger.
 */
function computePosition(
  trigger: DOMRect,
  content: DOMRect,
  side: PopoverSide,
  align: PopoverAlign,
  sideOffset: number,
  alignOffset: number
): { top: number; left: number } {
  let top = 0;
  let left = 0;

  if (side === 'top' || side === 'bottom') {
    top = side === 'top' ? trigger.top - content.height - sideOffset : trigger.bottom + sideOffset;
    if (align === 'start') left = trigger.left + alignOffset;
    else if (align === 'end') left = trigger.right - content.width - alignOffset;
    else left = trigger.left + trigger.width / 2 - content.width / 2 + alignOffset;
  } else {
    left = side === 'left' ? trigger.left - content.width - sideOffset : trigger.right + sideOffset;
    if (align === 'start') top = trigger.top + alignOffset;
    else if (align === 'end') top = trigger.bottom - content.height - alignOffset;
    else top = trigger.top + trigger.height / 2 - content.height / 2 + alignOffset;
  }

  // Clamp to viewport to avoid overflow.
  const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
  left = Math.max(4, Math.min(left, vw - content.width - 4));
  top = Math.max(4, Math.min(top, vh - content.height - 4));

  return { top, left };
}

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(
    {
      side = 'bottom',
      align = 'center',
      sideOffset = 8,
      alignOffset = 0,
      withPortal = true,
      className,
      children,
      ...rest
    },
    forwardedRef
  ) {
    const ctx = usePopoverContext('PopoverContent');
    const { setContentNode, open, triggerRef, setOpen, contentId, contentRef } = ctx;
    const contentElRef = useRef<HTMLDivElement | null>(null);
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        contentElRef.current = node;
        setContentNode(node);
        assignRef(forwardedRef, node);
      },
      [setContentNode, forwardedRef]
    );

    // Position the popover relative to the trigger while open. Recomputes
    // on scroll/resize and on open. Only runs while `open` is true; when
    // closed the component returns null so stale `coords` are irrelevant.
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

    const handleEscape = useCallback(() => {
      setOpen(false);
      // Return focus to the trigger when closing via Escape.
      const trigger = triggerRef.current;
      if (trigger instanceof HTMLElement) trigger.focus();
    }, [setOpen, triggerRef]);
    useEscapeKey(open, handleEscape);

    const handleOutside = useCallback(() => {
      setOpen(false);
    }, [setOpen]);
    useClickOutside(open, [triggerRef, contentRef], handleOutside);

    if (!open) return null;

    const content = (
      <div
        ref={mergedRef}
        role="dialog"
        id={contentId}
        tabIndex={-1}
        data-side={side}
        data-align={align}
        style={{
          position: 'fixed',
          top: coords?.top ?? -9999,
          left: coords?.left ?? -9999,
          visibility: coords ? 'visible' : 'hidden',
        }}
        className={classNames(styles.content, className)}
        {...rest}
      >
        {children}
      </div>
    );

    return withPortal ? <Portal>{content}</Portal> : content;
  }
);
