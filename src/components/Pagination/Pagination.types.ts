import React from 'react';

export type PaginationSize = 'sm' | 'md' | 'lg';

export interface PaginationProps {
  /** Current page number (1-based). */
  currentPage: number;
  /** Total number of items across all pages. */
  totalCount: number;
  /** Number of items per page. */
  pageSize: number;
  /** Called when the user navigates to a different page. */
  onPageChange: (page: number) => void;
  /**
   * Number of sibling pages shown on each side of the current page.
   * Defaults to 1.
   */
  siblingCount?: number;
  /**
   * Number of pages always shown at the start and end of the range.
   * Defaults to 1.
   */
  boundaryCount?: number;
  /** When true, renders First / Last page buttons. Defaults to false. */
  showFirstLast?: boolean;
  /** When true, renders a page-size selector dropdown. Defaults to false. */
  showPageSize?: boolean;
  /** Options shown in the page-size selector. Defaults to [10, 20, 50, 100]. */
  pageSizeOptions?: number[];
  /** Called when the user selects a new page size. */
  onPageSizeChange?: (size: number) => void;
  /** Visual size variant. Defaults to 'md'. */
  size?: PaginationSize;
  /** When true, disables all controls (e.g. while loading). */
  disabled?: boolean;
  /** Additional CSS class applied to the root element. */
  className?: string;
  /** Additional inline style applied to the root element. */
  style?: React.CSSProperties;
}
