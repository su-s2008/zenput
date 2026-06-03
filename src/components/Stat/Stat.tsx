'use client';
import React from 'react';
import { classNames } from '../../utils';
import { Skeleton } from '../feedback/Skeleton';
import type { StatDelta, StatDeltaDirection, StatProps } from './Stat.types';
import styles from './Stat.module.css';

function resolveDirection(delta: StatDelta): StatDeltaDirection {
  if (delta.direction) return delta.direction;
  if (typeof delta.value === 'number') {
    if (delta.value > 0) return 'up';
    if (delta.value < 0) return 'down';
  }
  return 'flat';
}

function resolveColorClass(direction: StatDeltaDirection, invert: boolean): string {
  // `direction` describes the metric change; `invert` flips which direction is "good".
  if (direction === 'flat') return styles['delta-flat'];
  const isGood = invert ? direction === 'down' : direction === 'up';
  return isGood ? styles['delta-up'] : styles['delta-down'];
}

function ArrowUp() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={styles.deltaArrow}>
      <path d="M6 2 L10 7 H7.5 V10 H4.5 V7 H2 Z" fill="currentColor" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={styles.deltaArrow}>
      <path d="M6 10 L2 5 H4.5 V2 H7.5 V5 H10 Z" fill="currentColor" />
    </svg>
  );
}

function ArrowFlat() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className={styles.deltaArrow}>
      <rect x="2" y="5.25" width="8" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  );
}

function signFor(direction: StatDeltaDirection): string {
  if (direction === 'up') return '+';
  if (direction === 'down') return '−';
  return '';
}

function defaultLabel(delta: StatDelta, direction: StatDeltaDirection): string {
  if (typeof delta.value === 'number') {
    return `${signFor(direction)}${Math.abs(delta.value)}`;
  }
  return direction === 'flat' ? 'No change' : '';
}

function arrowFor(direction: StatDeltaDirection): React.ReactNode {
  if (direction === 'up') return <ArrowUp />;
  if (direction === 'down') return <ArrowDown />;
  return <ArrowFlat />;
}

function StatHeader({
  label,
  value,
  icon,
  loading,
}: Readonly<{
  label: React.ReactNode;
  value: React.ReactNode;
  icon: React.ReactNode | undefined;
  loading: boolean;
}>): React.ReactElement {
  return (
    <div className={styles.header}>
      <div className={styles.headerText}>
        <p className={styles.label}>{label}</p>
        {loading ? (
          <Skeleton variant="text" height="2rem" width="60%" />
        ) : (
          <p className={styles.value}>{value}</p>
        )}
      </div>
      {icon ? <span className={styles.iconChip}>{icon}</span> : null}
    </div>
  );
}

function StatDeltaBadge({ delta }: Readonly<{ delta: StatDelta }>): React.ReactElement {
  const direction = resolveDirection(delta);
  const colorClass = resolveColorClass(direction, Boolean(delta.invert));
  const deltaLabel = delta.label ?? defaultLabel(delta, direction);

  return (
    <div className={styles.deltaRow}>
      <span className={classNames(styles.delta, colorClass)}>
        {arrowFor(direction)}
        {deltaLabel}
      </span>
      {delta.caption ? <span className={styles.deltaCaption}>{delta.caption}</span> : null}
    </div>
  );
}

/**
 * Single metric/KPI card with label, value, optional hint, optional icon chip,
 * delta badge (with up/down/flat color & arrow), and trend slot (e.g. sparkline).
 *
 * Pair with `loading` to render skeletons in place while preserving height.
 */
export function Stat({
  label,
  value,
  hint,
  icon,
  tone = 'neutral',
  delta,
  trend,
  size = 'md',
  loading = false,
  className,
  style,
}: Readonly<StatProps>): React.ReactElement {
  return (
    <article
      className={classNames(styles.stat, styles[`size-${size}`], styles[`tone-${tone}`], className)}
      style={style}
    >
      <StatHeader label={label} value={value} icon={icon} loading={loading} />

      {loading ? (
        <Skeleton variant="text" height="1rem" width="40%" />
      ) : (
        <>
          {hint ? <p className={styles.hint}>{hint}</p> : null}
          {delta ? <StatDeltaBadge delta={delta} /> : null}
        </>
      )}

      {trend ? <div className={styles.trend}>{trend}</div> : null}
    </article>
  );
}

Stat.displayName = 'Stat';
