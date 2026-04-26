import React, { createContext, useCallback, useContext, useId, useMemo, useState } from 'react';
import { classNames } from '../../../utils';
import styles from './Accordion.module.css';
import type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionProps,
  AccordionTriggerProps,
} from './Accordion.types';

// ---------------------------------------------------------------------------
// Accordion context
// ---------------------------------------------------------------------------

interface AccordionContextValue {
  openItems: string[];
  toggle: (value: string) => void;
  multiple: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error('Accordion sub-components must be rendered inside <Accordion>.');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// AccordionItem context
// ---------------------------------------------------------------------------

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  disabled: boolean;
  triggerId: string;
  contentId: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

function useAccordionItemContext(): AccordionItemContextValue {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) {
    throw new Error(
      '<AccordionTrigger> and <AccordionContent> must be rendered inside <AccordionItem>.'
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Accordion
// ---------------------------------------------------------------------------

/**
 * Root accordion container. Manages which items are expanded.
 * Supports controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) usage.
 * Set `multiple` to allow more than one item to be open at a time.
 */
export function Accordion({
  multiple = false,
  value,
  defaultValue,
  onChange,
  children,
  className,
  style,
}: AccordionProps): React.ReactElement {
  const isControlled = value !== undefined;

  const getInitialOpen = (): string[] => {
    if (defaultValue === undefined) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  };

  const [internalOpen, setInternalOpen] = useState<string[]>(getInitialOpen);

  const openItems = useMemo<string[]>(
    () => (isControlled ? (Array.isArray(value) ? value : value ? [value] : []) : internalOpen),
    [isControlled, value, internalOpen]
  );

  const toggle = useCallback(
    (itemValue: string) => {
      let next: string[];
      if (multiple) {
        next = openItems.includes(itemValue)
          ? openItems.filter((v) => v !== itemValue)
          : [...openItems, itemValue];
      } else {
        next = openItems.includes(itemValue) ? [] : [itemValue];
      }
      if (!isControlled) {
        setInternalOpen(next);
      }
      onChange?.(multiple ? next : (next[0] ?? ''));
    },
    [multiple, openItems, isControlled, onChange]
  );

  return (
    <AccordionContext.Provider value={{ openItems, toggle, multiple }}>
      <div className={classNames(styles.accordion, className)} style={style}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}
Accordion.displayName = 'Accordion';

// ---------------------------------------------------------------------------
// AccordionItem
// ---------------------------------------------------------------------------

/** Wraps a single accordion entry. Provides context to its trigger and content. */
export function AccordionItem({
  value,
  disabled = false,
  children,
  className,
  style,
}: AccordionItemProps): React.ReactElement {
  const { openItems } = useAccordionContext();
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;
  const isOpen = openItems.includes(value);

  return (
    <AccordionItemContext.Provider value={{ value, isOpen, disabled, triggerId, contentId }}>
      <div
        className={classNames(
          styles.accordionItem,
          isOpen ? styles.open : undefined,
          disabled ? styles.disabled : undefined,
          className
        )}
        style={style}
        data-state={isOpen ? 'open' : 'closed'}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}
AccordionItem.displayName = 'AccordionItem';

// ---------------------------------------------------------------------------
// AccordionTrigger
// ---------------------------------------------------------------------------

/**
 * Button that toggles the parent `<AccordionItem>` open/closed.
 * Rendered inside an `<h3>` heading to satisfy the WAI-ARIA Accordion pattern.
 */
export function AccordionTrigger({
  children,
  className,
  ...rest
}: AccordionTriggerProps): React.ReactElement {
  const { toggle } = useAccordionContext();
  const { value, isOpen, disabled, triggerId, contentId } = useAccordionItemContext();

  const handleClick = useCallback(() => {
    if (!disabled) {
      toggle(value);
    }
  }, [disabled, toggle, value]);

  return (
    <h3 className={styles.accordionHeading}>
      <button
        {...rest}
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        disabled={disabled}
        onClick={handleClick}
        className={classNames(
          styles.accordionTrigger,
          isOpen ? styles.triggerOpen : undefined,
          disabled ? styles.triggerDisabled : undefined,
          className
        )}
      >
        <span className={styles.triggerLabel}>{children}</span>
        <span className={styles.chevron} aria-hidden="true" />
      </button>
    </h3>
  );
}
AccordionTrigger.displayName = 'AccordionTrigger';

// ---------------------------------------------------------------------------
// AccordionContent
// ---------------------------------------------------------------------------

/**
 * Content region for an `<AccordionItem>`. When the item is closed, the
 * `hidden` attribute is applied so the content is removed from the
 * accessibility tree and not rendered (via `display: none`).
 */
export function AccordionContent({
  children,
  className,
  ...rest
}: AccordionContentProps): React.ReactElement {
  const { isOpen, triggerId, contentId } = useAccordionItemContext();

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      hidden={!isOpen}
      className={classNames(
        styles.accordionContent,
        isOpen ? styles.contentOpen : undefined,
        className
      )}
      {...rest}
    >
      <div className={styles.contentInner}>{children}</div>
    </div>
  );
}
AccordionContent.displayName = 'AccordionContent';
