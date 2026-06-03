import React from 'react';

export type StatTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

export type StatDeltaDirection = 'up' | 'down' | 'flat';

export interface StatDelta {
  /** Display value (e.g. '+12.4%' or '−3'). When omitted, computed from `value`. */
  label?: string;
  /** Numeric value used to derive direction when `direction` is not provided. */
  value?: number;
  /**
   * Direction of change. Defaults to derived from `value` (>0 'up', <0 'down', else 'flat').
   * Direction drives the color, not whether it's "good": pair with `invert` for cases like
   * "errors went down" (down = good).
   */
  direction?: StatDeltaDirection;
  /**
   * When true, swaps the success/danger colors. Use for metrics where "down is good"
   * (e.g. error rates, latency).
   */
  invert?: boolean;
  /** Optional small caption next to the delta (e.g. 'vs last month'). */
  caption?: string;
}

export type StatSize = 'sm' | 'md' | 'lg';

export interface StatProps {
  /** Caption above the value (e.g. 'Total revenue'). */
  label: React.ReactNode;
  /** Primary metric value (already formatted by the caller). */
  value: React.ReactNode;
  /** Optional supporting line under the value. */
  hint?: React.ReactNode;
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Tone applied to the icon chip and accent border. Defaults to 'neutral'. */
  tone?: StatTone;
  /** Delta badge configuration (e.g. percentage change vs previous period). */
  delta?: StatDelta;
  /** Trend node (sparkline, chart, etc.) rendered at the bottom of the card. */
  trend?: React.ReactNode;
  /** Size preset. Defaults to 'md'. */
  size?: StatSize;
  /**
   * When true, renders skeleton placeholders in place of value/hint/delta.
   * The label is still rendered so the card height is stable.
   */
  loading?: boolean;
  /** Additional CSS class on the root. */
  className?: string;
  /** Additional inline style on the root. */
  style?: React.CSSProperties;
}
