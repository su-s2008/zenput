'use client';
import React, { forwardRef } from 'react';
import { classNames } from '../../../utils';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeVariant = 'solid' | 'subtle' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic tone. Default: `'brand'`. */
  tone?: BadgeTone;
  /** Visual variant. Default: `'subtle'`. */
  variant?: BadgeVariant;
  /** Size. Default: `'md'`. */
  size?: BadgeSize;
  /** Render a small dot instead of a labeled pill. */
  dot?: boolean;
  /** Numeric count; values above `max` render as `{max}+`. */
  count?: number;
  /** Maximum displayable count before truncating. Default: `99`. */
  max?: number;
  /** When `count` is 0, render '0' instead of hiding the badge. Default: `false`. */
  showZero?: boolean;
  className?: string;
}

/**
 * Small status / count indicator. Supports labeled pills (with optional
 * numeric count capped by `max`) and a minimal `dot` variant.
 *
 * When `count` is `0`, the badge is hidden unless `showZero` is set,
 * matching the common "empty-count" convention used by Fluent and Ant.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    tone = 'brand',
    variant = 'subtle',
    size = 'md',
    dot,
    count,
    max = 99,
    showZero = false,
    className,
    children,
    ...rest
  },
  ref
) {
  // Hide a labelled count badge when count is 0 unless showZero is requested.
  if (!dot && count === 0 && !showZero && children === undefined) {
    return null;
  }
  let content: React.ReactNode = children;
  if (!dot && count !== undefined && children === undefined) {
    content = count > max ? `${max}+` : String(count);
  }
  return (
    <span
      ref={ref}
      className={classNames(
        styles.badge,
        styles[`tone-${tone}`],
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        dot ? styles.dot : undefined,
        className
      )}
      {...rest}
    >
      {!dot && content}
    </span>
  );
});
