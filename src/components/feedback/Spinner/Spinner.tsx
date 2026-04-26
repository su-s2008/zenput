import React from 'react';
import { classNames } from '../../../utils';
import { VisuallyHidden } from '../VisuallyHidden';
import styles from './Spinner.module.css';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Spinner size. Default: `'md'`. */
  size?: SpinnerSize;
  /** Border thickness override (e.g. `'3px'`). Uses CSS size-appropriate default when omitted. */
  thickness?: string;
  /** Accessible label announced to screen readers. Default: `'Loading…'`. */
  label?: string;
  className?: string;
}

/**
 * Animated loading indicator with `role="status"` and a visually-hidden
 * accessible label.
 *
 * Use `label` to localise the announcement (e.g. `label="Cargando…"`).
 * Setting `label=""` suppresses the status role entirely — only do this
 * when a parent element already communicates the loading state.
 */
export function Spinner({
  size = 'md',
  thickness,
  label = 'Loading…',
  className,
  style,
  ...rest
}: SpinnerProps): React.ReactElement {
  return (
    <span
      role={label ? 'status' : undefined}
      className={classNames(styles.spinner, styles[`size-${size}`], className)}
      style={thickness ? { ...style, borderWidth: thickness } : style}
      {...rest}
    >
      {label && <VisuallyHidden>{label}</VisuallyHidden>}
    </span>
  );
}
