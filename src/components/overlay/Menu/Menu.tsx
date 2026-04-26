import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
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
import { getMenuItems, isOutsideAll } from '../internal/menuUtils';
import { useMenuKeyboardNav } from '../internal/useMenuKeyboardNav';
import styles from './Menu.module.css';

export type MenuSide = 'top' | 'bottom' | 'left' | 'right';
export type MenuAlign = 'start' | 'center' | 'end';

interface MenuContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  setTriggerNode: (node: HTMLElement | null) => void;
  contentId: string;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext(component: string): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Menu>.`);
  return ctx;
}

interface MenuSubContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  setTriggerNode: (node: HTMLElement | null) => void;
  contentId: string;
}

const MenuSubContext = createContext<MenuSubContextValue | null>(null);

interface MenuRadioGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const MenuRadioGroupContext = createContext<MenuRadioGroupContextValue | null>(null);

function computePosition(
  trigger: DOMRect,
  content: DOMRect,
  side: MenuSide,
  align: MenuAlign,
  sideOffset: number,
  alignOffset: number
): { top: number; left: number } {
  let top = 0;
  let left = 0;

  if (side === 'top' || side === 'bottom') {
    top =
      side === 'top'
        ? trigger.top - content.height - sideOffset
        : trigger.bottom + sideOffset;
    if (align === 'start') left = trigger.left + alignOffset;
    else if (align === 'end') left = trigger.right - content.width - alignOffset;
    else left = trigger.left + trigger.width / 2 - content.width / 2 + alignOffset;
  } else {
    left =
      side === 'left'
        ? trigger.left - content.width - sideOffset
        : trigger.right + sideOffset;
    if (align === 'start') top = trigger.top + alignOffset;
    else if (align === 'end') top = trigger.bottom - content.height - alignOffset;
    else top = trigger.top + trigger.height / 2 - content.height / 2 + alignOffset;
  }

  const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
  left = Math.max(4, Math.min(left, vw - content.width - 4));
  top = Math.max(4, Math.min(top, vh - content.height - 4));

  return { top, left };
}

export interface MenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Menu({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  children,
}: MenuProps): React.ReactElement {
  const { open, setOpen } = useDisclosure({ open: controlledOpen, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentId = useId();

  const setOpenBool = useCallback((next: boolean) => setOpen(next), [setOpen]);
  const setTriggerNode = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
  }, []);

  const value = useMemo<MenuContextValue>(
    () => ({ open, setOpen: setOpenBool, triggerRef, setTriggerNode, contentId }),
    [open, setOpenBool, setTriggerNode, contentId]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export interface MenuTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-haspopup' | 'aria-expanded'> {
  children: React.ReactNode;
}

export const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(
  function MenuTrigger({ onClick, type = 'button', ...rest }, forwardedRef) {
    const ctx = useMenuContext('MenuTrigger');
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
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? contentId : undefined}
        onClick={handleClick}
        {...rest}
      />
    );
  }
);

export interface MenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: MenuSide;
  align?: MenuAlign;
  sideOffset?: number;
  alignOffset?: number;
  withPortal?: boolean;
  'aria-label'?: string;
  children: React.ReactNode;
}

export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(
  function MenuContent(
    {
      side = 'bottom',
      align = 'start',
      sideOffset = 4,
      alignOffset = 0,
      withPortal = true,
      className,
      children,
      ...rest
    },
    forwardedRef
  ) {
    const ctx = useMenuContext('MenuContent');
    const { open, setOpen, triggerRef, contentId } = ctx;
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

    useEffect(() => {
      if (!open) return;
      const rafId = requestAnimationFrame(() => {
        const el = contentElRef.current;
        if (!el) return;
        const items = getMenuItems(el);
        if (items.length > 0) items[0].focus();
      });
      return () => cancelAnimationFrame(rafId);
    }, [open]);

    useEffect(() => {
      if (!open) return;
      const handleMouseDown = (e: MouseEvent) => {
        const target = e.target as Node;
        if (isOutsideAll(target, [contentElRef.current, triggerRef.current])) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('touchstart', handleMouseDown as EventListener);
      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('touchstart', handleMouseDown as EventListener);
      };
    }, [open, setOpen, triggerRef]);

    const handleClose = useCallback(() => {
      setOpen(false);
      triggerRef.current?.focus();
    }, [setOpen, triggerRef]);

    const handleKeyDown = useMenuKeyboardNav({
      containerRef: contentElRef,
      onTab: handleClose,
      onEscape: handleClose,
    });

    if (!open) return null;

    const content = (
      <div
        ref={mergedRef}
        role="menu"
        id={contentId}
        tabIndex={-1}
        style={{
          position: 'fixed',
          top: coords?.top ?? -9999,
          left: coords?.left ?? -9999,
          visibility: coords ? 'visible' : 'hidden',
        }}
        className={classNames(styles.content, className)}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </div>
    );

    return withPortal ? <Portal>{content}</Portal> : content;
  }
);

export interface MenuItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  disabled?: boolean;
  destructive?: boolean;
  leftIcon?: React.ReactNode;
  onSelect?: () => void;
  children?: React.ReactNode;
}

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem({ disabled, destructive, leftIcon, onSelect, onClick, className, children, ...rest }, ref) {
    const ctx = useContext(MenuContext);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        onClick?.(e);
        if (!e.defaultPrevented) {
          onSelect?.();
          ctx?.setOpen(false);
          ctx?.triggerRef.current?.focus();
        }
      },
      [disabled, onClick, onSelect, ctx]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!disabled) {
            onSelect?.();
            ctx?.setOpen(false);
            ctx?.triggerRef.current?.focus();
          }
        }
      },
      [disabled, onSelect, ctx]
    );

    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={-1}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? '' : undefined}
        className={classNames(
          styles.item,
          destructive && styles.itemDestructive,
          disabled && styles.itemDisabled,
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {leftIcon && <span className={styles.itemIcon}>{leftIcon}</span>}
        {children}
      </div>
    );
  }
);

export type MenuSeparatorProps = React.HTMLAttributes<HTMLHRElement>;

export const MenuSeparator = forwardRef<HTMLHRElement, MenuSeparatorProps>(
  function MenuSeparator({ className, ...rest }, ref) {
    return <hr ref={ref} className={classNames(styles.separator, className)} {...rest} />;
  }
);

export type MenuLabelProps = React.HTMLAttributes<HTMLDivElement>;

export const MenuLabel = forwardRef<HTMLDivElement, MenuLabelProps>(
  function MenuLabel({ className, ...rest }, ref) {
    return <div ref={ref} role="presentation" className={classNames(styles.label, className)} {...rest} />;
  }
);

export interface MenuCheckboxItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const MenuCheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItemProps>(
  function MenuCheckboxItem({ checked, onCheckedChange, disabled, onClick, className, children, ...rest }, ref) {
    const ctx = useContext(MenuContext);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        onClick?.(e);
        if (!e.defaultPrevented) {
          onCheckedChange?.(!checked);
          ctx?.setOpen(false);
          ctx?.triggerRef.current?.focus();
        }
      },
      [disabled, onClick, onCheckedChange, checked, ctx]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!disabled) {
            onCheckedChange?.(!checked);
            ctx?.setOpen(false);
            ctx?.triggerRef.current?.focus();
          }
        }
      },
      [disabled, onCheckedChange, checked, ctx]
    );

    return (
      <div
        ref={ref}
        role="menuitemcheckbox"
        tabIndex={-1}
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? '' : undefined}
        className={classNames(styles.checkboxItem, disabled && styles.itemDisabled, className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <span className={styles.itemIndicator}>{checked ? '✓' : ''}</span>
        {children}
      </div>
    );
  }
);

export interface MenuRadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function MenuRadioGroup({ value, onValueChange, children }: MenuRadioGroupProps): React.ReactElement {
  const ctxValue = useMemo(
    () => ({ value, onValueChange }),
    [value, onValueChange]
  );
  return <MenuRadioGroupContext.Provider value={ctxValue}>{children}</MenuRadioGroupContext.Provider>;
}

export interface MenuRadioItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  value: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const MenuRadioItem = forwardRef<HTMLDivElement, MenuRadioItemProps>(
  function MenuRadioItem({ value, disabled, onClick, className, children, ...rest }, ref) {
    const ctx = useContext(MenuContext);
    const radioCtx = useContext(MenuRadioGroupContext);
    const checked = radioCtx?.value === value;

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        onClick?.(e);
        if (!e.defaultPrevented) {
          radioCtx?.onValueChange(value);
          ctx?.setOpen(false);
          ctx?.triggerRef.current?.focus();
        }
      },
      [disabled, onClick, radioCtx, value, ctx]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!disabled) {
            radioCtx?.onValueChange(value);
            ctx?.setOpen(false);
            ctx?.triggerRef.current?.focus();
          }
        }
      },
      [disabled, radioCtx, value, ctx]
    );

    return (
      <div
        ref={ref}
        role="menuitemradio"
        tabIndex={-1}
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? '' : undefined}
        className={classNames(styles.radioItem, disabled && styles.itemDisabled, className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <span className={styles.itemIndicator}>{checked ? '●' : ''}</span>
        {children}
      </div>
    );
  }
);

export interface MenuSubProps {
  children: React.ReactNode;
}

export function MenuSub({ children }: MenuSubProps): React.ReactElement {
  const { open, setOpen } = useDisclosure();
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentId = useId();

  const setOpenBool = useCallback((next: boolean) => setOpen(next), [setOpen]);
  const setTriggerNode = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
  }, []);

  const value = useMemo<MenuSubContextValue>(
    () => ({ open, setOpen: setOpenBool, triggerRef, setTriggerNode, contentId }),
    [open, setOpenBool, setTriggerNode, contentId]
  );

  return <MenuSubContext.Provider value={value}>{children}</MenuSubContext.Provider>;
}

export interface MenuSubTriggerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  disabled?: boolean;
  children?: React.ReactNode;
}

export const MenuSubTrigger = forwardRef<HTMLDivElement, MenuSubTriggerProps>(
  function MenuSubTrigger({ disabled, onClick, onKeyDown, onMouseEnter, className, children, ...rest }, ref) {
    const subCtx = useContext(MenuSubContext);
    if (!subCtx) throw new Error('<MenuSubTrigger> must be used inside <MenuSub>.');

    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        subCtx.setTriggerNode(node);
        assignRef(ref, node);
      },
      [subCtx, ref]
    );

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return;
        onClick?.(e);
        if (!e.defaultPrevented) {
          subCtx.setOpen(!subCtx.open);
        }
      },
      [disabled, onClick, subCtx]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(e);
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          e.stopPropagation();
          subCtx.setOpen(true);
        }
      },
      [onKeyDown, subCtx]
    );

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        onMouseEnter?.(e);
        subCtx.setOpen(true);
      },
      [onMouseEnter, subCtx]
    );

    return (
      <div
        ref={mergedRef}
        role="menuitem"
        tabIndex={-1}
        aria-haspopup="menu"
        aria-expanded={subCtx.open}
        aria-controls={subCtx.open ? subCtx.contentId : undefined}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? '' : undefined}
        className={classNames(styles.subTrigger, disabled && styles.itemDisabled, className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        {...rest}
      >
        {children}
        <span className={styles.subTriggerArrow}>▶</span>
      </div>
    );
  }
);

export interface MenuSubContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  children: React.ReactNode;
}

export const MenuSubContent = forwardRef<HTMLDivElement, MenuSubContentProps>(
  function MenuSubContent({ sideOffset = 0, className, children, ...rest }, forwardedRef) {
    const subCtx = useContext(MenuSubContext);
    if (!subCtx) throw new Error('<MenuSubContent> must be used inside <MenuSub>.');
    const parentCtx = useContext(MenuContext);

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
      if (!subCtx.open) return;
      const updatePosition = (): void => {
        const trigger = subCtx.triggerRef.current;
        const content = contentElRef.current;
        if (!trigger || !content) return;
        setCoords(
          computePosition(
            trigger.getBoundingClientRect(),
            content.getBoundingClientRect(),
            'right',
            'start',
            sideOffset,
            0
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
    }, [subCtx.open, subCtx.triggerRef, sideOffset]);

    useEffect(() => {
      if (!subCtx.open) return;
      const rafId = requestAnimationFrame(() => {
        const el = contentElRef.current;
        if (!el) return;
        const items = getMenuItems(el);
        if (items.length > 0) items[0].focus();
      });
      return () => cancelAnimationFrame(rafId);
    }, [subCtx.open]);

    useEffect(() => {
      if (!subCtx.open) return;
      const handleMouseDown = (e: MouseEvent) => {
        const target = e.target as Node;
        if (isOutsideAll(target, [contentElRef.current, subCtx.triggerRef.current])) {
          subCtx.setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleMouseDown);
      return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [subCtx]);

    const handleEscapeOrArrowLeft = useCallback(
      (e: React.KeyboardEvent) => {
        e.stopPropagation();
        subCtx.setOpen(false);
        subCtx.triggerRef.current?.focus();
      },
      [subCtx]
    );

    const handleTab = useCallback(() => {
      subCtx.setOpen(false);
      parentCtx?.setOpen(false);
      parentCtx?.triggerRef.current?.focus();
    }, [subCtx, parentCtx]);

    const handleKeyDown = useMenuKeyboardNav({
      containerRef: contentElRef,
      onTab: handleTab,
      onEscape: handleEscapeOrArrowLeft,
      onArrowLeft: handleEscapeOrArrowLeft,
    });

    if (!subCtx.open) return null;

    return (
      <Portal>
        <div
          ref={mergedRef}
          role="menu"
          id={subCtx.contentId}
          tabIndex={-1}
          style={{
            position: 'fixed',
            top: coords?.top ?? -9999,
            left: coords?.left ?? -9999,
            visibility: coords ? 'visible' : 'hidden',
          }}
          className={classNames(styles.subContent, className)}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          {children}
        </div>
      </Portal>
    );
  }
);
