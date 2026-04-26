import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableRecord = Record<string, any>;

export type SortDirection = 'asc' | 'desc';

/** Density scale for table row/cell sizing */
export type DataTableDensity = 'compact' | 'default' | 'comfortable';

/** Explicit sort state shared between controlled and uncontrolled usage */
export interface DataTableSortState {
  key: string;
  direction: SortDirection;
}

export interface DataTablePagination {
  /** Current page number (1-based) */
  currentPage: number;
  /** Number of rows per page */
  pageSize: number;
  /** Total number of rows across all pages */
  totalCount: number;
  /** Called when the user navigates to a different page */
  onPageChange: (page: number) => void;
}

export interface DataTableColumn<T extends DataTableRecord = DataTableRecord> {
  /** Unique key that maps to a field in the row data */
  key: string;
  /** Text displayed in the column header */
  header: string;
  /** Whether this column supports checkbox-based filtering */
  filterable?: boolean;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Custom cell renderer; receives the raw cell value and the full row */
  render?: (value: unknown, row: T) => React.ReactNode;
  /** Optional column width (e.g. '150px' or '20%') */
  width?: string | number;
  /**
   * Sticks the column to the left or right edge while the table scrolls horizontally.
   */
  sticky?: 'left' | 'right';
  /** Horizontal alignment for header and body cells. Defaults to 'left'. */
  align?: 'left' | 'center' | 'right';
  /**
   * Custom header cell renderer.
   * When provided, replaces the default header text (and sort button) with the returned node.
   */
  headerRender?: (col: DataTableColumn<T>) => React.ReactNode;
}

export interface DataTableProps<T extends DataTableRecord = DataTableRecord> {
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Row data */
  data: T[];
  /**
   * Returns a stable, unique key for each row.
   * When omitted the row's array index is used as a fallback.
   */
  rowKey?: (row: T, index: number) => string | number;
  /** Additional CSS class applied to the outermost wrapper */
  className?: string;
  /** Additional inline style applied to the outermost wrapper */
  style?: React.CSSProperties;
  /** Message displayed when data array is empty or all rows are filtered out */
  emptyMessage?: string;
  /**
   * Custom empty-state node rendered inside the table when there are no rows.
   * Takes precedence over `emptyMessage` when both are provided.
   */
  emptyState?: React.ReactNode;
  /**
   * Pagination configuration. When provided, the table renders built-in
   * pagination controls below the table body.
   */
  pagination?: DataTablePagination;
  /**
   * Called when a sortable column header is clicked.
   * Receives the column key and the new sort direction.
   * Both `onSort` and `onSortChange` fire on every click; prefer `onSortChange`
   * when you also want to drive the sort indicator via `sortState`.
   */
  onSort?: (key: string, direction: SortDirection) => void;
  /**
   * When true, renders shimmer skeleton rows instead of real data while a
   * fetch is in progress, keeping the table chrome (headers, pagination) stable.
   */
  loading?: boolean;
  /**
   * Number of skeleton rows to display when loading is true.
   * Defaults to 5.
   */
  skeletonRowCount?: number;
  /** Called when a data row is clicked */
  onRowClick?: (row: T) => void;
  /**
   * Renders additional content below the clicked row.
   * When provided together with onRowClick the row expands on click to reveal this content.
   */
  expandedRowRender?: (row: T) => React.ReactNode;
  /**
   * When true, adds a leading checkbox column for row selection.
   */
  selectable?: boolean;
  /**
   * Controlled set of selected row keys.
   * Each value corresponds to the return value of rowKey (or the row index when rowKey is omitted).
   */
  selectedRows?: Set<string | number>;
  /**
   * Called when the selection changes.
   * Receives the full updated set of selected row keys.
   */
  onSelectionChange?: (selected: Set<string | number>) => void;
  /**
   * Render slot for bulk-action controls.
   * Rendered in a bar above the table when at least one row is selected.
   */
  bulkActions?: React.ReactNode;

  // ── Controlled sort state ──────────────────────────────────────────────────

  /**
   * Controlled sort state. When provided the component operates in controlled
   * sort mode: the visual sort indicator reflects this value and `onSortChange`
   * is called when the user clicks a sortable column header.
   */
  sortState?: DataTableSortState | null;
  /**
   * Called when the user clicks a sortable column header.
   * Use together with `sortState` for fully controlled sort.
   */
  onSortChange?: (state: DataTableSortState | null) => void;

  // ── Controlled filter state ────────────────────────────────────────────────

  /**
   * Controlled column-filter state: maps column key → array of selected values.
   * When provided the component is in controlled filter mode and `onFilterChange`
   * is called on every filter change.
   */
  filterState?: Record<string, string[]>;
  /**
   * Called whenever the user changes a column filter.
   * Use together with `filterState` for fully controlled filters.
   */
  onFilterChange?: (state: Record<string, string[]>) => void;

  // ── Controlled expansion ───────────────────────────────────────────────────

  /**
   * Controlled set of expanded row keys.
   * When provided the component is in controlled expansion mode and
   * `onExpansionChange` is called when the user toggles a row.
   */
  expandedRowKeys?: Set<string | number>;
  /**
   * Called when the user toggles a row's expanded state.
   * Use together with `expandedRowKeys` for fully controlled expansion.
   */
  onExpansionChange?: (keys: Set<string | number>) => void;

  // ── Global search filter ───────────────────────────────────────────────────

  /**
   * Controlled global search string.
   * When provided, the table filters rows client-side (unless `serverSide` is
   * true) to those where any visible column value contains this string
   * (case-insensitive). A search input is rendered in the built-in toolbar.
   */
  globalFilter?: string;
  /**
   * Called when the built-in global search input value changes.
   * Use together with `globalFilter` for fully controlled global search.
   * Providing this prop causes the built-in search input to appear.
   */
  onGlobalFilterChange?: (value: string) => void;

  // ── Server-side mode ───────────────────────────────────────────────────────

  /**
   * When `true`, all sorting and filtering is delegated to the server.
   * Client-side sort/filter logic is bypassed; `data` is rendered as-is.
   * Callbacks (`onSortChange`, `onFilterChange`, `onGlobalFilterChange`) still
   * fire so the parent can issue a new server request.
   */
  serverSide?: boolean;

  // ── Column visibility ──────────────────────────────────────────────────────

  /**
   * Controlled list of column keys that are currently hidden.
   * When provided the component is in controlled column-visibility mode.
   */
  hiddenColumns?: string[];
  /**
   * Called when the user toggles column visibility via the built-in toolbar.
   * Use together with `hiddenColumns` for fully controlled visibility.
   */
  onColumnVisibilityChange?: (hidden: string[]) => void;

  // ── Layout ─────────────────────────────────────────────────────────────────

  /** Row/cell sizing density. Defaults to `'default'`. */
  density?: DataTableDensity;
  /**
   * When `true`, the table header row is sticky and stays visible during
   * vertical scroll.
   */
  stickyHeader?: boolean;

  // ── Toolbar ────────────────────────────────────────────────────────────────

  /**
   * Custom toolbar content rendered above the table.
   * When provided together with built-in toolbar features (global search,
   * column toggle, export) the custom content appears to the left of those
   * controls.
   */
  toolbar?: React.ReactNode;

  // ── Export ─────────────────────────────────────────────────────────────────

  /**
   * Called when the user clicks the built-in "Export CSV" toolbar button.
   * Receives the currently visible + filtered rows and visible column
   * definitions. Providing this prop causes the export button to appear.
   */
  onExportCSV?: (data: T[], columns: DataTableColumn<T>[]) => void;
}
