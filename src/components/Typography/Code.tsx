'use client';
import React, { forwardRef } from 'react';
import { classNames } from '../../utils';
import { Slot } from '../../utils/slot';
import type { PolymorphicProps, PolymorphicRef } from '../../types/polymorphic';
import { createPolymorphicComponent } from '../../types/polymorphic';
import styles from './Typography.module.css';

export interface CodeOwnProps {
  className?: string;
}

type CodeComponent = <C extends React.ElementType = 'code'>(
  props: PolymorphicProps<C, CodeOwnProps> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null;

/** Inline monospace code snippet. Polymorphic via `as`/`asChild`. */
export const Code = createPolymorphicComponent<CodeComponent>(
  forwardRef(function Code(
  { as, asChild, className, children, ...rest }: PolymorphicProps<React.ElementType, CodeOwnProps>,
  ref: React.ForwardedRef<Element>
) {
  const Component: React.ElementType = asChild ? Slot : (as ?? 'code');
  return (
    <Component ref={ref} className={classNames(styles.code, className)} {...rest}>
      {children}
    </Component>
  );
}),
'Code'
);

/** @deprecated Use `CodeOwnProps` or the component's inferred props instead. */
export type CodeProps = PolymorphicProps<'code', CodeOwnProps>;
