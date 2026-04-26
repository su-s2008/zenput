import React from 'react';
import { classNames } from '../../../utils';
import styles from './Skeleton.module.css';

export type SkeletonVariant = 'text' | 'rect' | 'circle';
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none';

export interface SkeletonProps extends React.HTMLAttributes<HTMLElement> {
  /** Width of the skeleton (e.g. `'100%'`, `200`, `'12rem'`). */
  width?: number | string;
  /** Height of the skeleton. */
  height?: number | string;
  /** Border radius override. Ignored when `variant="circle"`. */
  radius?: number | string;
  /** Shape variant. Default: `'rect'`. */
  variant?: SkeletonVariant;
  /** Animation style. Default: `'shimmer'`. */
  animation?: SkeletonAnimation;
  /**
   * When `false` the actual children are rendered instead of the skeleton.
   * Useful for wrapping real content: `<Skeleton loading={isLoading}>…</Skeleton>`.
   * Default: `true`.
   */
  loading?: boolean;
  /** Polymorphic element type. Default: `'span'`. */
  as?: React.ElementType;
  className?: string;
}

function toPx(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * Block-level loading placeholder that supports shimmer and pulse animations.
 *
 * Set `loading={false}` to render actual children once data is ready.
 * Use `variant="circle"` for avatar placeholders and `variant="text"` for
 * inline text lines.
 */
export function Skeleton({
  width,
  height,
  radius,
  variant = 'rect',
  animation = 'shimmer',
  loading = true,
  as: Tag = 'span',
  className,
  style,
  children,
  ...rest
}: SkeletonProps): React.ReactElement {
  if (!loading) {
    return (<>{children}</>) as React.ReactElement;
  }

  const inlineStyle: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width: toPx(width) } : {}),
    ...(height !== undefined ? { height: toPx(height) } : {}),
    ...(radius !== undefined && variant !== 'circle' ? { borderRadius: toPx(radius) } : {}),
  };

  return (
    <Tag
      {...rest}
      aria-hidden="true"
      className={classNames(
        styles.skeleton,
        styles[`variant-${variant}`],
        animation === 'shimmer' ? styles.shimmer : undefined,
        animation === 'pulse' ? styles.pulse : undefined,
        className
      )}
      style={inlineStyle}
    />
  );
}

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Number of text lines to render. Default: `3`. */
  lines?: number;
  /** Animation style. Default: `'shimmer'`. */
  animation?: SkeletonAnimation;
  /** Width of the last line as a fraction of the container (0–1). Default: `0.6`. */
  lastLineWidth?: number;
}

/**
 * Convenience component that renders multiple text-skeleton lines.
 */
export function SkeletonText({
  lines = 3,
  animation = 'shimmer',
  lastLineWidth = 0.6,
  className,
  style,
  ...rest
}: SkeletonTextProps): React.ReactElement {
  return (
    <span
      {...rest}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', ...style }}
      aria-hidden="true"
      className={className}
    >
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          variant="text"
          animation={animation}
          height="1em"
          width={i === lines - 1 && lines > 1 ? `${lastLineWidth * 100}%` : '100%'}
        />
      ))}
    </span>
  );
}

export interface SkeletonAvatarProps extends React.HTMLAttributes<HTMLElement> {
  /** Size of the circular avatar placeholder in pixels. Default: `40`. */
  size?: number;
  /** Animation style. Default: `'shimmer'`. */
  animation?: SkeletonAnimation;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Convenience component that renders a circular skeleton for avatar placeholders.
 */
export function SkeletonAvatar({
  size = 40,
  animation = 'shimmer',
  className,
  style,
  ...rest
}: SkeletonAvatarProps): React.ReactElement {
  return (
    <Skeleton
      variant="circle"
      animation={animation}
      width={size}
      height={size}
      className={className}
      style={style}
      {...rest}
    />
  );
}
