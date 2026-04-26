import React from 'react';

export type EmptyStateSize = 'sm' | 'md' | 'lg';
export type EmptyStateVariant = 'default' | 'search' | 'error';

export interface EmptyStateAction {
  /** Button or link label. */
  label: string;
  /** Click handler (renders a `<button>` when provided). */
  onClick?: () => void;
  /** Href (renders an `<a>` when provided and onClick is omitted). */
  href?: string;
}

export interface EmptyStateProps {
  /**
   * Optional icon node displayed above the title.
   * Pass an SVG icon, emoji, or any React node.
   */
  icon?: React.ReactNode;
  /** Main heading text. */
  title: string;
  /** Optional supporting text below the title. */
  description?: string;
  /** Primary call-to-action. */
  primaryAction?: EmptyStateAction;
  /** Secondary call-to-action. */
  secondaryAction?: EmptyStateAction;
  /** Visual size variant. Defaults to 'md'. */
  size?: EmptyStateSize;
  /** Semantic variant that adjusts colours/icon defaults. Defaults to 'default'. */
  variant?: EmptyStateVariant;
  /** Additional CSS class applied to the root element. */
  className?: string;
  /** Additional inline style applied to the root element. */
  style?: React.CSSProperties;
}
