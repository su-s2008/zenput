'use client';
import React, { forwardRef } from 'react';
import { classNames } from '../../../utils';
import { Slot } from '../../../utils/slot';
import type { PolymorphicProps, PolymorphicRef } from '../../../types/polymorphic';
import { createPolymorphicComponent } from '../../../types/polymorphic';
import styles from './Divider.module.css';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerOwnProps {
  /** Orientation. Default: `'horizontal'`. */
  orientation?: DividerOrientation;
  /** Strong border color instead of subtle. */
  strong?: boolean;
  /** Optional inline label (horizontal dividers only). */
  label?: React.ReactNode;
  className?: string;
  role?: string;
}

type DividerComponent = <C extends React.ElementType = 'div'>(
  props: PolymorphicProps<C, DividerOwnProps> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null;

/**
 * Horizontal or vertical divider. Use `label` to render a centered
 * inline label with divider lines on either side. Polymorphic via `as`/`asChild`.
 */
export const Divider = createPolymorphicComponent<DividerComponent>(
  forwardRef(function Divider(
  {
    as,
    asChild,
    orientation = 'horizontal',
    strong,
    label,
    className,
    role = 'separator',
    ...rest
  }: PolymorphicProps<React.ElementType, DividerOwnProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component: React.ElementType = asChild ? Slot : (as ?? 'div');

  if (label && orientation === 'horizontal') {
    return (
      <Component
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
      </Component>
    );
  }
  return (
    <Component
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
}),
'Divider'
);

/** @deprecated Use `DividerOwnProps` or the component's inferred props instead. */
export type DividerProps = PolymorphicProps<'div', DividerOwnProps>;
