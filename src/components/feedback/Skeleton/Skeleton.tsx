'use client';
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
}: Readonly<SkeletonProps>): React.ReactElement {
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
}: Readonly<SkeletonTextProps>): React.ReactElement {
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
}: Readonly<SkeletonAvatarProps>): React.ReactElement {
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

export interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of skeleton rows to render. Default: `5`. */
  rows?: number;
  /** Number of columns. Default: `4`. */
  columns?: number;
  /** When true, includes a header row with bolder skeletons. Default: `true`. */
  showHeader?: boolean;
  /** Animation style. Default: `'shimmer'`. */
  animation?: SkeletonAnimation;
  /** Row height (CSS value). Default: `'1.25rem'`. */
  rowHeight?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Convenience preset that renders a rectangular grid of skeleton cells,
 * intended as a placeholder for `<table>`-style content while data loads.
 *
 * Marked `aria-hidden` so it does not pollute the accessibility tree.
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  animation = 'shimmer',
  rowHeight = '1.25rem',
  className,
  style,
  ...rest
}: Readonly<SkeletonTableProps>): React.ReactElement {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: '0.75rem',
    ...style,
  };
  return (
    <div {...rest} aria-hidden="true" className={className} style={gridStyle}>
      {showHeader
        ? Array.from({ length: columns }, (_, c) => (
            <Skeleton
              key={`h-${c}`}
              variant="rect"
              animation={animation}
              height="1rem"
              width="60%"
            />
          ))
        : null}
      {Array.from({ length: rows * columns }, (_, i) => (
        <Skeleton
          key={`c-${i}`}
          variant="rect"
          animation={animation}
          height={rowHeight}
          width="100%"
        />
      ))}
    </div>
  );
}

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show a circular avatar in the header. Default: `false`. */
  showAvatar?: boolean;
  /** Show a 16:9 media block at the top. Default: `false`. */
  showMedia?: boolean;
  /** Number of body text lines. Default: `3`. */
  lines?: number;
  /** Show a footer action row of two short skeletons. Default: `false`. */
  showFooter?: boolean;
  /** Animation style. Default: `'shimmer'`. */
  animation?: SkeletonAnimation;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Convenience preset that approximates a `<Card>` while content loads:
 * optional media block, optional avatar + title/subtitle header, a few text
 * lines, and an optional footer action row.
 */
export function SkeletonCard({
  showAvatar = false,
  showMedia = false,
  lines = 3,
  showFooter = false,
  animation = 'shimmer',
  className,
  style,
  ...rest
}: Readonly<SkeletonCardProps>): React.ReactElement {
  const rootStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    padding: '1rem',
    border: '1px solid var(--zp-color-border-subtle, #e5e7eb)',
    borderRadius: 'var(--zp-radius-lg, 12px)',
    background: 'var(--zp-color-surface-elevated, #ffffff)',
    ...style,
  };
  return (
    <div {...rest} aria-hidden="true" className={className} style={rootStyle}>
      {showMedia ? (
        <Skeleton variant="rect" animation={animation} width="100%" height="9rem" radius={8} />
      ) : null}
      {showAvatar ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SkeletonAvatar size={36} animation={animation} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
            <Skeleton variant="text" animation={animation} width="50%" height="0.875rem" />
            <Skeleton variant="text" animation={animation} width="30%" height="0.75rem" />
          </span>
        </span>
      ) : null}
      <SkeletonText lines={lines} animation={animation} />
      {showFooter ? (
        <span style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <Skeleton variant="rect" animation={animation} width="5rem" height="2rem" radius={6} />
          <Skeleton variant="rect" animation={animation} width="5rem" height="2rem" radius={6} />
        </span>
      ) : null}
    </div>
  );
}
