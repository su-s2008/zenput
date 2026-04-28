'use client';
import React, { forwardRef } from 'react';
import { classNames } from '../../utils';
import { Slot } from '../../utils/slot';
import type { PolymorphicProps, PolymorphicRef } from '../../types/polymorphic';
import { createPolymorphicComponent } from '../../types/polymorphic';
import styles from './Typography.module.css';

export interface KbdOwnProps {
  className?: string;
}

type KbdComponent = <C extends React.ElementType = 'kbd'>(
  props: PolymorphicProps<C, KbdOwnProps> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null;

/** Keyboard-key inline primitive. Polymorphic via `as`/`asChild`. */
export const Kbd = createPolymorphicComponent<KbdComponent>(
  forwardRef(function Kbd(
  { as, asChild, className, children, ...rest }: PolymorphicProps<React.ElementType, KbdOwnProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component: React.ElementType = asChild ? Slot : (as ?? 'kbd');
  return (
    <Component ref={ref} className={classNames(styles.kbd, className)} {...rest}>
      {children}
    </Component>
  );
}),
'Kbd'
);

/** @deprecated Use `KbdOwnProps` or the component's inferred props instead. */
export type KbdProps = PolymorphicProps<'kbd', KbdOwnProps>;
