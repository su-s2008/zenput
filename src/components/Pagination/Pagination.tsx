'use client';
import React from 'react';
import { classNames } from '../../utils';
import type { PaginationProps } from './Pagination.types';
import styles from './Pagination.module.css';

/**
 * Builds the array of page items (numbers or 'ellipsis' sentinels) to render.
 * Always shows the first and last page, `boundaryCount` pages at each end,
 * and `siblingCount` pages on each side of the current page.
 */
export function buildPaginationItems(
  current: number,
  total: number,
  siblingCount = 1,
  boundaryCount = 1
): (number | 'ellipsis')[] {
  if (total <= 0) return [];

  // Normalize counts so that negative or non-finite values cannot reach
  // `Array.from({ length })` and trigger a RangeError.
  const safeBoundary = Number.isFinite(boundaryCount) ? Math.max(0, Math.floor(boundaryCount)) : 1;
  const safeSibling = Number.isFinite(siblingCount) ? Math.max(0, Math.floor(siblingCount)) : 1;

  // When total pages is small enough to show all without ellipsis, return them all.
  const threshold = 2 * safeBoundary + 2 * safeSibling + 3;
  if (total <= threshold) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  // Clamp current to valid range.
  const clamped = Math.min(Math.max(current, 1), total);

  // Build the full set of page numbers that should always be visible.
  const startPages = Array.from({ length: safeBoundary }, (_, i) => i + 1);
  const endPages = Array.from({ length: safeBoundary }, (_, i) => total - safeBoundary + 1 + i);

  const siblingsStart = Math.max(safeBoundary + 1, clamped - safeSibling);
  const siblingsEnd = Math.min(total - safeBoundary, clamped + safeSibling);

  const siblingPages = Array.from(
    { length: Math.max(0, siblingsEnd - siblingsStart + 1) },
    (_, i) => siblingsStart + i
  );

  // Combine into a sorted unique list.
  const allPages = Array.from(new Set([...startPages, ...siblingPages, ...endPages]))
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  // Insert 'ellipsis' sentinels between non-consecutive runs.
  const items: (number | 'ellipsis')[] = [];
  for (let i = 0; i < allPages.length; i++) {
    if (i > 0 && allPages[i] - allPages[i - 1] > 1) {
      items.push('ellipsis');
    }
    items.push(allPages[i]);
  }

  return items;
}

const SIZE_CLASS: Record<NonNullable<PaginationProps['size']>, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

/**
 * Standalone pagination control for use with any list or grid (not just DataTable).
 *
 * Accessibility: wraps in a `<nav>` with `aria-label`, marks the current page
 * button with `aria-current="page"`, and hides ellipsis spans from screen readers.
 */
export function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  showFirstLast = false,
  showPageSize = false,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  size = 'md',
  disabled = false,
  className,
  style,
}: PaginationProps): React.ReactElement {
  // Normalize inputs so the UI stays consistent if `currentPage`/`pageSize`
  // drift out of range (e.g. when totalCount shrinks).
  const safePageSize = Math.max(1, Math.floor(pageSize) || 1);
  const totalPages = Math.max(1, Math.ceil(Math.max(0, totalCount) / safePageSize));
  const safeCurrentPage = Math.min(Math.max(1, Math.floor(currentPage) || 1), totalPages);
  const items = buildPaginationItems(safeCurrentPage, totalPages, siblingCount, boundaryCount);

  const goTo = (page: number) => {
    if (!disabled && page >= 1 && page <= totalPages && page !== safeCurrentPage) {
      onPageChange(page);
    }
  };

  return (
    <nav
      aria-label="Pagination"
      className={classNames(styles.pagination, SIZE_CLASS[size], className)}
      style={style}
    >
      {/* Page size selector */}
      {showPageSize && onPageSizeChange && (
        <div className={styles.pageSizeWrapper}>
          <span className={styles.pageSizeLabel}>Rows per page:</span>
          <select
            className={styles.pageSizeSelect}
            value={safePageSize}
            disabled={disabled}
            aria-label="Rows per page"
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Page controls */}
      <div className={styles.controls}>
        {/* First page */}
        {showFirstLast && (
          <button
            type="button"
            className={styles.btn}
            disabled={disabled || safeCurrentPage <= 1}
            onClick={() => goTo(1)}
            aria-label="First page"
          >
            «
          </button>
        )}

        {/* Previous page */}
        <button
          type="button"
          className={styles.btn}
          disabled={disabled || safeCurrentPage <= 1}
          onClick={() => goTo(safeCurrentPage - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>

        {/* Page numbers / ellipses */}
        {items.map((item, idx) =>
          item === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className={styles.ellipsis} aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={classNames(
                styles.btn,
                item === safeCurrentPage ? styles.btnActive : undefined
              )}
              disabled={disabled}
              onClick={() => goTo(item)}
              aria-label={`Page ${item}`}
              aria-current={item === safeCurrentPage ? 'page' : undefined}
            >
              {item}
            </button>
          )
        )}

        {/* Next page */}
        <button
          type="button"
          className={styles.btn}
          disabled={disabled || safeCurrentPage >= totalPages}
          onClick={() => goTo(safeCurrentPage + 1)}
          aria-label="Next page"
        >
          ›
        </button>

        {/* Last page */}
        {showFirstLast && (
          <button
            type="button"
            className={styles.btn}
            disabled={disabled || safeCurrentPage >= totalPages}
            onClick={() => goTo(totalPages)}
            aria-label="Last page"
          >
            »
          </button>
        )}
      </div>
    </nav>
  );
}

Pagination.displayName = 'Pagination';
