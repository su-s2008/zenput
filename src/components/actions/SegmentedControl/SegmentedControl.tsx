'use client';
import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  Children,
  isValidElement,
} from 'react';
import { classNames } from '../../../utils';
import styles from './SegmentedControl.module.css';

export type SegmentedControlSize = 'sm' | 'md' | 'lg';

/**
 * Encode an arbitrary string into a deterministic, ID-safe segment. HTML id
 * attributes technically allow most characters, but values containing spaces,
 * quotes, or other CSS-significant punctuation cause problems when used in
 * selectors or `aria-*` references. We escape any character outside
 * `[A-Za-z0-9_-]` as its lowercase hex char code prefixed with `_`, which is
 * collision-free for distinct inputs and always produces a valid id segment.
 */
function safeIdSegment(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, (ch) => `_${(ch.codePointAt(0) ?? 0).toString(16)}`);
}

// ---------------------------------------------------------------------------
// SegmentedControl context
// ---------------------------------------------------------------------------

interface SegmentedControlContextValue {
  value: string;
  onSelect: (value: string) => void;
  size: SegmentedControlSize;
  baseId: string;
  /** Value that should currently own the tabstop (roving tabindex). Equals
   *  `value` when something is selected; falls back to the first item value
   *  when no selection exists, so the control is always reachable via Tab. */
  rovingValue: string;
}

const SegmentedControlContext = createContext<SegmentedControlContextValue | null>(null);

function useSegmentedControlContext(): SegmentedControlContextValue {
  const ctx = useContext(SegmentedControlContext);
  if (!ctx) {
    throw new Error('SegmentedControlItem must be rendered inside <SegmentedControl>.');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// SegmentedControl
// ---------------------------------------------------------------------------

export interface SegmentedControlProps {
  /** Controlled selected value. */
  value?: string;
  /** Default value for uncontrolled usage. */
  defaultValue?: string;
  /** Called when selection changes. */
  onChange?: (value: string) => void;
  /** Control size. Default: `'md'`. */
  size?: SegmentedControlSize;
  /** Expand to fill available width. */
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Accessible label for the radiogroup. */
  'aria-label'?: string;
  /** ID of an element that labels the group. */
  'aria-labelledby'?: string;
}

/**
 * A mutually-exclusive set of options rendered as a pill-shaped segmented
 * control. Supports controlled (`value` + `onChange`) and uncontrolled
 * (`defaultValue`) usage.
 *
 * - `role="radiogroup"` with roving tabindex.
 * - Keyboard: ArrowLeft / ArrowRight / Home / End.
 * - Theme tokens: `--sc-*` (see `SegmentedControl.module.css`).
 */
export function SegmentedControl({
  value,
  defaultValue,
  onChange,
  size = 'md',
  fullWidth,
  children,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: Readonly<SegmentedControlProps>): React.ReactElement {
  const baseId = useId();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(defaultValue ?? '');
  const selected = isControlled ? (value as string) : internalValue; // NOSONAR

  const onSelect = useCallback(
    (val: string) => {
      if (!isControlled) setInternalValue(val);
      onChange?.(val);
    },
    [isControlled, onChange]
  );

  // Collect item values for roving tabindex
  const itemValues = useMemo(() => {
    const values: string[] = [];
    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        const v = (child.props as SegmentedControlItemProps).value;
        if (v !== undefined) values.push(v);
      }
    });
    return values;
  }, [children]);

  const groupRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const enabled = itemValues.filter((v) => {
        const btn = groupRef.current?.querySelector<HTMLButtonElement>(
          `[data-sc-value="${CSS.escape(v)}"]`
        );
        return btn ? !btn.disabled : true;
      });
      if (enabled.length === 0) return;

      const currentIdx = enabled.indexOf(selected);
      let nextIdx: number | null = null;

      if (e.key === 'ArrowRight') {
        nextIdx = currentIdx < enabled.length - 1 ? currentIdx + 1 : 0;
      } else if (e.key === 'ArrowLeft') {
        nextIdx = currentIdx > 0 ? currentIdx - 1 : enabled.length - 1;
      } else if (e.key === 'Home') {
        nextIdx = 0;
      } else if (e.key === 'End') {
        nextIdx = enabled.length - 1;
      }

      if (nextIdx !== null) {
        e.preventDefault();
        const nextValue = enabled[nextIdx];
        onSelect(nextValue);
        const btn = groupRef.current?.querySelector<HTMLButtonElement>(
          `[data-sc-value="${CSS.escape(nextValue)}"]`
        );
        btn?.focus();
      }
    },
    [itemValues, selected, onSelect]
  );

  // Compute the roving-tabindex owner. When no value/defaultValue is provided
  // `selected` is '' and would leave every item with tabIndex=-1, making the
  // control unreachable via Tab. Fall back to the first item value (if any)
  // so the group always has exactly one tabbable button.
  const rovingValue = selected || itemValues[0] || '';

  const ctxValue = useMemo(
    () => ({ value: selected, onSelect, size, baseId, rovingValue }),
    [selected, onSelect, size, baseId, rovingValue]
  );

  return (
    <SegmentedControlContext.Provider
      value={ctxValue}
    >
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus -- radiogroup focus is handled by roving tabindex on child radio buttons */}
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={classNames(
          styles.root,
          styles[`size-${size}`],
          fullWidth ? styles.fullWidth : undefined,
          className
        )}
        style={style}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </SegmentedControlContext.Provider>
  );
}
SegmentedControl.displayName = 'SegmentedControl';

// ---------------------------------------------------------------------------
// SegmentedControlItem
// ---------------------------------------------------------------------------

export interface SegmentedControlItemProps {
  /** Value this item represents. */
  value: string;
  /** Icon rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Disable this item. */
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Individual item within a `<SegmentedControl>`.
 */
export function SegmentedControlItem({
  value,
  leftIcon,
  disabled,
  children,
  className,
}: Readonly<SegmentedControlItemProps>): React.ReactElement {
  const { value: selected, onSelect, baseId, rovingValue } = useSegmentedControlContext();
  const isSelected = selected === value;
  const isTabStop = rovingValue === value;

  const handleClick = useCallback(() => {
    if (!disabled) onSelect(value);
  }, [disabled, onSelect, value]);

  return (
    <button
      role="radio"
      type="button"
      id={`${baseId}-item-${safeIdSegment(value)}`}
      aria-checked={isSelected}
      tabIndex={isTabStop ? 0 : -1}
      disabled={disabled}
      data-sc-value={value}
      data-selected={isSelected || undefined}
      onClick={handleClick}
      className={classNames(
        styles.item,
        isSelected ? styles.itemSelected : undefined,
        disabled ? styles.itemDisabled : undefined,
        className
      )}
    >
      {leftIcon && (
        <span className={styles.itemIcon} aria-hidden="true">
          {leftIcon}
        </span>
      )}
      {children}
    </button>
  );
}
SegmentedControlItem.displayName = 'SegmentedControlItem';

// ---------------------------------------------------------------------------
// ToggleGroup
// ---------------------------------------------------------------------------

export type ToggleGroupType = 'single' | 'multiple';

export interface ToggleGroupSingleProps {
  type: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface ToggleGroupMultipleProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ToggleGroupProps = (ToggleGroupSingleProps | ToggleGroupMultipleProps) & {
  size?: SegmentedControlSize;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

// ---------------------------------------------------------------------------
// ToggleGroup context
// ---------------------------------------------------------------------------

interface ToggleGroupContextValue {
  isSelected: (value: string) => boolean;
  toggle: (value: string) => void;
  size: SegmentedControlSize;
  baseId: string;
  /** Selection mode — used to determine whether items participate in a roving
   *  tabindex (single) or each remain independently tabbable (multiple). */
  type: ToggleGroupType;
  /** Value that currently owns the tabstop when `type === 'single'`
   *  (roving tabindex). Null in multiple mode. */
  rovingValue: string | null;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function useToggleGroupContext(): ToggleGroupContextValue {
  const ctx = useContext(ToggleGroupContext);
  if (!ctx) {
    throw new Error('ToggleGroupItem must be rendered inside <ToggleGroup>.');
  }
  return ctx;
}

/**
 * A group of toggle buttons that can be used in single or multiple selection
 * mode.
 *
 * Renders a `role="group"` containing native `<button>` elements. Each
 * `<ToggleGroupItem>` exposes its pressed state via `aria-pressed`
 * (rather than `role="radio"` / `role="checkbox"` + `aria-checked`).
 * - `type="single"`: arrow keys move focus and update selection (roving tabindex).
 * - `type="multiple"`: each button is independently tabbable; arrow keys only move focus.
 */
export function ToggleGroup(props: ToggleGroupProps): React.ReactElement {
  const { type, size = 'md', fullWidth, children, className, style } = props;
  const ariaLabel = (props as { 'aria-label'?: string })['aria-label'];
  const ariaLabelledBy = (props as { 'aria-labelledby'?: string })['aria-labelledby'];
  const baseId = useId();
  const groupRef = useRef<HTMLDivElement>(null);

  // Single mode state
  const singleProps = type === 'single' ? (props as ToggleGroupSingleProps) : null;
  const multipleProps = type === 'multiple' ? (props as ToggleGroupMultipleProps) : null;

  const isSingleControlled = singleProps?.value !== undefined;
  const isMultipleControlled = multipleProps?.value !== undefined;

  const [singleInternal, setSingleInternal] = useState<string>(singleProps?.defaultValue ?? '');
  const [multipleInternal, setMultipleInternal] = useState<string[]>(
    multipleProps?.defaultValue ?? []
  );

  // Extract controlled values for use in callbacks
  const singleControlledValue = singleProps?.value;
  const multipleControlledValue = multipleProps?.value;
  const singleOnValueChange = singleProps?.onValueChange;
  const multipleOnValueChange = multipleProps?.onValueChange;

  const isSelected = useCallback(
    (value: string) => {
      if (type === 'single') {
        const current = isSingleControlled ? singleControlledValue! : singleInternal;
        return current === value;
      } else {
        const current = isMultipleControlled ? multipleControlledValue! : multipleInternal;
        return current.includes(value);
      }
    },
    [
      type,
      isSingleControlled,
      singleControlledValue,
      singleInternal,
      isMultipleControlled,
      multipleControlledValue,
      multipleInternal,
    ]
  );

  const toggle = useCallback(
    (value: string) => {
      if (type === 'single') {
        if (!isSingleControlled) setSingleInternal(value);
        singleOnValueChange?.(value);
      } else {
        const current = isMultipleControlled ? multipleControlledValue! : multipleInternal;
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        if (!isMultipleControlled) setMultipleInternal(next);
        multipleOnValueChange?.(next);
      }
    },
    [
      type,
      isSingleControlled,
      singleOnValueChange,
      isMultipleControlled,
      multipleControlledValue,
      multipleInternal,
      multipleOnValueChange,
    ]
  );

  // Collect item values for keyboard navigation
  const itemValues = useMemo(() => {
    const values: string[] = [];
    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        const v = (child.props as ToggleGroupItemProps).value;
        if (v !== undefined) values.push(v);
      }
    });
    return values;
  }, [children]);

  // Determine the value that should currently own tab focus when in single mode
  // (roving tabindex). Falls back to the first item if nothing is selected so
  // the group is always reachable via Tab.
  const rovingValue: string | null = useMemo(() => {
    if (type !== 'single') return null;
    const current = isSingleControlled ? singleControlledValue : singleInternal;
    if (current && itemValues.includes(current)) return current;
    return itemValues[0] ?? null;
  }, [type, isSingleControlled, singleControlledValue, singleInternal, itemValues]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const enabled = itemValues.filter((v) => {
        const btn = groupRef.current?.querySelector<HTMLButtonElement>(
          `[data-tg-value="${CSS.escape(v)}"]`
        );
        return btn ? !btn.disabled : true;
      });
      if (enabled.length === 0) return;

      // For single selection, use roving tabindex (arrow keys change selection)
      // For multiple selection, arrow keys just move focus
      const focusedEl = document.activeElement as HTMLButtonElement | null;
      const focusedValue = focusedEl?.dataset?.tgValue ?? '';
      const currentIdx = enabled.indexOf(focusedValue);

      let nextIdx: number | null = null;
      if (e.key === 'ArrowRight') {
        nextIdx = currentIdx < enabled.length - 1 ? currentIdx + 1 : 0;
      } else if (e.key === 'ArrowLeft') {
        nextIdx = currentIdx > 0 ? currentIdx - 1 : enabled.length - 1;
      } else if (e.key === 'Home') {
        nextIdx = 0;
      } else if (e.key === 'End') {
        nextIdx = enabled.length - 1;
      }

      if (nextIdx !== null) {
        e.preventDefault();
        const nextValue = enabled[nextIdx];
        if (type === 'single') {
          toggle(nextValue);
        }
        const btn = groupRef.current?.querySelector<HTMLButtonElement>(
          `[data-tg-value="${CSS.escape(nextValue)}"]`
        );
        btn?.focus();
      }
    },
    [itemValues, toggle, type]
  );

  const toggleCtxValue = useMemo(
    () => ({ isSelected, toggle, size, baseId, type, rovingValue }),
    [isSelected, toggle, size, baseId, type, rovingValue]
  );

  return (
    <ToggleGroupContext.Provider value={toggleCtxValue}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- keyboard handler enables arrow-key navigation between toggle items */}
      <div
        ref={groupRef}
        role="group" // NOSONAR
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={classNames(
          styles.root,
          styles[`size-${size}`],
          fullWidth ? styles.fullWidth : undefined,
          styles.toggleGroup,
          className
        )}
        style={style}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}
ToggleGroup.displayName = 'ToggleGroup';

// ---------------------------------------------------------------------------
// ToggleGroupItem
// ---------------------------------------------------------------------------

export interface ToggleGroupItemProps {
  /** Value for this toggle item. */
  value: string;
  /** Icon rendered before the label. */
  leftIcon?: React.ReactNode;
  /** Disable this item. */
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * An individual toggle button within a `<ToggleGroup>`.
 */
export function ToggleGroupItem({
  value,
  leftIcon,
  disabled,
  children,
  className,
}: Readonly<ToggleGroupItemProps>): React.ReactElement {
  const { isSelected, toggle, baseId, type, rovingValue } = useToggleGroupContext();
  const selected = isSelected(value);

  const handleClick = useCallback(() => {
    if (!disabled) toggle(value);
  }, [disabled, toggle, value]);

  let tabIndex: number;
  if (type === 'single') {
    tabIndex = rovingValue === value ? 0 : -1;
  } else {
    tabIndex = 0;
  }

  return (
    <button
      type="button"
      id={`${baseId}-tg-${safeIdSegment(value)}`}
      aria-pressed={selected}
      tabIndex={tabIndex}
      disabled={disabled}
      data-tg-value={value}
      data-selected={selected || undefined}
      onClick={handleClick}
      className={classNames(
        styles.item,
        selected ? styles.itemSelected : undefined,
        disabled ? styles.itemDisabled : undefined,
        styles.toggleItem,
        className
      )}
    >
      {leftIcon && (
        <span className={styles.itemIcon} aria-hidden="true">
          {leftIcon}
        </span>
      )}
      {children}
    </button>
  );
}
ToggleGroupItem.displayName = 'ToggleGroupItem';
