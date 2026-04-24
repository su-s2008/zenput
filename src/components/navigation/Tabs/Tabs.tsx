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
import styles from './Tabs.module.css';
import type { TabListProps, TabPanelProps, TabPanelsProps, TabProps, TabsProps } from './Tabs.types';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface TabsContextValue {
  selected: string;
  onSelect: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tab sub-components must be rendered inside <Tabs>.');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

/**
 * Root container that manages which tab is selected.
 * Supports controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) usage.
 */
export function Tabs({
  value,
  defaultValue,
  onChange,
  orientation = 'horizontal',
  children,
  className,
  style,
}: TabsProps): React.ReactElement {
  const baseId = useId();
  const isControlled = value !== undefined;
  const [internalSelected, setInternalSelected] = useState<string>(defaultValue ?? '');
  const selected = isControlled ? (value as string) : internalSelected;

  const onSelect = useCallback(
    (val: string) => {
      if (!isControlled) {
        setInternalSelected(val);
      }
      onChange?.(val);
    },
    [isControlled, onChange]
  );

  return (
    <TabsContext.Provider value={{ selected, onSelect, orientation, baseId }}>
      <div
        className={classNames(styles.tabs, styles[orientation], className)}
        style={style}
        data-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}
Tabs.displayName = 'Tabs';

// ---------------------------------------------------------------------------
// TabList
// ---------------------------------------------------------------------------

/**
 * Container for `<Tab>` items. Implements roving-focus keyboard navigation
 * per the WAI-ARIA Tabs pattern.
 */
export function TabList({ children, className, ...rest }: TabListProps): React.ReactElement {
  const { orientation, selected, onSelect } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);

  // Collect enabled tab values in render order for keyboard navigation.
  const tabValues = useMemo(() => {
    const values: string[] = [];
    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        const tabValue = (child.props as TabProps).value;
        if (tabValue !== undefined) {
          values.push(tabValue);
        }
      }
    });
    return values;
  }, [children]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const isHorizontal = orientation === 'horizontal';

      // Gather enabled values at event-time so disabled tabs are skipped.
      const enabledValues = tabValues.filter((v) => {
        const btn = listRef.current?.querySelector<HTMLButtonElement>(
          `[data-tab-value="${CSS.escape(v)}"]`
        );
        return btn ? !btn.disabled : true;
      });

      // Nothing to navigate to if the tablist has no enabled tabs.
      if (enabledValues.length === 0) {
        return;
      }

      const currentIdx = enabledValues.indexOf(selected);
      let nextIdx: number | null = null;

      if (
        (isHorizontal && e.key === 'ArrowRight') ||
        (!isHorizontal && e.key === 'ArrowDown')
      ) {
        nextIdx = currentIdx < enabledValues.length - 1 ? currentIdx + 1 : 0;
      } else if (
        (isHorizontal && e.key === 'ArrowLeft') ||
        (!isHorizontal && e.key === 'ArrowUp')
      ) {
        nextIdx = currentIdx > 0 ? currentIdx - 1 : enabledValues.length - 1;
      } else if (e.key === 'Home') {
        nextIdx = 0;
      } else if (e.key === 'End') {
        nextIdx = enabledValues.length - 1;
      }

      if (nextIdx !== null) {
        e.preventDefault();
        const nextValue = enabledValues[nextIdx];
        onSelect(nextValue);
        const btn = listRef.current?.querySelector<HTMLButtonElement>(
          `[data-tab-value="${CSS.escape(nextValue)}"]`
        );
        btn?.focus();
      }
    },
    [orientation, tabValues, selected, onSelect]
  );

    return (
    // The tablist element itself does not need to be focusable per WAI-ARIA:
    // individual tabs handle focus via roving tabIndex (0 for selected, -1 for others).
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      {...rest}
      ref={listRef}
      role="tablist"
      aria-orientation={orientation}
      className={classNames(styles.tabList, className)}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
TabList.displayName = 'TabList';

// ---------------------------------------------------------------------------
// Tab
// ---------------------------------------------------------------------------

/**
 * Individual tab trigger. Must be a direct child of `<TabList>`.
 */
export function Tab({ value, disabled, children, className, ...rest }: TabProps): React.ReactElement {
  const { selected, onSelect, baseId } = useTabsContext();
  const isSelected = selected === value;

  const handleClick = useCallback(() => {
    if (!disabled) {
      onSelect(value);
    }
  }, [disabled, onSelect, value]);

  return (
    <button
      {...rest}
      role="tab"
      type="button"
      id={`${baseId}-tab-${value}`}
      aria-controls={`${baseId}-panel-${value}`}
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      data-tab-value={value}
      onClick={handleClick}
      className={classNames(
        styles.tab,
        isSelected ? styles.tabSelected : undefined,
        disabled ? styles.tabDisabled : undefined,
        className
      )}
    >
      {children}
    </button>
  );
}
Tab.displayName = 'Tab';

// ---------------------------------------------------------------------------
// TabPanels
// ---------------------------------------------------------------------------

/** Wrapper for `<TabPanel>` elements. */
export function TabPanels({ children, className, style }: TabPanelsProps): React.ReactElement {
  return (
    <div className={classNames(styles.tabPanels, className)} style={style}>
      {children}
    </div>
  );
}
TabPanels.displayName = 'TabPanels';

// ---------------------------------------------------------------------------
// TabPanel
// ---------------------------------------------------------------------------

/**
 * Content region associated with a `<Tab>`. Only the panel whose `value`
 * matches the currently selected tab is rendered.
 */
export function TabPanel({ value, children, className, ...rest }: TabPanelProps): React.ReactElement | null {
  const { selected, baseId } = useTabsContext();

  if (selected !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={classNames(styles.tabPanel, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
TabPanel.displayName = 'TabPanel';
