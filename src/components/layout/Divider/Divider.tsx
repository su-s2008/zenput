import React, { forwardRef } from 'react';
import { classNames } from '../../../utils';
import styles from './Divider.module.css';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation. Default: `'horizontal'`. */
  orientation?: DividerOrientation;
  /** Strong border color instead of subtle. */
  strong?: boolean;
  /** Optional inline label (horizontal dividers only). */
  label?: React.ReactNode;
  className?: string;
}

/**
 * Horizontal or vertical divider. Use `label` to render a centered
 * inline label with divider lines on either side.
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  {
    orientation = 'horizontal',
    strong,
    label,
    className,
    role = 'separator',
    ...rest
  },
  ref
) {
  if (label && orientation === 'horizontal') {
    return (
      <div
        ref={ref}
        role={role}
        aria-orientation={orientation}
        className={classNames(
          styles.divider,
          styles.horizontal,
          styles.labelWrapper,
          strong ? styles.labelWrapperStrong : undefined,
          className
        )}
        {...rest}
      >
        <span>{label}</span>
      </div>
    );
  }
  return (
    <div
      ref={ref}
      role={role}
      aria-orientation={orientation}
      className={classNames(
        styles.divider,
        orientation === 'vertical' ? styles.vertical : styles.horizontal,
        strong ? styles.strong : undefined,
        className
      )}
      {...rest}
    />
  );
});