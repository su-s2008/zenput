'use client';
import React, { useState, useCallback, useRef, useEffect, useMemo, useId } from 'react';
import {
  DataTableProps,
  DataTableRecord,
  DataTableDensity,
  DataTableSortState,
  DataTableColumn,
  SortDirection,
} from './DataTable.types';
import { classNames } from '../../utils';
import styles from './DataTable.module.css';
import { Pagination } from '../Pagination/Pagination';

const DEFAULT_SKELETON_ROW_COUNT = 5;

/** Density CSS class map (only non-default densities have a class). */
const DENSITY_CLASS: Record<Exclude<DataTableDensity, 'default'>, string> = {
  compact: styles.densityCompact,
  comfortable: styles.densityComfortable,
};

function getStickyStyle(
  sticky: 'left' | 'right' | undefined,
  key: string,
  leftOffsets: Record<string, number>,
  rightOffsets: Record<string, number>,
  zIndex?: number
): React.CSSProperties {
  if (sticky === 'left') {
    return { position: 'sticky', left: leftOffsets[key] ?? 0, ...(zIndex !== undefined && { zIndex }) };
  }
  if (sticky === 'right') {
    return { position: 'sticky', right: rightOffsets[key] ?? 0, ...(zIndex !== undefined && { zIndex }) };
  }
  return {};
}

function getSortIcon(isSorted: boolean, sortDir: SortDirection | null): string {
  if (!isSorted) return '⇅';
  return sortDir === 'asc' ? '▲' : '▼';
}

function getAriaSort(
  isSorted: boolean,
  sortDir: SortDirection | null
): 'ascending' | 'descending' | undefined {
  if (!isSorted) return undefined;
  return sortDir === 'asc' ? 'ascending' : 'descending';
}

function HeaderLabel({
  col,
  isSorted,
  sortDir,
  handleSortClick,
}: Readonly<{
  col: DataTableColumn<DataTableRecord>;
  isSorted: boolean;
  sortDir: SortDirection | null;
  handleSortClick: (key: string) => void;
}>): React.ReactElement {
  if (col.headerRender) return <>{col.headerRender(col)}</>;
  if (!col.sortable) {
    return <span className={styles.headerText}>{col.header}</span>;
  }
  const sortSuffix = isSorted ? `, currently ${sortDir}` : '';
  const ariaLabel = `Sort by ${col.header}${sortSuffix}`;
  return (
    <button
      type="button"
      className={classNames(styles.sortButton, isSorted && styles.sortButtonActive)}
      onClick={() => handleSortClick(col.key)}
      aria-label={ariaLabel}
    >
      <span className={styles.headerText}>{col.header}</span>
      <span className={styles.sortIcon} aria-hidden="true">
        {getSortIcon(isSorted, sortDir)}
      </span>
    </button>
  );
}

interface FilterDropdownProps<T extends DataTableRecord> {
  col: DataTableColumn<T>;
  uniqueValues: string[];
  selectedValues: string[];
  filterCheckboxId: (key: string, index: number) => string;
  toggleFilterValue: (key: string, value: string) => void;
  clearFilter: (key: string) => void;
}

function FilterDropdown<T extends DataTableRecord>({
  col,
  uniqueValues,
  selectedValues,
  filterCheckboxId,
  toggleFilterValue,
  clearFilter,
}: Readonly<FilterDropdownProps<T>>): React.ReactElement {
  return (
    <div
      className={styles.filterDropdown}
      role="dialog"
      aria-label={`Filter options for ${col.header}`}
    >
      <ul className={styles.filterList} role="listbox">
        {uniqueValues.length === 0 ? (
          <li className={styles.filterEmpty}>No options</li>
        ) : (
          uniqueValues.map((val, valIndex) => {
            const checkboxId = filterCheckboxId(col.key, valIndex);
            return (
              <li key={val} className={styles.filterItem}>
                <label htmlFor={checkboxId} className={styles.filterLabel}>
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={selectedValues.includes(val)}
                    onChange={() => toggleFilterValue(col.key, val)}
                    className={styles.filterCheckbox}
                  />
                  <span className={styles.filterValueText}>{val}</span>
                </label>
              </li>
            );
          })
        )}
      </ul>
      {selectedValues.length > 0 && (
        <div className={styles.filterActions}>
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => clearFilter(col.key)}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

export function DataTable<T extends DataTableRecord = DataTableRecord>({
  columns,
  data,
  rowKey,
  className,
  style,
  emptyMessage = 'No data available',
  emptyState,
  pagination,
  onSort,
  loading = false,
  skeletonRowCount = DEFAULT_SKELETON_ROW_COUNT,
  onRowClick,
  expandedRowRender,
  selectable = false,
  selectedRows,
  onSelectionChange,
  bulkActions,
  // Controlled sort
  sortState: controlledSortState,
  onSortChange,
  // Controlled filters
  filterState: controlledFilterState,
  onFilterChange,
  // Controlled expansion
  expandedRowKeys: controlledExpandedKeys,
  onExpansionChange,
  // Global filter
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange,
  // Server-side
  serverSide = false,
  // Column visibility
  hiddenColumns: controlledHiddenColumns,
  onColumnVisibilityChange,
  // Layout
  density = 'default',
  stickyHeader = false,
  // Toolbar
  toolbar,
  // Export
  onExportCSV,
}: Readonly<DataTableProps<T>>) {
  /** Key of the column whose filter dropdown is currently open */
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);

  /** Internal filter state (used when filterState prop is not provided) */
  const [internalFilters, setInternalFilters] = useState<Record<string, string[]>>({});

  /** Internal sort state (used when sortState prop is not provided) */
  const [internalSortState, setInternalSortState] = useState<DataTableSortState | null>(null);

  /** Internal expanded row keys (used when expandedRowKeys prop is not provided) */
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string | number>>(new Set());

  /** Internal global filter (used when globalFilter prop is not provided) */
  const [internalGlobalFilter, setInternalGlobalFilter] = useState('');

  /** Internal hidden columns (used when hiddenColumns prop is not provided) */
  const [internalHiddenColumns, setInternalHiddenColumns] = useState<string[]>([]);

  /** Whether the column-visibility dropdown is open */
  const [columnToggleOpen, setColumnToggleOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  /** The live announce message for screen readers */
  const [announceMsg, setAnnounceMsg] = useState('');
  /**
   * Monotonic counter used to append an invisible zero-width-space to repeated
   * announcement messages, so screen readers re-announce identical sort
   * messages instead of suppressing them as duplicates.
   */
  const announceCounterRef = useRef(0);

  /**
   * Per-instance ID prefix so multiple DataTables on the same page don't
   * collide on label/input associations or checkbox `id`s.
   */
  const instanceId = useId();
  const globalSearchId = `${instanceId}-global-search`;
  /** Sanitize a user-supplied key so it's safe to embed in an HTML `id`. */
  const sanitizeIdPart = useCallback((part: string) => part.replace(/[^a-zA-Z0-9_-]/g, '_'), []);
  const columnToggleId = useCallback(
    (key: string) => `${instanceId}-col-toggle-${sanitizeIdPart(key)}`,
    [instanceId, sanitizeIdPart]
  );
  const filterCheckboxId = useCallback(
    (key: string, index: number) => `${instanceId}-dt-filter-${sanitizeIdPart(key)}-${index}`,
    [instanceId, sanitizeIdPart]
  );

  // ── Derive active (controlled vs uncontrolled) state ──────────────────────

  const activeFilters =
    controlledFilterState === undefined ? internalFilters : controlledFilterState;
  const activeSortState =
    controlledSortState === undefined ? internalSortState : controlledSortState;
  const activeExpandedKeys =
    controlledExpandedKeys === undefined ? internalExpandedKeys : controlledExpandedKeys;
  const activeGlobalFilter =
    controlledGlobalFilter === undefined ? internalGlobalFilter : controlledGlobalFilter;
  const activeHiddenColumns =
    controlledHiddenColumns === undefined ? internalHiddenColumns : controlledHiddenColumns;

  // ── Visible columns (column visibility toggle) ────────────────────────────

  const visibleColumns = useMemo(
    () => columns.filter((col) => !activeHiddenColumns.includes(col.key)),
    [columns, activeHiddenColumns]
  );

  // ── Sticky column offsets ──────────────────────────────────────────────────

  const { leftStickyOffsets, rightStickyOffsets } = useMemo(() => {
    const left: Record<string, number> = {};
    const right: Record<string, number> = {};
    let leftAccum = 0;
    let rightAccum = 0;

    // Calculate left sticky offsets
    for (const col of visibleColumns) {
      if (col.sticky === 'left') {
        left[col.key] = leftAccum;
        leftAccum += typeof col.width === 'number' ? col.width : 150;
      }
    }

    // Calculate right sticky offsets (iterate in reverse)
    for (let i = visibleColumns.length - 1; i >= 0; i--) {
      const col = visibleColumns[i];
      if (col.sticky === 'right') {
        right[col.key] = rightAccum;
        rightAccum += typeof col.width === 'number' ? col.width : 150;
      }
    }

    return { leftStickyOffsets: left, rightStickyOffsets: right };
  }, [visibleColumns]);

  /** Close dropdowns when user clicks outside the table wrapper */
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpenFilterKey(null);
        setColumnToggleOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  /** Returns sorted unique string values for a given column key from ALL rows */
  const getUniqueValues = useCallback(
    (key: string): string[] => {
      const seen = new Set<string>();
      data.forEach((row) => seen.add(String(row[key] ?? '')));
      return Array.from(seen).sort((a, b) => a.localeCompare(b));
    },
    [data]
  );

  /** Toggle the filter dropdown for a column */
  const toggleFilterDropdown = useCallback((key: string) => {
    setOpenFilterKey((prev) => (prev === key ? null : key));
    setColumnToggleOpen(false);
  }, []);

  /** Toggle a single checkbox value inside a column's filter */
  const toggleFilterValue = useCallback(
    (columnKey: string, value: string) => {
      const current = activeFilters[columnKey] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      const nextState = { ...activeFilters, [columnKey]: next };
      if (controlledFilterState === undefined) setInternalFilters(nextState);
      onFilterChange?.(nextState);
    },
    [activeFilters, controlledFilterState, onFilterChange]
  );

  /** Clear all selected values for a column filter */
  const clearFilter = useCallback(
    (columnKey: string) => {
      const nextState = { ...activeFilters, [columnKey]: [] };
      if (controlledFilterState === undefined) setInternalFilters(nextState);
      onFilterChange?.(nextState);
    },
    [activeFilters, controlledFilterState, onFilterChange]
  );

  /** Rows after applying all active column filters (AND across columns, OR within) + global filter */
  const filteredData = useMemo(() => {
    if (serverSide) return data;

    const columnFiltered = data.filter((row) =>
      columns.every((col) => {
        if (!col.filterable) return true;
        const selected = activeFilters[col.key];
        if (!selected || selected.length === 0) return true;
        return selected.includes(String(row[col.key] ?? ''));
      })
    );

    if (!activeGlobalFilter.trim()) return columnFiltered;

    const lower = activeGlobalFilter.toLowerCase();
    return columnFiltered.filter((row) =>
      visibleColumns.some((col) =>
        String(row[col.key] ?? '')
          .toLowerCase()
          .includes(lower)
      )
    );
  }, [data, columns, visibleColumns, activeFilters, activeGlobalFilter, serverSide]);

  /** Handle sortable column header click */
  const handleSortClick = useCallback(
    (key: string) => {
      const nextDirection: SortDirection =
        activeSortState?.key === key && activeSortState.direction === 'asc' ? 'desc' : 'asc';
      const nextState: DataTableSortState = { key, direction: nextDirection };
      if (controlledSortState === undefined) setInternalSortState(nextState);
      onSort?.(key, nextDirection);
      onSortChange?.(nextState);
      const col = columns.find((c) => c.key === key);
      const label = col?.header ?? key;
      // Append an invisible zero-width space whose count toggles every click so
      // successive identical sort messages always differ and screen readers
      // re-announce them.
      announceCounterRef.current = (announceCounterRef.current + 1) % 2;
      setAnnounceMsg(
        `Sorted by ${label} ${nextDirection === 'asc' ? 'ascending' : 'descending'}${
          announceCounterRef.current ? '\u200B' : ''
        }`
      );
    },
    [activeSortState, controlledSortState, onSort, onSortChange, columns]
  );

  /** Derive the row key for a given row + index */
  const getRowKey = useCallback(
    (row: T, index: number): string | number => {
      return rowKey ? rowKey(row, index) : index;
    },
    [rowKey]
  );

  /** Toggle expanded state for a row */
  const toggleExpandedRow = useCallback(
    (key: string | number) => {
      const next = new Set(activeExpandedKeys);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      if (controlledExpandedKeys === undefined) setInternalExpandedKeys(next);
      onExpansionChange?.(next);
    },
    [activeExpandedKeys, controlledExpandedKeys, onExpansionChange]
  );

  /** Handle row click */
  const handleRowClick = useCallback(
    (row: T, key: string | number) => {
      if (expandedRowRender) {
        toggleExpandedRow(key);
      }
      onRowClick?.(row);
    },
    [onRowClick, expandedRowRender, toggleExpandedRow]
  );

  // ── Selection helpers ──────────────────────────────────────────────────────

  const isControlledSelection = selectedRows !== undefined;

  const [internalSelected, setInternalSelected] = useState<Set<string | number>>(new Set());
  const activeSelected = isControlledSelection ? selectedRows : internalSelected;

  const isAllSelected =
    filteredData.length > 0 &&
    filteredData.every((row, idx) => activeSelected.has(getRowKey(row, idx)));

  const isIndeterminate =
    !isAllSelected && filteredData.some((row, idx) => activeSelected.has(getRowKey(row, idx)));

  const handleSelectAll = useCallback(() => {
    const allKeys = filteredData.map((row, idx) => getRowKey(row, idx));
    const allKeysSet = new Set(allKeys);
    const next = isAllSelected
      ? new Set<string | number>([...activeSelected].filter((k) => !allKeysSet.has(k)))
      : new Set<string | number>([...activeSelected, ...allKeys]);
    if (!isControlledSelection) setInternalSelected(next);
    onSelectionChange?.(next);
  }, [
    filteredData,
    getRowKey,
    isAllSelected,
    activeSelected,
    isControlledSelection,
    onSelectionChange,
  ]);

  const handleSelectRow = useCallback(
    (key: string | number) => {
      const next = new Set(activeSelected);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      if (!isControlledSelection) setInternalSelected(next);
      onSelectionChange?.(next);
    },
    [activeSelected, isControlledSelection, onSelectionChange]
  );

  // ── Global filter handler ──────────────────────────────────────────────────

  const handleGlobalFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (controlledGlobalFilter === undefined) setInternalGlobalFilter(value);
      onGlobalFilterChange?.(value);
    },
    [controlledGlobalFilter, onGlobalFilterChange]
  );

  // ── Column visibility handler ──────────────────────────────────────────────

  const toggleColumnVisibility = useCallback(
    (key: string) => {
      const next = activeHiddenColumns.includes(key)
        ? activeHiddenColumns.filter((k) => k !== key)
        : [...activeHiddenColumns, key];
      if (controlledHiddenColumns === undefined) setInternalHiddenColumns(next);
      onColumnVisibilityChange?.(next);
    },
    [activeHiddenColumns, controlledHiddenColumns, onColumnVisibilityChange]
  );

  // ── Export handler ─────────────────────────────────────────────────────────

  const handleExportCSV = useCallback(() => {
    onExportCSV?.(filteredData, visibleColumns);
  }, [onExportCSV, filteredData, visibleColumns]);

  const colSpan = visibleColumns.length + (selectable ? 1 : 0);

  // ── Skeleton rows ──────────────────────────────────────────────────────────

  const skeletonRows = useMemo(() => Array.from({ length: skeletonRowCount }), [skeletonRowCount]);

  // ── Toolbar visibility ─────────────────────────────────────────────────────

  const showBuiltinGlobalSearch =
    onGlobalFilterChange !== undefined || controlledGlobalFilter !== undefined;
  // Only render the column-toggle UI when a change handler is supplied, otherwise
  // clicking checkboxes would be a no-op with `hiddenColumns` alone.
  const showColumnToggle = onColumnVisibilityChange !== undefined;
  const showExportBtn = onExportCSV !== undefined;
  const showToolbarRow =
    toolbar !== undefined || showBuiltinGlobalSearch || showColumnToggle || showExportBtn;

  return (
    <div
      ref={wrapperRef}
      className={classNames(
        styles.wrapper,
        density === 'default' ? undefined : DENSITY_CLASS[density],
        className
      )}
      style={style}
    >
      {/* Screen-reader live announcement region */}
      <div className={styles.srAnnounce} aria-live="polite" aria-atomic="true">
        {announceMsg}
      </div>

      {/* Toolbar row */}
      {showToolbarRow && (
        <div className={styles.toolbar}>
          {toolbar && <div className={styles.toolbarCustom}>{toolbar}</div>}
          <div className={styles.toolbarBuiltin}>
            {showBuiltinGlobalSearch && (
              <div className={styles.globalSearchWrapper}>
                <label htmlFor={globalSearchId} className={styles.srOnly}>
                  Global search
                </label>
                <input
                  id={globalSearchId}
                  type="search"
                  className={styles.globalSearch}
                  placeholder="Search…"
                  value={activeGlobalFilter}
                  onChange={handleGlobalFilterChange}
                />
              </div>
            )}
            {showColumnToggle && (
              <div className={styles.columnToggleWrapper}>
                <button
                  type="button"
                  className={classNames(
                    styles.toolbarButton,
                    columnToggleOpen ? styles.toolbarButtonActive : undefined
                  )}
                  aria-expanded={columnToggleOpen}
                  aria-haspopup="true"
                  aria-label="Toggle column visibility"
                  onClick={() => {
                    setColumnToggleOpen((v) => !v);
                    setOpenFilterKey(null);
                  }}
                >
                  Columns
                </button>
                {columnToggleOpen && (
                  <div className={styles.columnToggleDropdown} role="group" /* NOSONAR */ aria-label="Columns">
                    {columns.map((col) => {
                      const isVisible = !activeHiddenColumns.includes(col.key);
                      const checkId = columnToggleId(col.key);
                      return (
                        <label key={col.key} htmlFor={checkId} className={styles.columnToggleItem}>
                          <input
                            id={checkId}
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => toggleColumnVisibility(col.key)}
                            className={styles.filterCheckbox}
                          />
                          <span>{col.header}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {showExportBtn && (
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={handleExportCSV}
                aria-label="Export CSV"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bulk actions bar */}
      {selectable && activeSelected.size > 0 && bulkActions && (
        <div className={styles.bulkActionsBar}>
          <span className={styles.bulkActionsCount}>{activeSelected.size} selected</span>
          <div className={styles.bulkActionsSlot}>{bulkActions}</div>
        </div>
      )}

      <div
        className={styles.tableContainer}
        // Make the scrollable region keyboard-accessible (axe rule:
        // scrollable-region-focusable) so users who rely on the keyboard
        // can scroll the table in Safari and other browsers.
        role="region"
        aria-label="Data table"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      >
        <table className={styles.table}>
          <thead className={classNames(stickyHeader ? styles.stickyHeader : undefined)}>
            <tr>
              {selectable && (
                <th className={classNames(styles.th, styles.checkboxTh)}>
                  <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className={styles.rowCheckbox}
                  />
                </th>
              )}
              {visibleColumns.map((col) => {
                const isOpen = openFilterKey === col.key;
                const selectedValues = activeFilters[col.key] ?? [];
                const isActive = selectedValues.length > 0;
                const uniqueValues = col.filterable ? getUniqueValues(col.key) : [];
                const isSorted = activeSortState?.key === col.key;
                const sortDir = isSorted ? activeSortState!.direction : null;

                const stickyStyle = getStickyStyle(
                  col.sticky,
                  col.key,
                  leftStickyOffsets,
                  rightStickyOffsets,
                  2
                );
                const alignStyle: React.CSSProperties = col.align ? { textAlign: col.align } : {};

                return (
                  <th
                    key={col.key}
                    className={classNames(styles.th, col.sticky && styles.stickyCol)}
                    aria-sort={getAriaSort(isSorted, sortDir)}
                    style={{
                      ...(col.width === undefined ? undefined : { width: col.width }),
                      ...stickyStyle,
                      ...alignStyle,
                    }}
                  >
                    <div className={styles.thContent}>
                      <HeaderLabel
                        col={col as DataTableColumn<DataTableRecord>}
                        isSorted={isSorted}
                        sortDir={sortDir}
                        handleSortClick={handleSortClick}
                      />
                      {col.filterable && (
                        <div className={styles.filterContainer}>
                          <button
                            type="button"
                            aria-label={`Filter by ${col.header}`}
                            aria-expanded={isOpen}
                            aria-haspopup="listbox"
                            className={classNames(
                              styles.filterButton,
                              isActive && styles.filterButtonActive
                            )}
                            onClick={() => toggleFilterDropdown(col.key)}
                          >
                            <span
                              className={classNames(
                                styles.filterArrow,
                                isOpen && styles.filterArrowOpen
                              )}
                              aria-hidden="true"
                            >
                              ▾
                            </span>
                          </button>
                          {isOpen && (
                            <FilterDropdown
                              col={col}
                              uniqueValues={uniqueValues}
                              selectedValues={selectedValues}
                              filterCheckboxId={filterCheckboxId}
                              toggleFilterValue={toggleFilterValue}
                              clearFilter={clearFilter}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              skeletonRows.map((_, skeletonIdx) => (
                <tr key={`skeleton-${skeletonIdx}`} className={styles.skeletonRow}>
                  {selectable && (
                    <td className={styles.td}>
                      <div className={classNames(styles.skeletonCell, styles.skeletonCheckbox)} />
                    </td>
                  )}
                  {visibleColumns.map((col) => (
                    <td key={col.key} className={styles.td}>
                      <div className={styles.skeletonCell} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className={styles.emptyCell}>
                  {emptyState ?? emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIndex) => {
                const key = getRowKey(row, rowIndex);
                const isSelected = activeSelected.has(key);
                const isExpanded = activeExpandedKeys.has(key);
                const isClickable = !!(onRowClick || expandedRowRender);

                return (
                  <React.Fragment key={key}>
                    <tr
                      className={classNames(
                        styles.tr,
                        isClickable ? styles.trClickable : undefined,
                        isSelected ? styles.trSelected : undefined
                      )}
                      onClick={isClickable ? () => handleRowClick(row, key) : undefined}
                      // `aria-expanded` is only valid on roles that support
                      // it (e.g. `button`); when a row is expandable, mark
                      // the row as a button so the attribute is conformant.
                      role={expandedRowRender ? 'button' : undefined}
                      aria-expanded={expandedRowRender ? isExpanded : undefined}
                    >
                      {selectable && (
                        <td className={styles.td} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            aria-label={`Select row ${key}`}
                            checked={isSelected}
                            onChange={() => handleSelectRow(key)}
                            className={styles.rowCheckbox}
                          />
                        </td>
                      )}
                      {visibleColumns.map((col) => {
                        const stickyStyle: React.CSSProperties =
                          col.sticky === 'left'
                            ? { position: 'sticky', left: leftStickyOffsets[col.key] ?? 0 }
                            : col.sticky === 'right'
                              ? { position: 'sticky', right: rightStickyOffsets[col.key] ?? 0 }
                              : {};
                        const alignStyle: React.CSSProperties = col.align
                          ? { textAlign: col.align }
                          : {};
                        return (
                          <td
                            key={col.key}
                            className={classNames(
                              styles.td,
                              col.sticky ? styles.stickyCol : undefined
                            )}
                            style={{ ...stickyStyle, ...alignStyle }}
                          >
                            {col.render
                              ? col.render(row[col.key], row)
                              : String(row[col.key] ?? '')}
                          </td>
                        );
                      })}
                    </tr>
                    {expandedRowRender && isExpanded && (
                      <tr className={styles.expandedRow}>
                        <td colSpan={colSpan} className={styles.expandedCell}>
                          {expandedRowRender(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {pagination &&
        (() => {
          // Clamp the displayed range to valid bounds so the "x–y of total" label
          // stays consistent even if the consumer's currentPage drifts out of
          // range (for example after totalCount shrinks).
          const safePageSize = Math.max(1, Math.floor(pagination.pageSize) || 1);
          const totalPages = Math.max(
            1,
            Math.ceil(Math.max(0, pagination.totalCount) / safePageSize)
          );
          const safeCurrentPage = Math.min(
            Math.max(1, Math.floor(pagination.currentPage) || 1),
            totalPages
          );
          const rangeStart = (safeCurrentPage - 1) * safePageSize + 1;
          const rangeEnd = Math.min(safeCurrentPage * safePageSize, pagination.totalCount);
          return (
            <div className={styles.pagination}>
              <span className={styles.paginationInfo}>
                {loading || pagination.totalCount === 0
                  ? `0–0 of ${pagination.totalCount}`
                  : `${rangeStart}–${rangeEnd} of ${pagination.totalCount}`}
              </span>
              <Pagination
                currentPage={pagination.currentPage}
                totalCount={pagination.totalCount}
                pageSize={pagination.pageSize}
                onPageChange={pagination.onPageChange}
                disabled={loading}
                size="sm"
              />
            </div>
          );
        })()}
    </div>
  );
}

DataTable.displayName = 'DataTable';
