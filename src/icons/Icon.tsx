import React, { forwardRef } from 'react';
import { classNames } from '../utils';
import styles from './Icon.module.css';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  /**
   * Icon size in pixels or any CSS length. Applied to both width and
   * height. Default: `'1em'` (inherits from surrounding text).
   */
  size?: number | string;
  /** Accessible label. If omitted the icon is marked decorative. */
  label?: string;
  /** Raw children (e.g. `<path />`). */
  children?: React.ReactNode;
  /** Additional className forwarded to the `<svg>` element. */
  className?: string;
}

/**
 * Generic SVG icon wrapper. Use directly by passing `<path>` children or
 * compose built-in icons (see `./icons/`). Handles sizing, `currentColor`
 * inheritance, and a11y: when `label` is omitted, the SVG gets
 * `aria-hidden="true"` and is treated as decorative.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { size = '1em', label, className, children, viewBox = '0 0 24 24', ...rest },
  ref
) {
  const decorative = !label;
  return (
    <svg
      {...rest}
      ref={ref}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={label}
      focusable="false"
      width={size}
      height={size}
      viewBox={viewBox}
      className={classNames(styles.icon, className)}
    >
      {children}
    </svg>
  );
});
