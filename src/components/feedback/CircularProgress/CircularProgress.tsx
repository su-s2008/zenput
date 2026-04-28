'use client';
import React from 'react';
import { classNames } from '../../../utils';
import styles from './CircularProgress.module.css';

export type CircularProgressSize = 'sm' | 'md' | 'lg';
export type CircularProgressStatus = 'default' | 'success' | 'warning' | 'error';

const sizeMap: Record<CircularProgressSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
};

const thicknessMap: Record<CircularProgressSize, number> = {
  sm: 3,
  md: 4,
  lg: 5,
};

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current progress value (0–`max`). Ignored when `indeterminate` is true. */
  value?: number;
  /** Maximum value. Default: `100`. */
  max?: number;
  /** When true, shows an animated indeterminate ring. */
  indeterminate?: boolean;
  /** Visual size. Default: `'md'`. */
  size?: CircularProgressSize;
  /** Override the pixel diameter. */
  diameter?: number;
  /** Override the stroke thickness in pixels. */
  thickness?: number;
  /** Semantic status color. Default: `'default'`. */
  status?: CircularProgressStatus;
  /** Accessible label. */
  label?: string;
  /** Show the numeric value inside/below the ring. */
  showValue?: boolean;
  className?: string;
}

/**
 * Circular progress indicator (SVG ring).
 *
 * Supports determinate and indeterminate modes, size variants, and
 * semantic status colours.
 *
 * Renders with `role="progressbar"` and the appropriate `aria-value*`
 * attributes for assistive technology.
 */
export function CircularProgress({
  value = 0,
  max = 100,
  indeterminate = false,
  size = 'md',
  diameter: diameterProp,
  thickness: thicknessProp,
  status = 'default',
  label,
  showValue = false,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: CircularProgressProps): React.ReactElement {
  const diameter = diameterProp ?? sizeMap[size];
  const thickness = thicknessProp ?? thicknessMap[size];
  // Normalize `max` to a non-negative number so consumers can't produce
  // invalid ARIA values (e.g. aria-valuemin=0 with a negative aria-valuenow).
  const safeMax = Math.max(max, 0);
  // Prefer an explicit `aria-label`/`aria-labelledby` passed by the consumer;
  // fall back to the `label` prop so the progressbar always has an accessible name.
  const accessibleLabel = ariaLabel ?? label;

  const clampedValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = safeMax > 0 ? (clampedValue / safeMax) * 100 : 0;

  // SVG ring calculation
  const radius = (diameter - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = indeterminate ? 0 : circumference - (percentage / 100) * circumference;
  const cx = diameter / 2;
  const cy = diameter / 2;

  return (
    <div
      className={classNames(
        styles.wrapper,
        status !== 'default' ? styles[`status-${status}`] : undefined,
        indeterminate ? styles.indeterminate : undefined,
        className
      )}
      {...rest}
    >
      <svg
        className={styles.svg}
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clampedValue}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuetext={indeterminate ? undefined : `${Math.round(percentage)}%`}
        aria-label={accessibleLabel}
        aria-labelledby={ariaLabelledBy}
      >
        <circle className={styles.track} cx={cx} cy={cy} r={radius} strokeWidth={thickness} />
        <circle
          className={styles.fill}
          cx={cx}
          cy={cy}
          r={radius}
          strokeWidth={thickness}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={indeterminate ? undefined : offset}
        />
      </svg>
      {showValue && !indeterminate && (
        <span className={styles.label} aria-hidden="true">
          {Math.round(percentage)}%
        </span>
      )}
      {label && !showValue && <span className={styles.label}>{label}</span>}
    </div>
  );
}
