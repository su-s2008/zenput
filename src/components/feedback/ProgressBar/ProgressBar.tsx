'use client';
import React from 'react';
import { classNames } from '../../../utils';
import styles from './ProgressBar.module.css';

export type ProgressBarSize = 'sm' | 'md' | 'lg';
export type ProgressBarStatus = 'default' | 'success' | 'warning' | 'error';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current progress value (0–`max`). Ignored when `indeterminate` is true. */
  value?: number;
  /** Maximum value. Default: `100`. */
  max?: number;
  /** When true, shows an animated indeterminate bar. */
  indeterminate?: boolean;
  /** Bar height variant. Default: `'md'`. */
  size?: ProgressBarSize;
  /** Semantic status color. Default: `'default'`. */
  status?: ProgressBarStatus;
  /** Accessible label for the progress bar. */
  label?: string;
  /** Show the numeric value next to the label. */
  showValue?: boolean;
  /** Render diagonal stripe pattern on the fill. */
  striped?: boolean;
  className?: string;
}

/**
 * Horizontal progress indicator.
 *
 * Supports determinate (`value`/`max`) and indeterminate modes, size
 * variants, semantic status colors, striped fill, and an optional
 * visible label + value.
 *
 * Renders with `role="progressbar"` and the appropriate `aria-value*`
 * attributes for assistive technology.
 */
export function ProgressBar({
  value = 0,
  max = 100,
  indeterminate = false,
  size = 'md',
  status = 'default',
  label,
  showValue = false,
  striped = false,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: ProgressBarProps): React.ReactElement {
  // Normalize `max` to a non-negative number so consumers can't produce
  // invalid ARIA values (e.g. aria-valuemin=0 with a negative aria-valuenow).
  const safeMax = Math.max(max, 0);
  const clampedValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = safeMax > 0 ? (clampedValue / safeMax) * 100 : 0;
  // Prefer an explicit `aria-label`/`aria-labelledby` passed by the consumer;
  // fall back to the `label` prop so the progressbar always has an accessible name.
  const accessibleLabel = ariaLabel ?? label;

  return (
    <div
      className={classNames(
        styles.wrapper,
        styles[`size-${size}`],
        status !== 'default' ? styles[`status-${status}`] : undefined,
        indeterminate ? styles.indeterminate : undefined,
        striped ? styles.striped : undefined,
        className
      )}
      {...rest}
    >
      {(label || showValue) && (
        <div className={styles.labelRow}>
          {label && <span>{label}</span>}
          {showValue && !indeterminate && <span aria-hidden="true">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clampedValue}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuetext={indeterminate ? undefined : `${Math.round(percentage)}%`}
        aria-label={accessibleLabel}
        aria-labelledby={ariaLabelledBy}
        className={classNames(styles.track, styles[`size-${size}`])}
      >
        <div
          className={styles.fill}
          style={indeterminate ? undefined : { width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
