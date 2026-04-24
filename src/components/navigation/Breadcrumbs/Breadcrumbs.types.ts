import React from 'react';

export interface BreadcrumbItem {
  /**
   * Optional stable key. If omitted, the item's `href` is used; falls back
   * to position index. Provide an explicit `id` if items can be reordered.
   */
  id?: string;
  /** Display label for this breadcrumb step. */
  label: React.ReactNode;
  /** URL for the breadcrumb link. Omit to render plain text (typically the current page). */
  href?: string;
  /** Override the rendered link element, e.g. a React Router `<Link>`. Default: `'a'`. */
  as?: React.ElementType;
  /** Extra props forwarded to the link/element (e.g. `target`, `rel`). */
  linkProps?: React.AnchorHTMLAttributes<HTMLAnchorElement> & Record<string, unknown>;
}

export interface BreadcrumbsProps {
  /** Ordered list of breadcrumb items from root to current page. */
  items: BreadcrumbItem[];
  /**
   * Accessible label for the `<nav>` landmark.
   * Default: `'Breadcrumb'`.
   */
  'aria-label'?: string;
  /**
   * Separator rendered between items.
   * Default: `'/'`.
   */
  separator?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
